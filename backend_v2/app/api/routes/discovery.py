"""Discovery API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request, Query, Body
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user_or_none
from app.models.user import User
from app.services.discovery_service import DiscoveryService
from app.models.run import Run
from app.models.discovery_result import DiscoveryResult
from app.core.redis_client import get_redis
from rq import Queue
from worker.tasks import run_stage2
from datetime import datetime, timezone
from app.utils.file_logger import write_to_log, write_section_to_log
from app.utils.user_utils import extract_user_id
from app.utils.error_handler import handle_exception, ValidationError
import uuid
import json


def ensure_defaults(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensure all required fields have defaults if missing.
    """
    if not inputs or not isinstance(inputs, dict):
        inputs = {}
    
    # Set defaults for missing required fields
    if "startup_category" not in inputs or not inputs.get("startup_category"):
        inputs["startup_category"] = "both"  # Default to "both" if not specified
    if "risk_tolerance" not in inputs or not inputs.get("risk_tolerance"):
        inputs["risk_tolerance"] = "Moderate"
    if "preferred_work_style" not in inputs or not inputs.get("preferred_work_style"):
        inputs["preferred_work_style"] = "Flexible / No preference"
    if "startup_style" not in inputs or not inputs.get("startup_style"):
        inputs["startup_style"] = "Online-only business"
    if "customer_interaction" not in inputs or not inputs.get("customer_interaction"):
        inputs["customer_interaction"] = "Somewhat comfortable"
    if "location_context" not in inputs or not inputs.get("location_context"):
        inputs["location_context"] = "Urban"
    if "business_region" not in inputs or not inputs.get("business_region"):
        inputs["business_region"] = "Global / Online"
    if "business_type" not in inputs or not inputs.get("business_type"):
        inputs["business_type"] = "No preference"
    if "earnings_timeline" not in inputs or not inputs.get("earnings_timeline"):
        inputs["earnings_timeline"] = "90 days"
    
    # Ensure skills structure (new capability groups)
    if "skills" not in inputs or not isinstance(inputs.get("skills"), dict):
        inputs["skills"] = {
            "product_creation": [],
            "sales_marketing": [],
            "operational": [],
            "digital": [],
            "personality": [],
            "other": ""
        }
    
    return inputs


router = APIRouter(prefix="/api", tags=["discovery"])


class RunRequest(BaseModel):
    """Request model for discovery run - Universal Intake Schema"""
    # Startup Category (FIRST FIELD)
    startup_category: Optional[str] = None  # "tech", "non_tech", or "both"
    
    # Screen 1 - About You
    time_commitment: Optional[str] = None
    budget_range: Optional[str] = None
    risk_tolerance: Optional[str] = None
    preferred_work_style: Optional[str] = None
    startup_style: Optional[str] = None
    skills: Optional[Dict[str, Any]] = None  # {technical: [], creative: [], etc., other: ""}
    customer_interaction: Optional[str] = None
    location_context: Optional[str] = None
    business_region: Optional[str] = None
    
    # Screen 2 - Interests & Goals
    industry_interest: Optional[str] = None
    sub_interest_area: Optional[str] = None
    business_type: Optional[str] = None
    earnings_timeline: Optional[str] = None
    founder_ambition: Optional[str] = None
    experience_summary: Optional[str] = None
    


class RunResponse(BaseModel):
    """Response model for discovery run"""
    success: bool
    run_id: str
    status: str
    outputs: Dict[str, Any] = None
    cached: bool = False


# Existing streaming endpoint
@router.post("/discovery", status_code=status.HTTP_200_OK)
async def create_run(
    request: RunRequest,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none),
    format: str = Query("sse", regex="^(sse|plain)$", description="Response format: 'sse' for Server-Sent Events or 'plain' for plain text")
):
    """
    Create a new discovery run with live streaming
    
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
    from app.services.rate_limit_service import RateLimitService
    from app.core.logger import request_id_var
    
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
    
    # Validate required fields (new universal schema)
    # Check both existence and non-empty values
    required_fields = [
        "startup_category",
        "time_commitment",
        "budget_range",
        "risk_tolerance",
        "preferred_work_style",
        "startup_style",
        "customer_interaction",
        "location_context",
        "business_region",
        "industry_interest",
        "business_type",
        "earnings_timeline",
        "founder_ambition"
    ]

    # skills can be optional OR required — your choice.
# For now we allow either empty dict or list.
    OPTIONAL_FIELDS = [
        "skills",
        "sub_interest_area",
        "experience_summary",
        # legacy fields no longer used but accepted to avoid crashes
        "goal_type",
        "interest_area",
        "work_style",
        "skill_strength",
    ]

    
    missing_fields = []
    for field in required_fields:
        value = inputs.get(field)
        if not value or (isinstance(value, str) and not value.strip()):
            missing_fields.append(field)
    
    # Validate skills structure (optional)
    skills = inputs.get("skills")
    if skills is None:
        # Auto-fill empty skills structure
        inputs["skills"] = {
            "technical": [],
            "creative": [],
            "physical": [],
            "business": [],
            "soft": [],
            "other": ""
        }
    elif not isinstance(skills, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format: 'skills' must be an object with categories"
        )
    else:
        # Ensure all categories exist (fill missing ones)
        default_skills = {
            "technical": [],
            "creative": [],
            "physical": [],
            "business": [],
            "soft": [],
            "other": ""
        }
        cleaned = {}
        for cat, default in default_skills.items():
            val = skills.get(cat, default)
            # Normalize types
            if cat == "other":
                cleaned[cat] = str(val) if val else ""
            else:
                cleaned[cat] = val if isinstance(val, list) else []
        inputs["skills"] = cleaned
    
    if missing_fields:
        # Log the actual inputs for debugging
        import logging
        logger = logging.getLogger("startup_discovery")
        logger.warning(f"Missing required fields: {missing_fields}. Received inputs: {list(inputs.keys())}")
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            details={"missing_fields": missing_fields, "received_fields": list(inputs.keys())}
        )
    
    # Extract user_id consistently
    user_id = extract_user_id(current_user)
    
    # Initialize service
    discovery_service = DiscoveryService(db)
    
    # Log authentication status for debugging
    if not user_id:
        discovery_service._log(f"WARNING: Discovery run created without authentication (user_id will be NULL). Make sure to authenticate in Swagger!", "WARNING")
    else:
        discovery_service._log(f"Creating discovery run for authenticated user: {user_id}", "INFO")
    
    # Check cache before streaming
    cache_key = discovery_service.cache_service.build_discovery_cache_key(inputs, user_id)
    cached_result = discovery_service.cache_service.get_json(cache_key, cache_type="discovery")
    
    if cached_result:
        # Return cached result immediately without streaming
        if format == "sse":
            # Format as SSE events
            cached_text = _format_cached_result(cached_result)
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
            cached_text = _format_cached_result(cached_result)
            return StreamingResponse(
                iter([cached_text]),
                media_type="text/plain",
                headers={"X-Cached": "true"}
            )
    
    # Generate run_id
    run_id = str(uuid.uuid4())
    
    # Create Run record - ensure user_id is explicitly set
    run = Run(
        run_id=run_id,
        user_id=user_id,  # Will be None if not authenticated
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
                
                # Stream workflow chunks and collect results
                stream_completed = False
                collected_output = ""  # Collect all streamed output for debugging
                chunk_count = 0
                buffer = ""  # Buffer tokens until natural boundary
                try:
                    async for chunk in discovery_service.workflow_stream(
                        inputs=inputs,
                        user_id=user_id,
                        run_id=run_id
                    ):
                        chunk_count += 1
                        if chunk:
                            # Accumulate chunks in buffer
                            buffer += chunk
                            collected_output += chunk
                            
                            # Flush only when a natural boundary occurs
                            if (
                                "\n\n" in buffer
                                or buffer.endswith(".")
                                or "---PROFILE_END---" in buffer
                                or "### IDEA_" in buffer
                            ):
                                # Yield ONE SSE event per buffered chunk
                                yield f"data: {buffer}\n\n"
                                buffer = ""
                    
                    # Flush any remaining buffer
                    if buffer.strip():
                        yield f"data: {buffer}\n\n"
                    
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
                
                # Save results to DB in background (non-blocking) - use collected output
                # CRITICAL: Don't call run_discovery() again - it would re-run everything!
                # Instead, save what we already computed during streaming
                if stream_completed and collected_output:
                    try:
                        # Refresh run to get latest state
                        db.refresh(run)
                        # Update user_id if it's missing and we have a user_id to set
                        if user_id and not run.user_id:
                            run.user_id = user_id
                        # Update run status and save the streamed output
                        run.status = "completed"
                        run.completed_at = datetime.now(timezone.utc)
                        
                        # Parse the collected output using the separator
                        SPLIT_TOKEN = "\n\n---PROFILE_END---\n\n"
                        profile_analysis = ""
                        recommendations_raw = ""
                        
                        if SPLIT_TOKEN in collected_output:
                            parts = collected_output.split(SPLIT_TOKEN, 1)
                            profile_analysis = parts[0].strip() if len(parts) > 0 else ""
                            recommendations_raw = parts[1].strip() if len(parts) > 1 else ""
                        else:
                            # Fallback: treat all as recommendations if no separator
                            recommendations_raw = collected_output.strip()
                        
                        # Parse recommendations using the new parser
                        from app.services.recommendation_parser import RecommendationParser
                        parsed_recommendations = RecommendationParser.parse_recommendations(recommendations_raw)
                        
                        # Format recommendations for frontend (markdown format for backward compatibility)
                        recommendations_formatted = RecommendationParser.format_recommendations_for_frontend(parsed_recommendations)
                        
                        # If parsing failed, use raw text as fallback
                        if not parsed_recommendations and recommendations_raw:
                            recommendations_formatted = recommendations_raw
                        
                        # Save the parsed output
                        run.reports = {
                            "streaming_output": collected_output,  # Keep full raw output
                            "profile_analysis": profile_analysis,
                            "personalized_recommendations": recommendations_formatted,  # Formatted markdown
                            "recommendations_structured": parsed_recommendations  # Structured data
                        }
                        run.profile_analysis = profile_analysis
                        run.personalized_recommendations = recommendations_formatted
                        db.commit()
                        
                        # Also save to DiscoveryResult if needed
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
                        
                        # Verify the run was saved correctly
                        db.refresh(run)
                        if run.status != "completed":
                            discovery_service._log(f"WARNING: Run {run_id} status is {run.status} after save, expected 'completed'", "WARNING")
                        
                        discovery_service._log(f"Successfully saved discovery run {run_id} for user {user_id} with status {run.status}", "INFO")
                        
                        # Cache the result for future requests
                        try:
                            cache_key = discovery_service.cache_service.build_discovery_cache_key(inputs, user_id)
                            discovery_service.cache_service.set_json(
                                cache_key,
                                run.reports,
                                cache_type="discovery",
                                ttl_seconds=7 * 24 * 60 * 60  # 7 days
                            )
                        except Exception as cache_error:
                            discovery_service._log(f"Failed to cache result: {cache_error}", "WARNING")
                            
                    except Exception as e:
                        # Log error but don't fail (streaming already completed)
                        import traceback
                        error_traceback = traceback.format_exc()
                        discovery_service._log(f"Failed to save results after streaming: {e}\n{error_traceback}", "ERROR")
                        # Update run status to failed if save fails
                        try:
                            run.status = "failed"
                            run.error_message = f"Failed to save results: {str(e)}"
                            db.commit()
                        except:
                            pass
                    
            except Exception as e:
                # Update run status on error
                try:
                    run.status = "failed"
                    run.error_message = str(e)
                    db.commit()
                except:
                    pass
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
            collected_output = ""  # Collect all streamed output
            
            try:
                # Stream workflow chunks and collect results
                async for chunk in discovery_service.workflow_stream(
                    inputs=inputs,
                    user_id=user_id,
                    run_id=run_id
                ):
                    if chunk:
                        collected_output += chunk
                    yield chunk
                
                stream_completed = True
                
                # CRITICAL: Don't call run_discovery() again - it would re-run everything!
                # Instead, save what we already computed during streaming (same as SSE handler)
                if stream_completed and collected_output:
                    try:
                        # Update run status and save the streamed output
                        run.status = "completed"
                        run.completed_at = datetime.now(timezone.utc)
                        
                        # Parse the collected output using the separator
                        SPLIT_TOKEN = "\n\n---PROFILE_END---\n\n"
                        profile_analysis = ""
                        recommendations_raw = ""
                        
                        if SPLIT_TOKEN in collected_output:
                            parts = collected_output.split(SPLIT_TOKEN, 1)
                            profile_analysis = parts[0].strip() if len(parts) > 0 else ""
                            recommendations_raw = parts[1].strip() if len(parts) > 1 else ""
                        else:
                            # Fallback: treat all as recommendations if no separator
                            recommendations_raw = collected_output.strip()
                        
                        # Parse recommendations using the new parser
                        from app.services.recommendation_parser import RecommendationParser
                        parsed_recommendations = RecommendationParser.parse_recommendations(recommendations_raw)
                        
                        # Format recommendations for frontend (markdown format for backward compatibility)
                        recommendations_formatted = RecommendationParser.format_recommendations_for_frontend(parsed_recommendations)
                        
                        # If parsing failed, use raw text as fallback
                        if not parsed_recommendations and recommendations_raw:
                            recommendations_formatted = recommendations_raw
                        
                        # Save the parsed output
                        run.reports = {
                            "streaming_output": collected_output,  # Keep full raw output
                            "profile_analysis": profile_analysis,
                            "personalized_recommendations": recommendations_formatted,  # Formatted markdown
                            "recommendations_structured": parsed_recommendations  # Structured data
                        }
                        run.profile_analysis = profile_analysis
                        run.personalized_recommendations = recommendations_formatted
                        db.commit()
                        
                        # Also save to DiscoveryResult if needed
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
                        
                        # Verify the run was saved correctly
                        db.refresh(run)
                        if run.status != "completed":
                            discovery_service._log(f"WARNING: Run {run_id} status is {run.status} after save, expected 'completed'", "WARNING")
                        
                        discovery_service._log(f"Successfully saved discovery run {run_id} for user {user_id} with status {run.status}", "INFO")
                        
                    except Exception as save_error:
                        import traceback
                        error_traceback = traceback.format_exc()
                        discovery_service._log(f"Failed to save results after streaming: {save_error}\n{error_traceback}", "ERROR")
                        # Don't fail the request, just log the error
                        try:
                            run.status = "completed"
                            run.error_message = f"Streaming completed but save failed: {str(save_error)}"
                            db.commit()
                        except:
                            pass
                    
            except Exception as e:
                # Update run status on error
                try:
                    run.status = "failed"
                    run.error_message = str(e)
                    db.commit()
                except:
                    pass
                # Yield error message and stop streaming
                error_detail = str(e)
                if isinstance(e, ValidationError):
                    error_detail = e.message
                yield f"\n\n[ERROR] Discovery failed: {error_detail}\n"
                return
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={"X-Run-Id": run_id}
        )


# ---------------------------------------------------------------------------
# New Background Job Endpoint (RQ)
# ---------------------------------------------------------------------------

@router.post("/discovery/run", status_code=status.HTTP_202_ACCEPTED)
async def create_run_background(
    request: RunRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Enqueue discovery stage 2 into background job queue (RQ).
    Returns run_id immediately.
    """
    raw_inputs = request.model_dump(exclude_none=True)
    inputs = ensure_defaults(raw_inputs)
    
    required_fields = [
        "startup_category",
        "time_commitment",
        "budget_range",
        "risk_tolerance",
        "preferred_work_style",
        "startup_style",
        "customer_interaction",
        "location_context",
        "business_region",
        "industry_interest",
        "business_type",
        "earnings_timeline",
        "founder_ambition"
    ]
    missing_fields = [field for field in required_fields if field not in inputs or not inputs[field]]
    
    # Validate and normalize skills (optional)
    skills = inputs.get("skills")
    if skills is None:
        inputs["skills"] = {
            "technical": [],
            "creative": [],
            "physical": [],
            "business": [],
            "soft": [],
            "other": ""
        }
    elif not isinstance(skills, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format: 'skills' must be an object with categories"
        )
    else:
        default_structure = {
            "technical": [],
            "creative": [],
            "physical": [],
            "business": [],
            "soft": [],
            "other": ""
        }
        normalized = {}
        for cat, default in default_structure.items():
            val = skills.get(cat, default)
            if cat == "other":
                normalized[cat] = str(val) if val else ""
            else:
                normalized[cat] = val if isinstance(val, list) else []
        inputs["skills"] = normalized
    
    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required fields: {', '.join(missing_fields)}"
        )

    user_id = extract_user_id(current_user)

    # Create run record (queued)
    run_id = str(uuid.uuid4())
    run = Run(
        run_id=run_id,
        user_id=user_id,
        inputs=inputs,
        status="pending",
        created_at=datetime.now(timezone.utc)
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Enqueue background job
    redis_conn = get_redis()
    if not redis_conn:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Redis not available for queueing"
        )
    q = Queue("default", connection=redis_conn)
    job = q.enqueue(run_stage2, run_id, inputs, user_id)

    return {
        "success": True,
        "run_id": run_id,
        "job_id": job.id,
        "status": "pending"
    }


@router.get("/discovery/status/{run_id}", status_code=status.HTTP_200_OK)
async def get_run_status(
    run_id: str,
    db: Session = Depends(get_db),
):
    """
    Polling endpoint: returns run status (pending|running|completed|failed).
    """
    run = db.query(Run).filter(Run.run_id == run_id).first()
    if not run:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return {
        "run_id": run.run_id,
        "status": run.status,
        "error": run.error_message
    }


def _format_cached_result(cached_result: Dict[str, Any]) -> str:
    """Format cached result as plain text"""
    lines = []
    
    if cached_result.get("profile_analysis"):
        lines.append("### PROFILE ANALYSIS\n\n")
        lines.append(cached_result["profile_analysis"])
        lines.append("\n\n")
    
    if cached_result.get("startup_ideas_research"):
        lines.append("### IDEA RESEARCH\n\n")
        lines.append(cached_result["startup_ideas_research"])
        lines.append("\n\n")
    
    if cached_result.get("personalized_recommendations"):
        lines.append("### FINAL RECOMMENDATION\n\n")
        lines.append(cached_result["personalized_recommendations"])
    
    return "".join(lines)


@router.post("/discovery/enrich_idea", status_code=status.HTTP_200_OK)
async def enrich_idea(
    request: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none),
    format: str = Query("sse", regex="^(sse|json)$", description="Response format: 'sse' for Server-Sent Events or 'json' for JSON")
):
    """
    Enrich a specific idea with personalized premium playbook (on-demand).
    
    Request body:
    {
        "idea": {
            "title": "...",
            "summary": "...",
            "target_market": "...",
            "revenue_model": "..."
        },
        "industry": "ai",
        "profile_analysis": {
            "core_motivations": "...",
            "operating_constraints": "...",
            "strengths_and_capabilities": "...",
            "strategic_considerations": "...",
            "viability_red_flags": "..."
        }
    }
    
    Returns:
    - SSE stream (default): Streams enriched playbook as Server-Sent Events
    - JSON (format=json): Returns structured enrichment object
    """
    # Log that enrichment endpoint was called (at the very start)
    try:
        idea_title = request.get("idea", {}).get("title", "Unknown")
        industry_param = request.get("industry", "")
        write_to_log(f"=== ENRICHMENT API ENDPOINT CALLED === Idea: {idea_title}, Industry: {industry_param}, Format: {format}", "INFO", "DiscoveryAPI")
    except Exception as log_err:
        print(f"Warning: Failed to write endpoint call log: {log_err}")
        import traceback
        traceback.print_exc()
    
    from app.services.tool_service import ToolService
    from app.core.redis_client import get_redis
    
    redis_client = get_redis()
    tool_service = ToolService(db, redis_client)
    
    # Extract request data
    idea = request.get("idea", {})
    industry = request.get("industry", "")
    profile_analysis_raw = request.get("profile_analysis", {})
    
    # Handle profile_analysis - it might be a string (markdown) or a dict
    profile_analysis = {}
    if isinstance(profile_analysis_raw, str):
        # Try to extract JSON from the markdown string
        # Look for JSON between PROFILE_ANALYSIS_START and PROFILE_ANALYSIS_END markers
        try:
            from app.utils.text_cleaner import extract_profile_json
            import json
            json_str = extract_profile_json(profile_analysis_raw)
            if json_str:
                profile_analysis = json.loads(json_str)
            else:
                profile_analysis = {}
        except Exception as e:
            # If parsing fails, use empty dict
            print(f"Warning: Failed to parse profile_analysis from string: {e}")
            import traceback
            traceback.print_exc()
            profile_analysis = {}
    elif isinstance(profile_analysis_raw, dict):
        profile_analysis = profile_analysis_raw
    else:
        profile_analysis = {}
    
    if not idea.get("title") or not idea.get("summary"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idea must have 'title' and 'summary' fields"
        )
    
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Industry is required"
        )
    
    # Extract user_id consistently
    user_id = extract_user_id(current_user)
    
    if format == "json":
        # Return JSON response (non-streaming)
        # Use tool_service.enrich_idea which includes all logging and returns both parsed and raw content
        enrichment_result = tool_service.enrich_idea(
            idea=idea,
            industry=industry,
            profile_analysis=profile_analysis,
            run_id=None,
            user_id=user_id
        )
        
        # enrich_idea now returns {"parsed": {...}, "raw_content": "..."}
        parsed_result = enrichment_result.get("parsed", {})
        raw_content = enrichment_result.get("raw_content", "")
        
        response_payload = {
            "success": True,
            "enrichment": {
                "body": raw_content,  # Return raw markdown for frontend parsing
                "parsed": parsed_result  # Also include parsed for debugging
            }
        }
        
        try:
            payload_text = json.dumps(response_payload, indent=2)
            write_section_to_log("JSON PAYLOAD RETURNED TO FRONTEND", payload_text, "INFO", "DiscoveryAPI")
        except Exception as log_err:
            print(f"Warning: Failed to write payload log: {log_err}")
            import traceback
            traceback.print_exc()
        
        return response_payload
    else:
        # Stream SSE response
        async def generate_enrichment_sse():
            try:
                # Send initial event
                yield f"event: start\n"
                yield f"data: {json.dumps({'status': 'enriching', 'idea': idea.get('title', '')})}\n\n"
                
                # Stream enrichment chunks
                buffer = ""
                async for chunk in tool_service.enrich_idea_stream(
                    idea=idea,
                    industry=industry,
                    profile_analysis=profile_analysis,
                    user_id=user_id
                ):
                    if chunk:
                        buffer += chunk
                        # Flush on natural boundaries
                        if "\n\n" in buffer or buffer.endswith(":"):
                            # Format as SSE data event
                            yield f"data: {buffer}\n\n"
                            buffer = ""
                
                # Flush remaining buffer
                if buffer.strip():
                    yield f"data: {buffer}\n\n"
                
                # Send completion event
                yield f"event: complete\n"
                yield f"data: {json.dumps({'status': 'completed'})}\n\n"
                
            except Exception as e:
                yield f"event: error\n"
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate_enrichment_sse(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )


@router.get("/user/run/{run_id}", status_code=status.HTTP_200_OK)
async def get_run(
    run_id: str,
    db: Session = Depends(get_db),
    user_id: str = None  # TODO: Get from auth middleware
):
    """
    Get a discovery run by ID
    """
    try:
        run = db.query(Run).filter(Run.run_id == run_id).first()
        
        if not run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Run {run_id} not found"
            )
        
        # TODO: Check user authorization
        
        # Normalize inputs to ensure backward compatibility with old runs
        # Old runs might not have startup_category, so we add it with default value
        normalized_inputs = ensure_defaults(run.inputs or {})
        
        # JSONB columns return Python dicts directly (no parsing needed)
        reports = run.reports or {}
        
        return {
            "success": True,
            "run": {
                "run_id": run.run_id,
                "user_id": run.user_id,
                "inputs": normalized_inputs,
                "reports": reports,
                "profile_analysis": run.profile_analysis,
                "personalized_recommendations": run.personalized_recommendations,
                "status": run.status,
                "created_at": run.created_at.isoformat() if run.created_at else None,
                "completed_at": run.completed_at.isoformat() if run.completed_at else None,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch run: {str(e)}"
        )


@router.post("/enhance-report", status_code=status.HTTP_200_OK)
async def enhance_report(
    request: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Enhance a report with additional insights (mock implementation for now)
    
    Request body:
    - run_id: UUID of the run to enhance
    
    Returns:
    - success: bool
    - enhancements: Dict with enhanced insights
    """
    try:
        run_id = request.get("run_id")
        if not run_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="run_id is required"
            )
        
        # Get the run
        run = db.query(Run).filter(Run.run_id == run_id).first()
        if not run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Run {run_id} not found"
            )
        
        # TODO: Implement actual enhancement logic
        # For now, return mock data
        return {
            "success": True,
            "enhancements": {
                "similar_ideas": [],
                "market_insights": [],
                "validation_suggestions": []
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enhance report: {str(e)}"
        )

