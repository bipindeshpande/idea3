"""
Discovery Service - Main orchestration service
"""

from typing import Dict, Any, Optional, AsyncIterator
from datetime import datetime, timezone
import time
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

        system_prompt = "You are a startup advisor. Follow the required structure exactly."

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
    async def workflow_stream(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        Stream the discovery workflow as text chunks
        
        Yields:
            Text chunks for profile analysis, research, and recommendations
        """
        import asyncio
        
        # OPTIMIZATION: Run Stage 1 (Profile) and Stage 2 (Research) in parallel
        # This can save 5-10 seconds by not waiting for tools to load
        interest_area = inputs.get("interest_area", "")
        sub_interest = inputs.get("sub_interest_area", "")
        
        # Start both tasks concurrently
        loop = asyncio.get_event_loop()
        
        # Run profile analysis in thread pool (it's synchronous)
        profile_task = loop.run_in_executor(
            None,
            lambda: self.profile_service.analyze_profile(inputs, run_id=run_id)
        )
        
        # Run tool loading in thread pool (it's synchronous)
        tool_task = loop.run_in_executor(
            None,
            lambda: self.tool_service.load_or_execute(interest_area, sub_interest) if interest_area else {}
        )
        
        # Wait for profile analysis first (user sees this)
        try:
            profile_result = await profile_task
            profile_text = profile_result.get("profile_analysis", "")
            yield profile_text
        except Exception as e:
            self._log(f"Profile analysis failed: {e}", "ERROR")
            yield f"\n\nError in profile analysis: {str(e)}\n"
            raise
        
        # Wait for tool results (happens in parallel, should be ready or almost ready)
        try:
            tool_results = await tool_task
        except Exception as e:
            self._log(f"Tool research failed: {e}", "WARNING")
            tool_results = {}
        
        # Stage 3: Final Recommendations (stream LLM output)
        # Add clear separator between profile and recommendations
        yield "\n\n---PROFILE_END---\n\n"
        
        # Extract and format profile analysis for recommendations prompt
        # The profile_text contains JSON with delimiters, we need to extract and format it
        formatted_profile = self._format_profile_for_recommendations(profile_text)
        
        # Use the formatted profile_text from Stage 1
        # Build prompt for Stage 3
        prompt = self.prompt_builder.build_idea_research_prompt(
            profile_analysis=formatted_profile,
            tool_results=tool_results
        )
        
        system_prompt = "You are a startup advisor. Follow the required structure exactly."
        
        # Stream LLM response - filter out any JSON metadata
        async for chunk in self.llm_service.generate_stream(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
            max_tokens=settings.MAX_TOKENS_STAGE2,
        ):
            # Filter out JSON metadata from chunks
            cleaned_chunk = self._clean_stream_chunk(chunk)
            if cleaned_chunk:
                yield cleaned_chunk
    
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
