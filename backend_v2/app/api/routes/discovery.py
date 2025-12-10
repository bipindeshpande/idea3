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
import uuid
import json


def map_old_to_new_schema(old_inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map old intake schema to new universal intake schema for backward compatibility.
    """
    if not old_inputs or not isinstance(old_inputs, dict):
        return old_inputs
    
    # Check if already new schema (has new fields AND doesn't have old fields)
    has_new_fields = any(key in old_inputs for key in [
        "risk_tolerance", "preferred_work_style", "industry_interest", "founder_ambition"
    ])
    has_old_fields = any(key in old_inputs for key in [
        "goal_type", "interest_area", "work_style", "skill_strength"
    ])
    
    if has_new_fields and not has_old_fields:
        # Already new schema - ensure all required fields have defaults if missing
        mapped = old_inputs.copy()
        # Set defaults for missing required fields
        if "risk_tolerance" not in mapped or not mapped.get("risk_tolerance"):
            mapped["risk_tolerance"] = "Moderate"
        if "preferred_work_style" not in mapped or not mapped.get("preferred_work_style"):
            mapped["preferred_work_style"] = "No preference"
        if "startup_style" not in mapped or not mapped.get("startup_style"):
            mapped["startup_style"] = "Online only"
        if "customer_interaction" not in mapped or not mapped.get("customer_interaction"):
            mapped["customer_interaction"] = "Somewhat comfortable"
        if "location_context" not in mapped or not mapped.get("location_context"):
            mapped["location_context"] = "Urban"
        if "business_type" not in mapped or not mapped.get("business_type"):
            mapped["business_type"] = "No preference"
        if "earnings_timeline" not in mapped or not mapped.get("earnings_timeline"):
            mapped["earnings_timeline"] = "90 days"
        # Ensure skills structure
        if "skills" not in mapped or not isinstance(mapped.get("skills"), dict):
            mapped["skills"] = {
                "technical": [],
                "creative": [],
                "physical": [],
                "business": [],
                "soft": [],
                "other": ""
            }
        return mapped
    
    # Map old to new
    mapped = {}
    
    # Direct mappings
    if "time_commitment" in old_inputs:
        mapped["time_commitment"] = old_inputs["time_commitment"]
    if "budget_range" in old_inputs:
        mapped["budget_range"] = old_inputs["budget_range"]
    if "experience_summary" in old_inputs:
        mapped["experience_summary"] = old_inputs["experience_summary"]
    
    # Map interest_area to industry_interest
    if "interest_area" in old_inputs:
        interest_mapping = {
            "AI / Automation": "AI & Automation",
            "Consulting & Professional Services": "Freelancing / Consulting",
            "Education / EdTech": "Education",
            "Healthcare / Wellness": "Beauty & Wellness",
            "Finance / Investment": "Finance / Accounting",
            "E-commerce / Retail": "Retail & E-commerce",
            "Content / Media / Creator Economy": "Other",
            "Sustainability / Green Tech": "Social Impact",
            "Lifestyle / Travel / Food": "Travel & Tourism",
            "Other (Custom)": "Other"
        }
        mapped["industry_interest"] = interest_mapping.get(old_inputs["interest_area"], old_inputs["interest_area"])
    
    if "sub_interest_area" in old_inputs:
        mapped["sub_interest_area"] = old_inputs["sub_interest_area"]
    
    # Map work_style to preferred_work_style
    if "work_style" in old_inputs:
        work_style_mapping = {
            "Solo": "Solo",
            "Small Team": "Small team",
            "Community-Based": "Community-based",
            "Remote Only": "Remote only",
            "Requires Physical Presence": "On-site OK"
        }
        mapped["preferred_work_style"] = work_style_mapping.get(old_inputs["work_style"], old_inputs["work_style"])
    
    # Map skill_strength to skills
    if "skill_strength" in old_inputs:
        skill_mapping = {
            "Technical / Automation": {"technical": ["Coding", "Automation"]},
            "Analytical / Strategic": {"business": ["Strategy"]},
            "Creative / Design": {"creative": ["Design"]},
            "Operational / Process": {"business": ["Management"]},
            "Communication / Community": {"soft": ["Communication"]},
            "Financial / Analytical": {"business": ["Finance"]},
            "Research / Insight-Driven": {"business": ["Strategy"]},
            "Other / Mixed": {}
        }
        mapped["skills"] = skill_mapping.get(old_inputs["skill_strength"], {})
    
    # Map goal_type to founder_ambition
    if "goal_type" in old_inputs:
        goal_mapping = {
            "Extra Income": "Side income",
            "Replace Full-Time Job": "Full-time business",
            "Passive Income": "Scalable venture",
            "Passion Project": "Turn hobby into business",
            "Social Impact / Non-Profit": "Social Impact",
            "Tech-Driven Venture": "Scalable venture",
            "Consulting / Knowledge Business": "Part-time business",
            "Experimental / Learning Project": "Side income"
        }
        mapped["founder_ambition"] = goal_mapping.get(old_inputs["goal_type"], "Side income")
    
    # Set defaults for missing required fields
    if "risk_tolerance" not in mapped:
        mapped["risk_tolerance"] = "Moderate"
    if "preferred_work_style" not in mapped:
        mapped["preferred_work_style"] = "No preference"
    if "startup_style" not in mapped:
        mapped["startup_style"] = "Online only"
    if "customer_interaction" not in mapped:
        mapped["customer_interaction"] = "Somewhat comfortable"
    if "location_context" not in mapped:
        mapped["location_context"] = "Urban"
    if "business_type" not in mapped:
        mapped["business_type"] = "No preference"
    if "earnings_timeline" not in mapped:
        mapped["earnings_timeline"] = "90 days"
    
    # Ensure skills structure
    if "skills" not in mapped or not isinstance(mapped["skills"], dict):
        mapped["skills"] = {
            "technical": [],
            "creative": [],
            "physical": [],
            "business": [],
            "soft": [],
            "other": ""
        }
    
    # Merge with any other fields from old_inputs
    for key, value in old_inputs.items():
        if key not in ["goal_type", "interest_area", "work_style", "skill_strength"]:
            if key not in mapped:
                mapped[key] = value
    
    return mapped


router = APIRouter(prefix="/api", tags=["discovery"])


class RunRequest(BaseModel):
    """Request model for discovery run - Universal Intake Schema"""
    # Screen 1 - About You
    time_commitment: Optional[str] = None
    budget_range: Optional[str] = None
    risk_tolerance: Optional[str] = None
    preferred_work_style: Optional[str] = None
    startup_style: Optional[str] = None
    skills: Optional[Dict[str, Any]] = None  # {technical: [], creative: [], etc., other: ""}
    customer_interaction: Optional[str] = None
    location_context: Optional[str] = None
    
    # Screen 2 - Interests & Goals
    industry_interest: Optional[str] = None
    sub_interest_area: Optional[str] = None
    business_type: Optional[str] = None
    earnings_timeline: Optional[str] = None
    founder_ambition: Optional[str] = None
    experience_summary: Optional[str] = None
    
    # Backward compatibility - old fields (will be mapped to new schema)
    goal_type: Optional[str] = None
    interest_area: Optional[str] = None
    work_style: Optional[str] = None
    skill_strength: Optional[str] = None


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
        user_id = current_user.user_id if current_user else None
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
    
    # Map old schema to new schema if needed (backward compatibility)
    inputs = map_old_to_new_schema(raw_inputs)
    
    # Validate required fields (new universal schema)
    # Check both existence and non-empty values
    required_fields = [
        "time_commitment",
        "budget_range",
        "risk_tolerance",
        "preferred_work_style",
        "startup_style",
        "customer_interaction",
        "location_context",
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required fields: {', '.join(missing_fields)}"
        )
    
    # Get user_id from authenticated user
    user_id = current_user.user_id if current_user else None
    
    # Initialize service
    discovery_service = DiscoveryService(db)
    
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
    
    # Create Run record
    run = Run(
        run_id=run_id,
        user_id=user_id,
        inputs=inputs,
        status="processing",
        created_at=datetime.now(timezone.utc)
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    
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
                        discovery_service._log(f"Failed to save results after streaming: {e}", "ERROR")
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
                # Send error event
                yield f"event: error\n"
                yield f"data: {json.dumps({'run_id': run_id, 'error': str(e)})}\n\n"
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
                        
                    except Exception as save_error:
                        discovery_service._log(f"Failed to save results after streaming: {save_error}", "ERROR")
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
                yield f"\n\n[ERROR] Discovery failed: {str(e)}\n"
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
    inputs = map_old_to_new_schema(raw_inputs)
    
    required_fields = [
        "time_commitment",
        "budget_range",
        "risk_tolerance",
        "preferred_work_style",
        "startup_style",
        "customer_interaction",
        "location_context",
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

    user_id = current_user.user_id if current_user else None

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


@router.get("/user/run/{run_id}", status_code=status.HTTP_200_OK)
async def get_run(
    run_id: str,
    db: Session = Depends(get_db),
    user_id: str = None  # TODO: Get from auth middleware
):
    """
    Get a discovery run by ID
    """
    run = db.query(Run).filter(Run.run_id == run_id).first()
    
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Run {run_id} not found"
        )
    
    # TODO: Check user authorization
    
    # JSONB columns return Python dicts directly (no parsing needed)
    reports = run.reports or {}
    
    return {
        "success": True,
        "run": {
            "run_id": run.run_id,
            "user_id": run.user_id,
            "inputs": run.inputs,
            "reports": reports,
            "profile_analysis": run.profile_analysis,
            "personalized_recommendations": run.personalized_recommendations,
            "status": run.status,
            "created_at": run.created_at.isoformat() if run.created_at else None,
            "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        }
    }


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

