"""
Discovery Service - Main orchestration service
"""

from typing import Dict, Any, Optional, AsyncIterator
from datetime import datetime, timezone
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError as FutureTimeoutError
from sqlalchemy.orm import Session

from app.services.base_service import BaseService
from app.services.profile_analysis_service import ProfileAnalysisService
from app.services.tool_service import ToolService
from app.services.prompt_builder import PromptBuilder
from app.services.llm_service import LLMService
from app.services.result_assembler import ResultAssembler
from app.services.cache_service import CacheService
from app.services.error_log_service import ErrorLogService
from app.models.run import Run
from app.models.discovery_result import DiscoveryResult
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.logger import log_discovery_run, run_id_var


class DiscoveryService(BaseService):
    """Main orchestration service for the discovery pipeline."""

    def __init__(self, db: Session, redis_client=None):
        super().__init__(db, redis_client)
        self.profile_service = ProfileAnalysisService(db, redis_client)
        self.tool_service = ToolService(db, redis_client)
        self.prompt_builder = PromptBuilder()
        self.llm_service = LLMService(db, redis_client)
        self.result_assembler = ResultAssembler()
        self.cache_service = CacheService(db, redis_client)
        self.error_log_service = ErrorLogService(db, redis_client)

    # ----------------------------------------------------------------------
    # PUBLIC API
    # ----------------------------------------------------------------------
    def run_discovery(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> Dict[str, Any]:
        
        # Track timing for structured logging
        timestamp_start = datetime.now(timezone.utc)
        start_time = time.perf_counter()
        cache_hit = False
        error_message = None
        
        # Set run_id in context for logging
        if run_id:
            run_id_var.set(run_id)

        # Check cache before running any LLM steps
        cache_key = self.cache_service.build_discovery_cache_key(inputs, user_id)
        cached_result = self.cache_service.get_json(cache_key, cache_type="discovery")
        
        if cached_result:
            cache_hit = True
            # Return cached result immediately
            # Create or fetch run record for tracking
            if run_id:
                run = self.db.query(Run).filter(Run.run_id == run_id).first()
                if not run:
                    run = Run(
                        run_id=run_id,
                        user_id=user_id,
                        inputs=inputs,
                        status="completed",
                        created_at=datetime.now(timezone.utc),
                        completed_at=datetime.now(timezone.utc)
                    )
                    self.db.add(run)
            else:
                run = Run(
                    user_id=user_id,
                    inputs=inputs,
                    status="completed",
                    created_at=datetime.now(timezone.utc),
                    completed_at=datetime.now(timezone.utc)
                )
                self.db.add(run)
                self.db.commit()
                self.db.refresh(run)
            
            # Update discovery result if it exists
            discovery_result = self.db.query(DiscoveryResult).filter(
                DiscoveryResult.run_id == run.run_id
            ).first()
            
            if discovery_result:
                discovery_result.result = cached_result
                discovery_result.status = "completed"
                discovery_result.error_message = None
            else:
                discovery_result = DiscoveryResult(
                    run_id=run.run_id,
                    input_payload=inputs,
                    result=cached_result,
                    status="completed"
                )
                self.db.add(discovery_result)
            
            self.db.commit()
            
            # Log structured discovery run (cached)
            timestamp_end = datetime.now(timezone.utc)
            duration_ms = (time.perf_counter() - start_time) * 1000
            log_discovery_run(
                run_id=run.run_id,
                user_id=user_id,
                timestamp_start=timestamp_start,
                timestamp_end=timestamp_end,
                total_duration_ms=duration_ms,
                cache_hit=True
            )
            run_id_var.set(None)  # Clear context
            
            return {
                "success": True,
                "run_id": run.run_id,
                "outputs": cached_result,
                "cached": True,
                "cache_hit": True
            }

        # Create or fetch run record
        if run_id:
            run = self.db.query(Run).filter(Run.run_id == run_id).first()
            if not run:
                raise ValueError(f"Run {run_id} not found")
            # Update run_id in context
            run_id_var.set(run_id)
        else:
            run = Run(
                user_id=user_id,
                inputs=inputs,
                status="processing",
                created_at=datetime.now(timezone.utc)
            )
            self.db.add(run)
            self.db.commit()
            self.db.refresh(run)
            # Set run_id in context after creation
            run_id_var.set(run.run_id)

        try:
            # Run pipeline
            if settings.PARALLEL_EXECUTION:
                results = self._run_parallel(inputs, run_id=run.run_id)
            else:
                results = self._run_sequential(inputs, run_id=run.run_id)

            # Assemble structured outputs
            final_outputs = self.result_assembler.assemble(
                profile_analysis=results["profile_analysis"],
                stage2_output=results["recommendations"]
            )

            # Save completed run
            run.status = "completed"
            run.profile_analysis = final_outputs["profile_analysis"]
            run.personalized_recommendations = final_outputs["personalized_recommendations"]
            run.reports = final_outputs
            run.completed_at = datetime.now(timezone.utc)
            self.db.commit()

            # Update discovery result if it exists (created by background task)
            # Otherwise create it (for synchronous execution)
            discovery_result = self.db.query(DiscoveryResult).filter(
                DiscoveryResult.run_id == run.run_id
            ).first()
            
            if discovery_result:
                # Update existing record
                discovery_result.result = final_outputs
                discovery_result.status = "completed"
                discovery_result.error_message = None
            else:
                # Create new record (for synchronous execution)
                discovery_result = DiscoveryResult(
                    run_id=run.run_id,
                    input_payload=inputs,
                    result=final_outputs,
                    status="completed"
                )
                self.db.add(discovery_result)
            
            self.db.commit()

            # Store in cache (7 days TTL)
            # Only cache successful completions, not failures
            # This also stores a backup copy in Postgres via CacheService.set()
            self.cache_service.set_json(
                cache_key,
                final_outputs,
                cache_type="discovery",
                ttl_seconds=60 * 60 * 24 * 7  # 7 days
            )

            # Log structured discovery run (success)
            timestamp_end = datetime.now(timezone.utc)
            duration_ms = (time.perf_counter() - start_time) * 1000
            log_discovery_run(
                run_id=run.run_id,
                user_id=user_id,
                timestamp_start=timestamp_start,
                timestamp_end=timestamp_end,
                total_duration_ms=duration_ms,
                cache_hit=False
            )
            run_id_var.set(None)  # Clear context

            return {
                "success": True,
                "run_id": run.run_id,
                "outputs": final_outputs,
                "cached": False,
                "cache_hit": False
            }

        except Exception as e:
            # Do NOT cache partial failures
            error_message = str(e)
            run.status = "failed"
            run.error_message = error_message
            self.db.commit()
            
            # Log error to database
            try:
                self.error_log_service.log_error(
                    error=e,
                    context={"inputs": inputs, "run_id": run.run_id},
                    user_id=user_id,
                    run_id=run.run_id,
                    severity="error"
                )
            except Exception as log_error:
                # Don't fail if error logging fails
                self._log(f"Failed to log error to database: {log_error}", "ERROR")
            
            # Log structured discovery run (failed)
            timestamp_end = datetime.now(timezone.utc)
            duration_ms = (time.perf_counter() - start_time) * 1000
            log_discovery_run(
                run_id=run.run_id if run else run_id,
                user_id=user_id,
                timestamp_start=timestamp_start,
                timestamp_end=timestamp_end,
                total_duration_ms=duration_ms,
                cache_hit=False,
                error=error_message
            )
            run_id_var.set(None)  # Clear context
            
            raise

    # ----------------------------------------------------------------------
    # PARALLEL PIPELINE
    # ----------------------------------------------------------------------
    def _run_parallel(self, inputs: Dict[str, Any], run_id: Optional[str] = None) -> Dict[str, Any]:

        interest_area = inputs.get("interest_area", "")
        sub_interest = inputs.get("sub_interest_area", "")

        profile_result = None
        tool_results = None

        with ThreadPoolExecutor(max_workers=2) as executor:

            future_profile = executor.submit(self.profile_service.run, inputs, run_id)
            future_tools = executor.submit(
                self.tool_service.load_or_execute,
                interest_area,
                sub_interest
            )

            futures = {
                future_profile: "profile",
                future_tools: "tools"
            }

            for future in as_completed(futures, timeout=settings.STAGE1_TIMEOUT):
                task_name = futures[future]
                try:
                    result = future.result()
                    if task_name == "profile":
                        profile_result = result
                    else:
                        tool_results = result
                except Exception as e:
                    if task_name == "profile":
                        raise  # MUST succeed
                    tool_results = {}

        if not profile_result or "profile_analysis" not in profile_result:
            raise ValueError("Profile analysis returned invalid output.")

        profile_text = profile_result["profile_analysis"]
        
        # Extract and format profile analysis for recommendations prompt
        formatted_profile = self._format_profile_for_recommendations(profile_text)

        stage2_output = self._run_stage2(
            profile_analysis=formatted_profile,
            inputs=inputs,
            tool_results=tool_results,
            run_id=run_id,
        )

        return {
            "profile_analysis": profile_text,
            "recommendations": stage2_output
        }

    # ----------------------------------------------------------------------
    # SEQUENTIAL PIPELINE
    # ----------------------------------------------------------------------
    def _run_sequential(self, inputs: Dict[str, Any], run_id: Optional[str] = None) -> Dict[str, Any]:

        interest_area = inputs.get("interest_area", "")
        sub_interest = inputs.get("sub_interest_area", "")

        profile_result = self.profile_service.run(inputs, run_id=run_id)
        profile_text = profile_result["profile_analysis"]
        
        # Extract and format profile analysis for recommendations prompt
        formatted_profile = self._format_profile_for_recommendations(profile_text)

        try:
            tool_results = self.tool_service.load_or_execute(interest_area, sub_interest)
        except Exception:
            tool_results = {}

        stage2_output = self._run_stage2(
            profile_analysis=formatted_profile,
            inputs=inputs,
            tool_results=tool_results,
            run_id=run_id,
        )

        return {
            "profile_analysis": profile_text,
            "recommendations": stage2_output
        }

    # ----------------------------------------------------------------------
    # STAGE 2 EXECUTION
    # ----------------------------------------------------------------------
    def _run_stage2(
        self,
        profile_analysis: str,
        inputs: Dict[str, Any],
        tool_results: Dict[str, Any],
        run_id: Optional[str] = None
    ) -> str:

        # Build prompt for Stage 2
        prompt = self.prompt_builder.build_idea_research_prompt(
            profile_analysis=profile_analysis,
            tool_results=tool_results
        )

        system_prompt = """You are a startup advisor. You MUST output recommendations using the EXACT format specified in the prompt.

CRITICAL RULES:
- Output ONLY the IDEA blocks (### IDEA_1, ### IDEA_2, etc.)
- Do NOT include any intro text, explanations, or disclaimers
- Do NOT output markdown sections like ## SECTION or ### RECOMMENDATION
- Each IDEA block must have exactly these fields: title, summary, target_market, revenue_model, validation_score, timeline, why_this_fits
- Follow the format EXACTLY as specified."""

        llm_response = self.llm_service.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=settings.MAX_TOKENS_STAGE2,
            run_id=run_id,
        )

        return llm_response["content"]
    
    # ----------------------------------------------------------------------
    # STREAMING WORKFLOW
    # ----------------------------------------------------------------------
    def merge_idea_header(self, buffer: str, next_token: str) -> Optional[str]:
        """Merge '### IDEA_' + number into '### IDEA_1'."""
        stripped = buffer.strip()
        # Handle both "### IDEA" (with space) and "###IDEA" (without space)
        if stripped.startswith("### IDEA") or stripped.startswith("###IDEA"):
            # Check if next_token is a digit, or starts with underscore followed by digit (e.g., "_1")
            token_clean = next_token.strip()
            if token_clean.isdigit():
                # Normalize to "### IDEA_X" format (with space)
                merged = f"### IDEA_{token_clean}"
                print(f"[MERGE_IDEA_HEADER] buffer='{buffer}', next_token='{next_token}' -> merged='{merged}'")
                return merged
            elif token_clean.startswith("_") and token_clean[1:].isdigit():
                # Handle "_1" format - extract digit and merge
                digit = token_clean[1:]
                merged = f"### IDEA_{digit}"
                print(f"[MERGE_IDEA_HEADER] buffer='{buffer}', next_token='{next_token}' -> merged='{merged}'")
                return merged
            else:
                print(f"[MERGE_IDEA_HEADER] buffer='{buffer}' starts with '### IDEA' but next_token='{next_token}' is not a digit or '_digit'")
        else:
            print(f"[MERGE_IDEA_HEADER] buffer='{buffer}' does not start with '### IDEA' or '###IDEA'")
        return None
    
    async def workflow_stream(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        Stream workflow output in buffered chunks instead of token-by-token.
        """
        print(">>> WORKFLOW_STREAM EXECUTED <<<")
        import asyncio
        
        # 1. Run Profile Analysis
        loop = asyncio.get_event_loop()
        profile_result = await loop.run_in_executor(
            None,
            lambda: self.profile_service.analyze_profile(inputs, run_id=run_id)
        )
        profile_text = profile_result.get("profile_analysis", "")
        
        # Profile text already includes delimiters - yield it once
        if profile_text:
            yield profile_text
        yield "\n\n---PROFILE_END---\n\n"

        # 2. Get tool results for prompt
        interest_area = inputs.get("interest_area", "")
        sub_interest = inputs.get("sub_interest_area", "")
        try:
            tool_results = await loop.run_in_executor(
                None,
                lambda: self.tool_service.load_or_execute(interest_area, sub_interest) if interest_area else {}
            )
        except Exception as e:
            self._log(f"Tool research failed: {e}", "WARNING")
            tool_results = {}
        
        # 3. Format profile for recommendations prompt
        formatted_profile = self._format_profile_for_recommendations(profile_text)
        
        # 4. Run Idea Generation (LLM Streaming) with buffering
        prompt = self.prompt_builder.build_idea_research_prompt(
            profile_analysis=formatted_profile,
            tool_results=tool_results
        )
        
        system_prompt = """You are a startup advisor. You MUST output recommendations using the EXACT format specified in the prompt.

CRITICAL RULES:
- Output ONLY the IDEA blocks (### IDEA_1, ### IDEA_2, etc.)
- Do NOT include any intro text, explanations, or disclaimers
- Do NOT output markdown sections like ## SECTION or ### RECOMMENDATION
- Each IDEA block must have exactly these fields: title, summary, target_market, revenue_model, validation_score, timeline, why_this_fits
- Follow the format EXACTLY as specified."""

        llm_stream = self.llm_service.generate_stream(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=settings.MAX_TOKENS_STAGE2,
        )

        # State machine for clean buffering
        # States: NORMAL, IDEA_HEADER, FIELD_VALUE
        buffer = ""
        state = "NORMAL"
        token_count = 0
        prev_char = ""
        in_profile = False
        
        async for chunk in llm_stream:
            token_count += 1
            t = chunk
            
            # Log RAW TOKEN and BUFFER BEFORE
            print(f"\n[TOKEN #{token_count}] RAW TOKEN: {repr(t)}")
            print(f"[TOKEN #{token_count}] STATE: {state}, in_profile: {in_profile}")
            print(f"[TOKEN #{token_count}] BUFFER BEFORE: {repr(buffer)}")
            
            # Handle profile markers - pass through immediately, never buffer
            if "---PROFILE_ANALYSIS_START---" in t:
                if buffer.strip():
                    print(f"[TOKEN #{token_count}] FLUSHED (before profile start): {repr(buffer.strip())}")
                    yield buffer.strip()
                    buffer = ""
                print(f"[TOKEN #{token_count}] PASSING THROUGH (profile start): {repr(t)}")
                yield t
                in_profile = True
                state = "NORMAL"
                continue
                
            if "---PROFILE_ANALYSIS_END---" in t:
                if buffer.strip():
                    print(f"[TOKEN #{token_count}] FLUSHED (before profile end): {repr(buffer.strip())}")
                    yield buffer.strip()
                    buffer = ""
                print(f"[TOKEN #{token_count}] PASSING THROUGH (profile end): {repr(t)}")
                yield t
                in_profile = False
                state = "NORMAL"
                continue
            
            # Inside profile - accumulate everything, flush on end marker only
            if in_profile:
                buffer += t
                print(f"[TOKEN #{token_count}] BUFFER AFTER (profile): {repr(buffer)}")
                prev_char = t
                continue
            
            # Detect IDEA header start: "###" pattern
            if state == "NORMAL" and ("###" in buffer or (buffer == "" and t == "#")):
                buffer += t
                if "###" in buffer:
                    state = "IDEA_HEADER"
                    print(f"[TOKEN #{token_count}] STATE -> IDEA_HEADER")
                print(f"[TOKEN #{token_count}] BUFFER AFTER: {repr(buffer)}")
                prev_char = t
                continue
            
            # Building IDEA header
            if state == "IDEA_HEADER":
                buffer += t
                
                # Try to merge with number token
                merge_candidate = self.merge_idea_header(buffer, t)
                if merge_candidate:
                    print(f"[TOKEN #{token_count}] MERGE_IDEA: {repr(buffer)} + {repr(t)} -> {repr(merge_candidate)}")
                    buffer = merge_candidate
                    print(f"[TOKEN #{token_count}] BUFFER AFTER MERGE: {repr(buffer)}")
                    prev_char = t
                    continue
                
                # Check if we have a complete IDEA header pattern: "### IDEA_<digit>"
                buffer_stripped = buffer.strip()
                is_complete_header = bool(re.match(r"^###\s*IDEA_\d+$", buffer_stripped))
                is_partial_header = buffer_stripped.startswith("### IDEA_") and not is_complete_header
                
                # If we have a partial header (e.g., "### IDEA_" without digit, or "### IDEA__1" with double underscore), keep buffering
                if is_partial_header:
                    print(f"[TOKEN #{token_count}] BUFFERING (partial header, waiting for complete pattern): {repr(buffer)}")
                    prev_char = t
                    continue
                
                # Header complete when we have "### IDEA_X" followed by newline/space
                if is_complete_header and (t == "\n" or t == " " or (t.strip() == "" and len(buffer) > 8)):
                    print(f"[TOKEN #{token_count}] FLUSHED (IDEA header complete): {repr(buffer)}")
                    yield buffer
                    buffer = ""
                    state = "NORMAL"
                    print(f"[TOKEN #{token_count}] STATE -> NORMAL")
                    prev_char = t
                    continue
                
                # If we have complete header but next token is not whitespace/digit, flush header
                if is_complete_header and len(buffer) >= 9 and not t.isdigit() and t not in [" ", "\n", ""]:
                    # Extract complete header
                    header_end = buffer.find("\n") if "\n" in buffer else len(buffer)
                    header = buffer[:header_end].rstrip()
                    remainder = buffer[header_end:] + t
                    print(f"[TOKEN #{token_count}] FLUSHED (IDEA header, non-digit next): {repr(header)}")
                    yield header
                    buffer = remainder
                    state = "NORMAL"
                    print(f"[TOKEN #{token_count}] STATE -> NORMAL")
                    prev_char = t
                    continue
                
                print(f"[TOKEN #{token_count}] BUFFER AFTER (IDEA_HEADER): {repr(buffer)}")
                prev_char = t
                continue
            
            # Detect field start: alphanumeric followed by ":"
            if state == "NORMAL" and (t.isalnum() or t == "_") and ":" not in buffer:
                buffer += t
                # Check if we just completed a field name (ends with ":")
                if buffer.endswith(":"):
                    state = "FIELD_VALUE"
                    print(f"[TOKEN #{token_count}] STATE -> FIELD_VALUE (found colon)")
                print(f"[TOKEN #{token_count}] BUFFER AFTER: {repr(buffer)}")
                prev_char = t
                continue
            
            # Building field value (after ":")
            if state == "FIELD_VALUE" or (state == "NORMAL" and ":" in buffer):
                if state == "NORMAL":
                    state = "FIELD_VALUE"
                    print(f"[TOKEN #{token_count}] STATE -> FIELD_VALUE")
                
                buffer += t
                
                # Flush on sentence end: period followed by space/newline
                if prev_char == "." and (t == " " or t == "\n"):
                    print(f"[TOKEN #{token_count}] FLUSHED (field complete, sentence end): {repr(buffer.strip())}")
                    yield buffer.strip()
                    buffer = ""
                    state = "NORMAL"
                    print(f"[TOKEN #{token_count}] STATE -> NORMAL")
                    prev_char = t
                    continue
                
                print(f"[TOKEN #{token_count}] BUFFER AFTER (FIELD_VALUE): {repr(buffer)}")
                prev_char = t
                continue
            
            # Handle double newline (flush outside fields)
            # BUT: Do NOT flush if we have a partial IDEA header
            if t == "\n" and prev_char == "\n" and state != "FIELD_VALUE":
                # Check if buffer contains a partial IDEA header that shouldn't be flushed
                buffer_stripped = buffer.strip()
                is_partial_idea_header = buffer_stripped.startswith("### IDEA_") and not bool(re.match(r"^###\s*IDEA_\d+$", buffer_stripped))
                
                if is_partial_idea_header:
                    print(f"[TOKEN #{token_count}] SKIPPING FLUSH (partial IDEA header detected): {repr(buffer)}")
                    prev_char = t
                    continue
                
                if buffer.strip():
                    print(f"[TOKEN #{token_count}] FLUSHED (double newline): {repr(buffer.strip())}")
                    yield buffer.strip()
                buffer = ""
                state = "NORMAL"
                print(f"[TOKEN #{token_count}] STATE -> NORMAL")
                prev_char = t
                continue
            
            # Default: accumulate
            buffer += t
            print(f"[TOKEN #{token_count}] BUFFER AFTER (accumulate): {repr(buffer)}")
            prev_char = t

        # Final flush
        if buffer.strip():
            flushed = buffer.strip()
            print(f"[FINAL] FLUSHED (remaining buffer): {repr(flushed)}")
            yield flushed
    
    def _format_profile_for_recommendations(self, profile_text: str) -> str:
        """
        Extract and format profile analysis JSON for use in recommendations prompt.
        
        Converts JSON format to readable text format that the recommendations LLM can use.
        """
        if not profile_text:
            return profile_text
        
        import json
        import re
        
        # Extract JSON from delimited block
        start_marker = "---PROFILE_ANALYSIS_START---"
        end_marker = "---PROFILE_ANALYSIS_END---"
        
        start_idx = profile_text.find(start_marker)
        end_idx = profile_text.find(end_marker)
        
        if start_idx >= 0 and end_idx > start_idx:
            # Extract JSON block
            json_start = start_idx + len(start_marker)
            json_text = profile_text[json_start:end_idx].strip()
            
            # Find the JSON object (first { to last })
            first_brace = json_text.find('{')
            last_brace = json_text.rfind('}')
            
            if first_brace >= 0 and last_brace > first_brace:
                json_text = json_text[first_brace:last_brace + 1]
                
                try:
                    profile_data = json.loads(json_text)
                    
                    # Format as readable text for recommendations prompt
                    formatted = []
                    formatted.append("## Profile Analysis Summary")
                    formatted.append("")
                    
                    if profile_data.get("core_motivations"):
                        formatted.append("### Core Motivations")
                        formatted.append(profile_data["core_motivations"])
                        formatted.append("")
                    
                    if profile_data.get("constraints"):
                        formatted.append("### Operating Constraints")
                        formatted.append(profile_data["constraints"])
                        formatted.append("")
                    
                    if profile_data.get("strengths"):
                        formatted.append("### Strengths and Capabilities")
                        formatted.append(profile_data["strengths"])
                        formatted.append("")
                    
                    if profile_data.get("strategic_considerations"):
                        formatted.append("### Strategic Considerations")
                        formatted.append(profile_data["strategic_considerations"])
                        formatted.append("")
                    
                    return "\n".join(formatted)
                except json.JSONDecodeError:
                    # If JSON parsing fails, return original text (fallback)
                    return profile_text
        
        # If no delimiters found, return as-is (might be old format or already formatted)
        return profile_text
    
    def _clean_stream_chunk(self, chunk: str) -> str:
        """
        Clean a stream chunk to remove JSON metadata.
        
        Removes patterns like {"run_id": "...", "status": "..."} from chunks.
        IMPORTANT: Does NOT filter profile analysis JSON delimiters.
        """
        if not chunk:
            return chunk
        
        # PROTECT: Don't filter if this contains profile analysis delimiters
        # Profile analysis JSON should be preserved intact
        if "---PROFILE_ANALYSIS_START---" in chunk or "---PROFILE_ANALYSIS_END---" in chunk:
            # This is profile analysis JSON - don't filter it
            return chunk
        
        import re
        
        # Remove JSON metadata patterns (only SSE metadata, not profile JSON)
        cleaned = re.sub(r'\{[^{}]*"run_id"[^{}]*"status"[^{}]*\}[-\s]*', '', chunk)
        cleaned = re.sub(r'\{[^{}]*"run_id"[^{}]*\}[-\s]*', '', cleaned)
        cleaned = re.sub(r'\{[^{}]*run_id[^{}]*\}[-\s]*', '', cleaned)
        
        return cleaned
    
    def _format_research_output(self, tool_results: Dict[str, Any]) -> str:
        """Format tool results as readable text"""
        if not tool_results:
            return "No research data available.\n"
        
        lines = []
        for key, value in tool_results.items():
            if value:
                # Convert key to readable format
                readable_key = key.replace("_", " ").title()
                lines.append(f"**{readable_key}:**\n{value}\n")
        
        return "\n".join(lines) if lines else "No research data available.\n"
