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
from app.services.discovery.stream_processor import DiscoveryStreamProcessor
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
        # Initialize stream processor
        self.stream_processor = DiscoveryStreamProcessor(
            profile_service=self.profile_service,
            profile_formatter=self.profile_formatter,
            stage2_service=self.stage2_service,
            logger=self._log
        )

    # ----------------------------------------------------------------------
    # PUBLIC API
    # ----------------------------------------------------------------------
    def run_discovery(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> Dict[str, Any]:
        
        # Validate that user_id is present (authentication is required)
        if not user_id:
            raise ValueError("user_id is required - all discovery runs must be associated with an authenticated user")
        
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
                # user_id is validated above, so it will always be present here
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
            # user_id is validated above, so it will always be present here
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
    async def workflow_stream(
        self,
        inputs: Dict[str, Any],
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        Stream workflow output in buffered chunks instead of token-by-token.
        Delegates to stream processor for actual streaming logic.
        
        Routes to appropriate workflow based on discovery_mode:
        - "standard" (default): Static engine first, LLM fallback
        - "ai_first": LLM first, static engine fallback
        """
        discovery_mode = inputs.get("discovery_mode", "standard")
        
        if discovery_mode == "ai_first":
            self._log(f"[DiscoveryService] Using AI-first workflow for run_id={run_id}", "INFO")
            async for chunk in self.stream_processor.workflow_stream_ai_first(
                inputs=inputs,
                user_id=user_id,
                run_id=run_id
            ):
                yield chunk
        else:
            self._log(f"[DiscoveryService] Using standard workflow for run_id={run_id}", "INFO")
            async for chunk in self.stream_processor.workflow_stream(
                inputs=inputs,
                user_id=user_id,
                run_id=run_id
            ):
                yield chunk
    
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
    
