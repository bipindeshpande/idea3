"""Discovery streaming endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import json
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.run import Run
from app.models.discovery_result import DiscoveryResult
from app.api.models.discovery_models import RunRequest
from app.services.discovery_service import DiscoveryService
from app.utils.user_utils import extract_user_id
from app.utils.error_handler import handle_exception, ValidationError
from app.utils.discovery.discovery_validators import ensure_defaults, validate_required_fields, normalize_skills
from app.utils.discovery.streaming_helpers import format_cached_result
from app.services.rate_limit_service import RateLimitService
from app.core.logger import request_id_var
# Use shared parser library (single source of truth)
from app.services.parsers.recommendation_parser import RecommendationParser
from app.services.discovery.stream_schemas import StreamChunk, StreamAccumulator

router = APIRouter()


def save_run_results_background(
    run_id: str,
    user_id: str,
    inputs: dict,
    profile_analysis: str,
    recommendations_formatted: str,
    parsed_recommendations: list,
    collected_output: str,
    db_session_maker
):
    """
    Background task to save run results to database.
    This runs after the streaming response completes, avoiding blocking the stream.
    """
    from app.core.database import SessionLocal
    from app.services.discovery_service import DiscoveryService
    
    db = SessionLocal()
    try:
        discovery_service = DiscoveryService(db)
        
        # Get run from database
        run = db.query(Run).filter(Run.run_id == run_id).first()
        if not run:
            discovery_service._log(f"ERROR: Run {run_id} not found for background save", "ERROR")
            return
        
        # Update run status and save results
        run.status = "completed"
        run.completed_at = datetime.now(timezone.utc)
        
        run.reports = {
            "streaming_output": collected_output,
            "profile_analysis": profile_analysis,
            "personalized_recommendations": recommendations_formatted,
            "recommendations_structured": parsed_recommendations
        }
        run.profile_analysis = profile_analysis
        run.personalized_recommendations = recommendations_formatted
        
        db.commit()
        db.refresh(run)
        
        # Verify save
        if not run.profile_analysis and profile_analysis:
            discovery_service._log(f"ERROR: profile_analysis was not saved in background task!", "ERROR")
        else:
            discovery_service._log(f"Background save: Saved profile_analysis ({len(run.profile_analysis)} chars)", "INFO")
        
        # Save to DiscoveryResult
        discovery_result = db.query(DiscoveryResult).filter(
            DiscoveryResult.run_id == run_id
        ).first()
        
        if discovery_result:
            discovery_result.result = run.reports
            discovery_result.status = "completed"
            discovery_result.error_message = None
        else:
            discovery_result = DiscoveryResult(
                run_id=run_id,
                input_payload=inputs,
                result=run.reports,
                status="completed"
            )
            db.add(discovery_result)
        
        db.commit()
        
        discovery_service._log(f"Background save: Completed for run {run_id}", "INFO")
        
        # Cache the result
        try:
            cache_key = discovery_service.cache_service.build_discovery_cache_key(inputs, user_id)
            discovery_service.cache_service.set_json(
                cache_key,
                run.reports,
                cache_type="discovery",
                ttl_seconds=7 * 24 * 60 * 60  # 7 days
            )
        except Exception as cache_error:
            discovery_service._log(f"Background save: Failed to cache result: {cache_error}", "WARNING")
            
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Background save failed for run {run_id}: {e}\n{error_traceback}")
        try:
            run = db.query(Run).filter(Run.run_id == run_id).first()
            if run:
                run.status = "failed"
                run.error_message = f"Background save failed: {str(e)}"
                db.commit()
        except:
            pass
    finally:
        db.close()


@router.post("/discovery", status_code=status.HTTP_200_OK)
async def create_run(
    request: RunRequest,
    http_request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    format: str = Query("sse", regex="^(sse|plain)$", description="Response format: 'sse' for Server-Sent Events or 'plain' for plain text")
):
    """
    Create a new discovery run with live streaming
    
    Requires authentication - all runs must be associated with a logged-in user.
    
    This endpoint:
    1. Checks rate limit (5 requests per minute per IP)
    2. Checks cache first - if cached, returns immediately without streaming
    3. Otherwise streams the discovery workflow:
       - Profile Analysis
       - Idea Research
       - Final Recommendations (streamed from LLM)
    
    Query Parameters:
        format: 'sse' (default) for Server-Sent Events or 'plain' for plain text
    
    Returns:
        StreamingResponse with SSE events or plain text chunks
    """
    # Check rate limit (raises HTTP 429 if exceeded)
    rate_limit_service = RateLimitService(db)
    ip_address = rate_limit_service.get_client_ip(http_request)
    is_allowed, current_count, limit_value = rate_limit_service.check_rate_limit(
        ip_address=ip_address,
        limit=5,
        window_seconds=60,
        endpoint="discovery"
    )
    
    if not is_allowed:
        request_id = request_id_var.get()
        user_id = extract_user_id(current_user)
        rate_limit_service.log_rate_limit_violation(
            ip_address=ip_address,
            endpoint="discovery",
            current_count=current_count,
            limit=limit_value,
            request_id=request_id,
            user_id=user_id
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {current_count}/{limit_value} requests per 60 seconds",
            headers={
                "X-RateLimit-Limit": str(limit_value),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": "60",
                "Retry-After": "60"
            }
        )
    
    # Convert request to dict, filtering None values (Pydantic v2 syntax)
    raw_inputs = request.model_dump(exclude_none=True)
    
    # Ensure all required fields have defaults
    inputs = ensure_defaults(raw_inputs)
    
    # Validate required fields
    validate_required_fields(inputs)
    
    # Normalize skills
    inputs["skills"] = normalize_skills(inputs.get("skills"))
    
    # Authentication is required, so user_id will always be present
    user_id = extract_user_id(current_user)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required - user_id is missing"
        )
    
    # Initialize service
    discovery_service = DiscoveryService(db)
    discovery_service._log(f"Creating discovery run for authenticated user: {user_id}", "INFO")
    
    # Check cache before streaming
    cache_key = discovery_service.cache_service.build_discovery_cache_key(inputs, user_id)
    cached_result = discovery_service.cache_service.get_json(cache_key, cache_type="discovery")
    
    if cached_result:
        # Return cached result immediately without streaming
        if format == "sse":
            # Format as SSE events
            cached_text = format_cached_result(cached_result)
            async def cached_sse():
                yield f"event: cached\n"
                yield f"data: {json.dumps({'run_id': None, 'cached': True})}\n\n"
                # Send cached text as chunk (split by lines for SSE format)
                for line in cached_text.split("\n"):
                    yield f"data: {line}\n"
                yield f"\n"  # End of chunk event (empty line)
                yield f"event: end\n"
                yield f"data: {json.dumps({'run_id': None, 'status': 'completed'})}\n\n"
            return StreamingResponse(
                cached_sse(),
                media_type="text/event-stream",
                headers={
                    "X-Cached": "true",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive"
                }
            )
        else:
            # Format as plain text
            cached_text = format_cached_result(cached_result)
            return StreamingResponse(
                iter([cached_text]),
                media_type="text/plain",
                headers={"X-Cached": "true"}
            )
    
    # Generate run_id
    run_id = str(uuid.uuid4())
    
    # Create Run record - user_id is required (authentication is enforced)
    run = Run(
        run_id=run_id,
        user_id=user_id,  # Always present due to authentication requirement
        inputs=inputs,
        status="processing",
        created_at=datetime.now(timezone.utc)
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    
    # Verify user_id was saved correctly
    if run.user_id != user_id:
        discovery_service._log(f"ERROR: Run {run_id} user_id mismatch! Expected {user_id}, got {run.user_id}", "ERROR")
    
    # Log run creation with user_id verification
    discovery_service._log(f"Created discovery run {run_id} for user_id={user_id} (saved as {run.user_id}), status={run.status}", "INFO")
    
    # Stream the workflow
    if format == "sse":
        # Server-Sent Events format
        async def generate_sse():
            try:
                # Send initial event with run_id
                yield f"event: start\n"
                yield f"data: {json.dumps({'run_id': run_id, 'status': 'processing'})}\n\n"
                
                # Stream workflow chunks using structured JSON lines format
                stream_completed = False
                accumulator = StreamAccumulator()
                collected_lines = []  # Collect all JSON lines for debugging
                
                try:
                    async for chunk in discovery_service.workflow_stream(
                        inputs=inputs,
                        user_id=user_id,
                        run_id=run_id
                    ):
                        if chunk and isinstance(chunk, str) and chunk.strip():
                            # Each chunk is a JSON line - parse and validate
                            chunk_data = StreamChunk.parse_chunk(chunk)
                            if chunk_data:
                                # Validate and add chunk using Pydantic validation
                                success, error_message, validated_data = accumulator.add_chunk(chunk_data, auto_fix=True)
                                if success:
                                    collected_lines.append(chunk)
                                    # Ensure chunk is properly formatted (remove any trailing newlines before SSE formatting)
                                    chunk_clean = chunk.rstrip('\n')
                                    # Yield the JSON line as SSE data for frontend
                                    # Frontend will parse it as JSON
                                    yield f"data: {chunk_clean}\n\n"
                                else:
                                    # Validation failed - log and skip (don't send invalid chunks)
                                    chunk_preview = chunk[:100] if chunk and len(chunk) > 0 else "empty chunk"
                                    discovery_service._log(f"WARNING: Chunk validation failed: {error_message}. Chunk: {chunk_preview}", "WARNING")
                                    # DO NOT yield invalid chunks - this prevents frontend parse errors
                            else:
                                # Invalid JSON line - log and skip (don't send invalid chunks)
                                chunk_preview = chunk[:100] if chunk and len(chunk) > 0 else "empty chunk"
                                discovery_service._log(f"WARNING: Invalid JSON line in stream: {chunk_preview}", "WARNING")
                                # DO NOT yield invalid chunks - this prevents frontend parse errors
                    
                    stream_completed = True
                except Exception as stream_error:
                    # If streaming fails, still send end event
                    discovery_service._log(f"Streaming error: {stream_error}", "ERROR")
                    yield f"event: error\n"
                    yield f"data: {json.dumps({'run_id': run_id, 'error': str(stream_error)})}\n\n"
                    stream_completed = False
                
                # Send completion event immediately after streaming (don't wait for DB save)
                # This ensures frontend gets the completion signal even if DB save is slow
                yield f"event: end\n"
                yield f"data: {json.dumps({'run_id': run_id, 'status': 'completed', 'cached': False})}\n\n"
                
                # Schedule background save (non-blocking) - don't wait for DB operations
                # CRITICAL: Don't call run_discovery() again - it would re-run everything!
                # Instead, save what we already computed during streaming
                if stream_completed and (accumulator.profile_text or accumulator.recommendation_text):
                    # Extract sections from accumulator (structured format)
                    profile_analysis = accumulator.get_profile()
                    recommendations_raw = accumulator.get_recommendations()
                    
                    # Log extraction for debugging
                    discovery_service._log(f"Extracted profile_analysis: length={len(profile_analysis)}, complete={accumulator.profile_complete}", "INFO")
                    discovery_service._log(f"Extracted recommendations: length={len(recommendations_raw)}, complete={accumulator.recommendation_complete}", "INFO")
                    
                    if accumulator.has_errors():
                        discovery_service._log(f"WARNING: Stream accumulator has errors: {accumulator.errors}", "WARNING")
                    
                    # Parse recommendations - check for structured JSON first (from static engine), then fallback to markdown parsing
                    parsed_recommendations = None
                    
                    # Log recommendations_raw preview
                    if recommendations_raw:
                        preview = recommendations_raw[:1000] if len(recommendations_raw) > 1000 else recommendations_raw
                        discovery_service._log(f"[SSE] recommendations_raw preview (first 1000 chars): {preview}", "DEBUG")
                    
                    # PRIORITY 1: Check if structured ideas are embedded as JSON (static engine format)
                    has_start = "---STRUCTURED_IDEAS_START---" in (recommendations_raw or "")
                    has_end = "---STRUCTURED_IDEAS_END---" in (recommendations_raw or "")
                    discovery_service._log(f"[SSE] Checking for structured JSON markers - START marker: {has_start}, END marker: {has_end}", "INFO")
                    
                    if has_start and has_end:
                        try:
                            from app.services.result_assembler import ResultAssembler
                            parsed_recommendations = ResultAssembler._extract_structured_ideas(recommendations_raw)
                            if parsed_recommendations and len(parsed_recommendations) > 0:
                                discovery_service._log(f"[SSE] ✅ Extracted {len(parsed_recommendations)} structured ideas from embedded JSON", "INFO")
                            else:
                                discovery_service._log(f"[SSE] ⚠️ Structured JSON markers found but extraction returned None or empty list", "WARNING")
                        except Exception as e:
                            import traceback
                            discovery_service._log(f"[SSE] ❌ Failed to extract structured ideas from JSON: {e}", "ERROR")
                            discovery_service._log(f"[SSE] Traceback: {traceback.format_exc()}", "ERROR")
                    else:
                        discovery_service._log(f"[SSE] ⚠️ No structured JSON markers found in recommendations_raw", "INFO")
                    
                    # PRIORITY 2: If structured JSON not found, try parsing markdown (IDEA_1 format)
                    if not parsed_recommendations or (isinstance(parsed_recommendations, list) and len(parsed_recommendations) == 0):
                        has_idea_blocks = "### IDEA" in (recommendations_raw or "")
                        discovery_service._log(f"[SSE] Attempting markdown parsing - Contains '### IDEA': {has_idea_blocks}", "INFO")
                        parsed_recommendations = RecommendationParser.parse_recommendations(recommendations_raw)
                        if parsed_recommendations and len(parsed_recommendations) > 0:
                            discovery_service._log(f"[SSE] ✅ Parsed {len(parsed_recommendations)} ideas from markdown format", "INFO")
                        else:
                            discovery_service._log(f"[SSE] ❌ Failed to parse ideas from markdown format", "WARNING")
                    
                    # Format recommendations for frontend (markdown format for backward compatibility)
                    if parsed_recommendations and isinstance(parsed_recommendations, list) and len(parsed_recommendations) > 0:
                        recommendations_formatted = RecommendationParser.format_recommendations_for_frontend(parsed_recommendations)
                        discovery_service._log(f"[SSE] ✅ Formatted {len(parsed_recommendations)} ideas for frontend", "INFO")
                    else:
                        # If parsing failed, use raw text as fallback (but remove structured markers if present)
                        recommendations_formatted = recommendations_raw
                        if "---STRUCTURED_IDEAS_START---" in recommendations_formatted:
                            recommendations_formatted = recommendations_formatted.split("---STRUCTURED_IDEAS_START---")[0].strip()
                        if "---STRUCTURED_IDEAS_END---" in recommendations_formatted:
                            recommendations_formatted = recommendations_formatted.split("---STRUCTURED_IDEAS_END---")[0].strip()
                        discovery_service._log(f"[SSE] ❌ WARNING: Failed to parse recommendations. Using raw text fallback (length: {len(recommendations_formatted) if recommendations_formatted else 0})", "WARNING")
                    
                    # Combine collected lines for raw output (for debugging)
                    collected_output = "".join(collected_lines)
                    
                    # Schedule background save (non-blocking - happens after response completes)
                    background_tasks.add_task(
                        save_run_results_background,
                        run_id=run_id,
                        user_id=user_id,
                        inputs=inputs,
                        profile_analysis=profile_analysis,
                        recommendations_formatted=recommendations_formatted,
                        parsed_recommendations=parsed_recommendations,
                        collected_output=collected_output,
                        db_session_maker=None  # Will create new session in background
                    )
                    discovery_service._log(f"Scheduled background save for run {run_id}", "INFO")
                    
            except Exception as e:
                # Log error (DB update will happen via background task if needed)
                discovery_service._log(f"Streaming error in SSE handler: {e}", "ERROR")
                # Send error event with structured error info
                error_detail = str(e)
                if isinstance(e, ValidationError):
                    error_detail = e.message
                yield f"event: error\n"
                yield f"data: {json.dumps({'run_id': run_id, 'error': error_detail, 'error_type': type(e).__name__})}\n\n"
                yield f"event: end\n"
                yield f"data: {json.dumps({'run_id': run_id, 'status': 'failed'})}\n\n"
        
        return StreamingResponse(
            generate_sse(),
            media_type="text/event-stream",
            headers={
                "X-Run-Id": run_id,
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        )
    else:
        # Plain text format (backward compatibility)
        async def generate_stream():
            stream_completed = False
            accumulator = StreamAccumulator()
            collected_lines = []  # Collect all JSON lines
            
            try:
                # Stream workflow chunks and collect results
                async for chunk in discovery_service.workflow_stream(
                    inputs=inputs,
                    user_id=user_id,
                    run_id=run_id
                ):
                    if chunk:
                        # Parse JSON line and accumulate
                        chunk_data = StreamChunk.parse_chunk(chunk)
                        if chunk_data:
                            # Validate and add chunk using Pydantic validation
                            success, error_message, validated_data = accumulator.add_chunk(chunk_data, auto_fix=True)
                            if not success:
                                discovery_service._log(f"WARNING: Chunk validation failed in plain format: {error_message}", "WARNING")
                        collected_lines.append(chunk)
                    yield chunk
                
                stream_completed = True
                
                # Schedule background save (non-blocking) - same as SSE handler
                # CRITICAL: Don't call run_discovery() again - it would re-run everything!
                # Instead, save what we already computed during streaming
                if stream_completed and (accumulator.profile_text or accumulator.recommendation_text):
                    # Extract sections from accumulator (structured format)
                    profile_analysis = accumulator.get_profile()
                    recommendations_raw = accumulator.get_recommendations()
                    
                    # Log extraction for debugging
                    discovery_service._log(f"[PLAIN] Extracted profile_analysis: length={len(profile_analysis)}, complete={accumulator.profile_complete}", "INFO")
                    discovery_service._log(f"[PLAIN] Extracted recommendations: length={len(recommendations_raw) if recommendations_raw else 0}, complete={accumulator.recommendation_complete}", "INFO")
                    
                    # Parse recommendations - check for structured JSON first (from static engine), then fallback to markdown parsing
                    parsed_recommendations = None
                    
                    # Log recommendations_raw preview
                    if recommendations_raw:
                        preview = recommendations_raw[:1000] if len(recommendations_raw) > 1000 else recommendations_raw
                        discovery_service._log(f"[PLAIN] recommendations_raw preview (first 1000 chars): {preview}", "DEBUG")
                    
                    # PRIORITY 1: Check if structured ideas are embedded as JSON (static engine format)
                    has_start = "---STRUCTURED_IDEAS_START---" in (recommendations_raw or "")
                    has_end = "---STRUCTURED_IDEAS_END---" in (recommendations_raw or "")
                    discovery_service._log(f"[PLAIN] Checking for structured JSON markers - START marker: {has_start}, END marker: {has_end}", "INFO")
                    
                    if has_start and has_end:
                        try:
                            from app.services.result_assembler import ResultAssembler
                            parsed_recommendations = ResultAssembler._extract_structured_ideas(recommendations_raw)
                            if parsed_recommendations and len(parsed_recommendations) > 0:
                                discovery_service._log(f"[PLAIN] ✅ Extracted {len(parsed_recommendations)} structured ideas from embedded JSON", "INFO")
                            else:
                                discovery_service._log(f"[PLAIN] ⚠️ Structured JSON markers found but extraction returned None or empty list", "WARNING")
                        except Exception as e:
                            import traceback
                            discovery_service._log(f"[PLAIN] ❌ Failed to extract structured ideas from JSON: {e}", "ERROR")
                    else:
                        discovery_service._log(f"[PLAIN] ⚠️ No structured JSON markers found in recommendations_raw", "INFO")
                    
                    # PRIORITY 2: If structured JSON not found, try parsing markdown (IDEA_1 format)
                    if not parsed_recommendations or (isinstance(parsed_recommendations, list) and len(parsed_recommendations) == 0):
                        has_idea_blocks = "### IDEA" in (recommendations_raw or "")
                        discovery_service._log(f"[PLAIN] Attempting markdown parsing - Contains '### IDEA': {has_idea_blocks}", "INFO")
                        parsed_recommendations = RecommendationParser.parse_recommendations(recommendations_raw)
                        if parsed_recommendations and len(parsed_recommendations) > 0:
                            discovery_service._log(f"[PLAIN] ✅ Parsed {len(parsed_recommendations)} ideas from markdown format", "INFO")
                        else:
                            discovery_service._log(f"[PLAIN] ❌ Failed to parse ideas from markdown format", "WARNING")
                    
                    # Format recommendations for frontend (markdown format for backward compatibility)
                    if parsed_recommendations and isinstance(parsed_recommendations, list) and len(parsed_recommendations) > 0:
                        recommendations_formatted = RecommendationParser.format_recommendations_for_frontend(parsed_recommendations)
                        discovery_service._log(f"[PLAIN] ✅ Formatted {len(parsed_recommendations)} ideas for frontend", "INFO")
                    else:
                        # If parsing failed, use raw text as fallback (but remove structured markers if present)
                        recommendations_formatted = recommendations_raw
                        if "---STRUCTURED_IDEAS_START---" in recommendations_formatted:
                            recommendations_formatted = recommendations_formatted.split("---STRUCTURED_IDEAS_START---")[0].strip()
                        if "---STRUCTURED_IDEAS_END---" in recommendations_formatted:
                            recommendations_formatted = recommendations_formatted.split("---STRUCTURED_IDEAS_END---")[0].strip()
                        discovery_service._log(f"[PLAIN] ❌ WARNING: Failed to parse recommendations. Using raw text fallback", "WARNING")
                    
                    # Combine collected lines for raw output
                    collected_output = "".join(collected_lines)
                    
                    # Schedule background save (non-blocking - happens after response completes)
                    background_tasks.add_task(
                        save_run_results_background,
                        run_id=run_id,
                        user_id=user_id,
                        inputs=inputs,
                        profile_analysis=profile_analysis,
                        recommendations_formatted=recommendations_formatted,
                        parsed_recommendations=parsed_recommendations,
                        collected_output=collected_output,
                        db_session_maker=None  # Will create new session in background
                    )
                    discovery_service._log(f"Scheduled background save for run {run_id} (plain format)", "INFO")
                    
            except Exception as e:
                # Log error (DB update will happen via background task if needed)
                discovery_service._log(f"Streaming error in plain text handler: {e}", "ERROR")
                # Yield error message as proper SSE event and stop streaming
                error_detail = str(e)
                if isinstance(e, ValidationError):
                    error_detail = e.message
                # Send proper SSE error event that frontend can parse
                yield f"event: error\n"
                yield f"data: {json.dumps({'run_id': run_id, 'error': error_detail})}\n\n"
                return
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={"X-Run-Id": run_id}
        )

