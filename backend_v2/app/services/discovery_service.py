"""
Discovery Service - Main orchestration service
"""

from typing import Dict, Any, Optional, AsyncIterator, List
from datetime import datetime, timezone
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError as FutureTimeoutError
from sqlalchemy.orm import Session

from app.services.base_service import BaseService
from app.services.profile_analysis_service import ProfileAnalysisService
from app.services.psyche_scoring_service import PsycheScoringService
from app.services.result_assembler import ResultAssembler
from app.services.cache_service import CacheService
from app.services.error_log_service import ErrorLogService
from app.services.stage2_service import Stage2Service
from app.services.profile_formatter import ProfileFormatter
from app.services.final_recommendation_service import FinalRecommendationService
from app.services.discovery_utils import normalize_industry_name, determine_realism_level
from app.models.run import Run
from app.models.discovery_result import DiscoveryResult
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.logger import log_discovery_run, run_id_var
from app.services.conflict_detector import ConflictDetector


class DiscoveryService(BaseService):
    """Main orchestration service for the discovery pipeline."""

    def __init__(self, db: Session, redis_client=None):
        super().__init__(db, redis_client)
        self.profile_service = ProfileAnalysisService(db, redis_client)
        self.psyche_scoring_service = PsycheScoringService(db, redis_client)
        self.result_assembler = ResultAssembler()
        self.cache_service = CacheService(db, redis_client)
        self.error_log_service = ErrorLogService(db, redis_client)
        self.stage2_service = Stage2Service(db, redis_client)
        self.profile_formatter = ProfileFormatter(db, redis_client)
        self.final_recommendation_service = FinalRecommendationService(db, redis_client)

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
                    # Update user_id if it's missing and we have a user_id to set
                    if user_id and not run.user_id:
                        run.user_id = user_id
                        self._log(f"Updated cached run {run_id} with user_id={user_id}", "INFO")
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
            # Update user_id if it's missing and we have a user_id to set
            if user_id and not run.user_id:
                run.user_id = user_id
                self.db.commit()
                self._log(f"Updated run {run_id} with user_id={user_id}", "INFO")
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
                results = self._run_parallel(inputs, user_id=user_id, run_id=run.run_id)
            else:
                results = self._run_sequential(inputs, user_id=user_id, run_id=run.run_id)

            # Determine realism level for output
            realism_level = determine_realism_level(inputs)
            
            # Detect conflicts and get user message
            conflicts = ConflictDetector.detect_conflicts(inputs)
            conflict_message = ConflictDetector.build_user_message(conflicts, inputs)
            
            # Assemble structured outputs
            final_outputs = self.result_assembler.assemble(
                profile_analysis=results["profile_analysis"],
                stage2_output=results["recommendations"],
                realism_level=realism_level
            )
            
            # Add conflict adjustment message if conflicts detected
            if conflict_message:
                final_outputs["conflict_adjustment"] = conflict_message

            # Generate Final Recommendation (premium decision summary)
            if "structured_recommendations" in final_outputs and final_outputs["structured_recommendations"]:
                final_recommendation = self.final_recommendation_service.generate_final_recommendation(
                    ideas=final_outputs["structured_recommendations"],
                    profile_analysis=results["profile_analysis"],
                    inputs=inputs,
                    run_id=run.run_id
                )
                if final_recommendation:
                    final_outputs["final_recommendation"] = final_recommendation

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
    def _run_parallel(self, inputs: Dict[str, Any], user_id: Optional[str] = None, run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Run profile analysis and idea generation in parallel.
        Note: Tool calls are no longer used in idea generation phase.
        """
        profile_result = None

        with ThreadPoolExecutor(max_workers=1) as executor:
            future_profile = executor.submit(self.profile_service.run, inputs, run_id)
            
            try:
                profile_result = future_profile.result(timeout=settings.STAGE1_TIMEOUT)
            except Exception as e:
                raise ValueError(f"Profile analysis failed: {e}")

        if not profile_result or "profile_analysis" not in profile_result:
            raise ValueError("Profile analysis returned invalid output.")

        profile_text = profile_result["profile_analysis"]
        
        # Extract and format profile analysis for recommendations prompt
        formatted_profile = self.profile_formatter.format_profile_for_recommendations(profile_text, user_id=user_id)

        stage2_output = self.stage2_service.run_stage2(
            profile_analysis=formatted_profile,
            inputs=inputs,
            run_id=run_id,
        )

        return {
            "profile_analysis": profile_text,
            "recommendations": stage2_output
        }

    # ----------------------------------------------------------------------
    # SEQUENTIAL PIPELINE
    # ----------------------------------------------------------------------
    def _run_sequential(self, inputs: Dict[str, Any], user_id: Optional[str] = None, run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Run profile analysis and idea generation sequentially.
        Note: Tool calls are no longer used in idea generation phase.
        """
        profile_result = self.profile_service.run(inputs, run_id=run_id)
        profile_text = profile_result["profile_analysis"]
        
        # Extract and format profile analysis for recommendations prompt
        formatted_profile = self.profile_formatter.format_profile_for_recommendations(profile_text, user_id=user_id)

        stage2_output = self.stage2_service.run_stage2(
            profile_analysis=formatted_profile,
            inputs=inputs,
            run_id=run_id,
        )

        return {
            "profile_analysis": profile_text,
            "recommendations": stage2_output
        }

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
                return merged
            elif token_clean.startswith("_") and token_clean[1:].isdigit():
                # Handle "_1" format - extract digit and merge
                digit = token_clean[1:]
                merged = f"### IDEA_{digit}"
                return merged
        return None
    
    # ----------------------------------------------------------------------
    # STREAMING WORKFLOW
    # ----------------------------------------------------------------------
    async def workflow_stream(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        Stream workflow output in buffered chunks instead of token-by-token.
        """
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

        # 2. Format profile for recommendations prompt
        formatted_profile = self.profile_formatter.format_profile_for_recommendations(profile_text, user_id=user_id)
        
        # 3. Determine realism level based on user intent
        realism_level = determine_realism_level(inputs)
        
        # 4. Try static engine first (fast path), fallback to LLM if needed
        industry_interest = normalize_industry_name(inputs.get("industry_interest", ""))
        static_engine_used = False
        
        if industry_interest:
            try:
                from app.static_engine.loader import load_industry_data
                from app.static_engine.synthesizer import synthesize_ideas
                from app.static_engine.report_builder import build_markdown_report
                
                self._log(f"[Stream] Attempting to load static engine data for industry: '{industry_interest}'", "INFO")
                
                # Load industry data
                industry_data = load_industry_data(industry_interest)
                
                if industry_data:
                    self._log(f"[Stream] Successfully loaded industry data for '{industry_interest}'", "INFO")
                    # Parse profile analysis JSON
                    import json
                    profile_data = {}
                    if profile_text:
                        try:
                            start_marker = "---PROFILE_ANALYSIS_START---"
                            end_marker = "---PROFILE_ANALYSIS_END---"
                            start_idx = profile_text.find(start_marker)
                            end_idx = profile_text.find(end_marker)
                            
                            if start_idx != -1 and end_idx != -1:
                                json_text = profile_text[start_idx + len(start_marker):end_idx].strip()
                                profile_data = json.loads(json_text)
                            else:
                                profile_data = json.loads(profile_text)
                        except (json.JSONDecodeError, ValueError):
                            profile_data = {"raw": profile_text}
                    
                    # Synthesize ideas (returns structured ideas)
                    idea_seeds = synthesize_ideas(
                        user_params=inputs,
                        industry_data=industry_data,
                        num_ideas=15,
                        realism_level=realism_level
                    )
                    
                    # Check if static engine generated ideas
                    if not idea_seeds or len(idea_seeds) == 0:
                        self._log(f"Static engine returned 0 ideas for '{industry_interest}', falling back to LLM", "WARNING")
                        raise ValueError("Static engine returned no ideas")
                    
                    # Rank ideas based on profile match
                    ranked_ideas = self.stage2_service.idea_ranking_service.rank_ideas(idea_seeds, profile_data, inputs)
                    
                    # Clean structured ideas to ensure only seed-level fields
                    cleaned_ideas = self.stage2_service.clean_seed_ideas(ranked_ideas)
                    
                    # Filter ideas by startup_category (tech vs non-tech)
                    startup_category = inputs.get('startup_category', 'both')
                    if startup_category and startup_category != 'both':
                        from app.utils.startup_category_filter import filter_ideas_by_category
                        filtered_ideas = filter_ideas_by_category(cleaned_ideas, startup_category)
                        self._log(f"[Stream] Filtered {len(cleaned_ideas)} ideas to {len(filtered_ideas)} based on startup_category={startup_category}", "INFO")
                        
                        # If we have fewer than 3 ideas after filtering, log a warning but proceed
                        if len(filtered_ideas) < 3:
                            self._log(f"[Stream] Only {len(filtered_ideas)} ideas remain after filtering. Consider regenerating.", "WARNING")
                        
                        # Create a set of filtered idea IDs for quick lookup
                        filtered_ids = {idea.get('id') for idea in filtered_ideas}
                        
                        # Filter both cleaned_ideas and ranked_ideas to keep them in sync
                        cleaned_ideas = filtered_ideas
                        ranked_ideas = [idea for idea in ranked_ideas if idea.get('id') in filtered_ids]
                    
                    # Build report
                    report = build_markdown_report(
                        profile=profile_data,
                        idea_list=ranked_ideas,
                        industry_data=industry_data,
                        realism_level=realism_level
                    )
                    
                    # Embed structured ideas
                    structured_json = json.dumps(cleaned_ideas)
                    report_with_structured = f"{report}\n\n---STRUCTURED_IDEAS_START---\n{structured_json}\n---STRUCTURED_IDEAS_END---"
                    
                    # Stream the report as chunks (simulate streaming for consistency)
                    self._log(f"Static engine: Generated {len(cleaned_ideas)} ideas for '{industry_interest}'", "INFO")
                    static_engine_used = True
                    
                    # Yield report in chunks to simulate streaming
                    chunk_size = 100  # Characters per chunk
                    for i in range(0, len(report_with_structured), chunk_size):
                        chunk = report_with_structured[i:i + chunk_size]
                        yield chunk
                        # Small delay to simulate streaming (optional, can remove)
                        await asyncio.sleep(0.01)
                    
                    return  # Exit early, static engine completed
                    
            except Exception as e:
                # Fall back to LLM if static engine fails
                import traceback
                error_details = traceback.format_exc()
                self._log(f"[Stream] Static engine failed for '{industry_interest}': {e}, falling back to LLM", "WARNING")
                self._log(f"[Stream] Error details: {error_details}", "DEBUG")
        
        # 4. LLM fallback (only if static engine not used)
        if not static_engine_used:
            # Use stage2_service for LLM-based idea generation in streaming mode
            # Note: For streaming, we use the LLM service directly from stage2_service
            prompt = self.stage2_service.prompt_builder.build_idea_research_prompt(
                profile_analysis=formatted_profile,
                realism_level=realism_level,
                user_inputs=inputs
            )
        
            system_prompt = """You are a startup advisor. You MUST output recommendations using the EXACT format specified in the prompt.

CRITICAL RULES:
- Output ONLY the IDEA blocks (### IDEA_1, ### IDEA_2, etc.)
- Do NOT include any intro text, explanations, or disclaimers
- Do NOT output markdown sections like ## SECTION or ### RECOMMENDATION
- Each IDEA block must have exactly these fields: title, summary, target_market, revenue_model, validation_score, timeline, why_this_fits
- Follow the format EXACTLY as specified.

IDEA TITLE REQUIREMENTS (CRITICAL):
- Each idea title MUST be a CONCRETE STARTUP IDEA, NOT a framework component or abstract concept
- DO NOT return: "Business Models", "Target Segments", "Value Propositions", "Revenue Models", "Market Opportunities", "Customer Personas", "Go-to-Market Strategy", "Pricing Strategies", "Validation Frameworks", "Execution Plans", or any other framework terms
- Each title MUST follow pattern: [Who] + [Problem] + [Solution]
- Examples of VALID titles: "Non-technical food founders launch cloud kitchens using shared commercial kitchens", "Local fitness coaches create personalized meal prep services for busy professionals"
- Examples of INVALID titles: "Business Models", "Target Segments", "Value Propositions" (these are framework terms, not ideas)
- ONLY return fully-formed, concrete startup ideas with specific customers, problems, and solutions

REALISM ENFORCEMENT:
- Ideas MUST match user's actual skills (if user only has cooking skills, NO tech/AI/software ideas)
- Ideas MUST fit user's time commitment, budget, preferred work style, and startup style
- Preferred work style influences operational complexity and founder-fit (solo vs team, hands-on vs remote, etc.)
- Startup style influences business model, delivery method, cost structure, and scalability (home-based vs local vs online, etc.)
- Business region influences pricing assumptions, feasibility, cultural fit, delivery models, legal complexity, and startup costs
- Ideas MUST be executable within user's earnings timeline
- Ideas MUST be from user's selected industry and sub-interest ONLY
- Ideas MUST be operationally simple and feasible for the user's skill level
- NO hallucinations, NO irrelevant tech, NO ideas from different industries
- NO framework terms, NO abstract concepts, NO strategy categories - ONLY concrete startup ideas"""

            llm_stream = self.stage2_service.llm_service.generate_stream(
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
                
                # Handle profile markers - pass through immediately, never buffer
                if "---PROFILE_ANALYSIS_START---" in t:
                    if buffer.strip():
                        yield buffer.strip()
                        buffer = ""
                    yield t
                    in_profile = True
                    state = "NORMAL"
                    continue
                    
                if "---PROFILE_ANALYSIS_END---" in t:
                    if buffer.strip():
                        yield buffer.strip()
                        buffer = ""
                    yield t
                    in_profile = False
                    state = "NORMAL"
                    continue
                
                # Inside profile - accumulate everything, flush on end marker only
                if in_profile:
                    buffer += t
                    prev_char = t
                    continue
                
                # Detect IDEA header start: "###" pattern
                if state == "NORMAL" and ("###" in buffer or (buffer == "" and t == "#")):
                    buffer += t
                    if "###" in buffer:
                        state = "IDEA_HEADER"
                    prev_char = t
                    continue
                
                # Building IDEA header
                if state == "IDEA_HEADER":
                    buffer += t
                    
                    # Try to merge with number token
                    merge_candidate = self.merge_idea_header(buffer, t)
                    if merge_candidate:
                        buffer = merge_candidate
                        prev_char = t
                        continue
                    
                    # Check if we have a complete IDEA header pattern: "### IDEA_<digit>"
                    buffer_stripped = buffer.strip()
                    is_complete_header = bool(re.match(r"^###\s*IDEA_\d+$", buffer_stripped))
                    is_partial_header = buffer_stripped.startswith("### IDEA_") and not is_complete_header
                    
                    # If we have a partial header (e.g., "### IDEA_" without digit, or "### IDEA__1" with double underscore), keep buffering
                    if is_partial_header:
                        prev_char = t
                        continue
                    
                    # Header complete when we have "### IDEA_X" followed by newline/space
                    if is_complete_header and (t == "\n" or t == " " or (t.strip() == "" and len(buffer) > 8)):
                        yield buffer
                        buffer = ""
                        state = "NORMAL"
                        prev_char = t
                        continue
                    
                    # If we have complete header but next token is not whitespace/digit, flush header
                    if is_complete_header and len(buffer) >= 9 and not t.isdigit() and t not in [" ", "\n", ""]:
                        # Extract complete header
                        header_end = buffer.find("\n") if "\n" in buffer else len(buffer)
                        header = buffer[:header_end].rstrip()
                        remainder = buffer[header_end:] + t
                        yield header
                        buffer = remainder
                        state = "NORMAL"
                        prev_char = t
                        continue
                    
                    prev_char = t
                    continue
                
                # Detect field start: alphanumeric followed by ":"
                if state == "NORMAL" and (t.isalnum() or t == "_") and ":" not in buffer:
                    buffer += t
                    # Check if we just completed a field name (ends with ":")
                    if buffer.endswith(":"):
                        state = "FIELD_VALUE"
                    prev_char = t
                    continue
                
                # Building field value (after ":")
                if state == "FIELD_VALUE" or (state == "NORMAL" and ":" in buffer):
                    if state == "NORMAL":
                        state = "FIELD_VALUE"
                    
                    buffer += t
                    
                    # Flush on sentence end: period followed by space/newline
                    if prev_char == "." and (t == " " or t == "\n"):
                        yield buffer.strip()
                        buffer = ""
                        state = "NORMAL"
                        prev_char = t
                        continue
                    
                    prev_char = t
                    continue
                
                # Handle double newline (flush outside fields)
                # BUT: Do NOT flush if we have a partial IDEA header
                if t == "\n" and prev_char == "\n" and state != "FIELD_VALUE":
                    # Check if buffer contains a partial IDEA header that shouldn't be flushed
                    buffer_stripped = buffer.strip()
                    is_partial_idea_header = buffer_stripped.startswith("### IDEA_") and not bool(re.match(r"^###\s*IDEA_\d+$", buffer_stripped))
                    
                    if is_partial_idea_header:
                        prev_char = t
                        continue
                    
                    if buffer.strip():
                        yield buffer.strip()
                    buffer = ""
                    state = "NORMAL"
                    prev_char = t
                    continue
                
                # Default: accumulate
                buffer += t
                prev_char = t

            # Final flush
            if buffer.strip():
                flushed = buffer.strip()
                yield flushed
    
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
    
