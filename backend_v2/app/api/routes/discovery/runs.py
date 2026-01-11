"""Discovery run CRUD operations"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy import and_
import uuid
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.run import Run
from app.api.models.discovery_models import RunRequest
from app.utils.user_utils import extract_user_id, verify_run_ownership
from app.utils.error_handler import handle_exception, NotFoundError
from app.utils.discovery.discovery_validators import ensure_defaults, validate_required_fields, normalize_skills
from app.core.redis_client import get_redis
from rq import Queue
from worker.tasks import run_stage2

router = APIRouter()


@router.post("/discovery/run", status_code=status.HTTP_202_ACCEPTED)
async def create_run_background(
    request: RunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Enqueue discovery stage 2 into background job queue (RQ).
    Returns run_id immediately.
    
    Requires authentication - all runs must be associated with a logged-in user.
    """
    raw_inputs = request.model_dump(exclude_none=True)
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
    current_user: User = Depends(get_current_user)
):
    """
    Polling endpoint: returns run status (pending|running|completed|failed).
    
    Requires authentication and verifies that the user owns the run.
    """
    try:
        # Authentication is required, so user_id will always be present
        user_id = extract_user_id(current_user)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required - user_id is missing"
            )
        
        # Query the run (exclude soft-deleted runs)
        run = db.query(Run).filter(
            and_(
                Run.run_id == run_id,
                Run.deleted_at.is_(None)  # Exclude soft-deleted runs
            )
        ).first()
        
        if not run:
            raise NotFoundError("Run", run_id)
        
        # Verify user has permission to access this run
        verify_run_ownership(run.user_id, user_id, resource_name="run")
        
        return {
            "run_id": run.run_id,
            "status": run.status,
            "error": run.error_message
        }
    except Exception as e:
        raise handle_exception(
            error=e,
            context={
                "endpoint": "get_run_status",
                "run_id": run_id,
                "user_id": user_id if current_user else None
            }
        )


@router.get("/user/run/{run_id}", status_code=status.HTTP_200_OK)
async def get_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a discovery run by ID
    
    Requires authentication and verifies that the user owns the run.
    """
    import logging
    import traceback
    logger = logging.getLogger(__name__)
    
    try:
        # Authentication is required, so user_id will always be present
        user_id = extract_user_id(current_user)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required - user_id is missing"
            )
        
        # Query the run (exclude soft-deleted runs)
        run = db.query(Run).filter(
            and_(
                Run.run_id == run_id,
                Run.deleted_at.is_(None)  # Exclude soft-deleted runs
            )
        ).first()
        
        if not run:
            raise NotFoundError("Run", run_id)
        
        # Verify user has permission to access this run
        verify_run_ownership(run.user_id, user_id, resource_name="run")
        
        # Normalize inputs to ensure backward compatibility with old runs
        # Old runs might not have startup_category, so we add it with default value
        try:
            # Handle case where inputs might be None or not a dict
            raw_inputs = run.inputs
            if raw_inputs is None:
                raw_inputs = {}
            elif not isinstance(raw_inputs, dict):
                # If inputs is stored as a string (old format), try to parse it
                if isinstance(raw_inputs, str):
                    import json
                    try:
                        raw_inputs = json.loads(raw_inputs)
                    except json.JSONDecodeError:
                        logger.warning(f"Failed to parse inputs as JSON for run {run_id}, using empty dict")
                        raw_inputs = {}
                else:
                    logger.warning(f"Unexpected inputs type {type(raw_inputs)} for run {run_id}, using empty dict")
                    raw_inputs = {}
            
            normalized_inputs = ensure_defaults(raw_inputs)
        except Exception as inputs_error:
            logger.error(f"Error normalizing inputs for run {run_id}: {str(inputs_error)}\n{traceback.format_exc()}")
            # Fallback to empty dict if normalization fails
            normalized_inputs = {}
        
        # JSONB columns return Python dicts directly (no parsing needed)
        # But handle case where reports might be None or a string
        try:
            reports = run.reports or {}
            if isinstance(reports, str):
                import json
                try:
                    reports = json.loads(reports)
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse reports as JSON for run {run_id}, using empty dict")
                    reports = {}
            elif not isinstance(reports, dict):
                logger.warning(f"Unexpected reports type {type(reports)} for run {run_id}, using empty dict")
                reports = {}
            
            # Log what's in reports for debugging
            logger.info(f"[get_run] Run {run_id} reports structure: keys={list(reports.keys()) if isinstance(reports, dict) else 'not a dict'}")
            if isinstance(reports, dict) and "recommendations_structured" in reports:
                structured_count = len(reports["recommendations_structured"]) if isinstance(reports["recommendations_structured"], list) else "not a list"
                logger.info(f"[get_run] Run {run_id} has recommendations_structured: count={structured_count}")
            else:
                logger.warning(f"[get_run] Run {run_id} does NOT have recommendations_structured in reports")
        except Exception as reports_error:
            logger.error(f"Error processing reports for run {run_id}: {str(reports_error)}\n{traceback.format_exc()}")
            reports = {}
        
        # Log personalized_recommendations field
        recommendations_length = len(run.personalized_recommendations) if run.personalized_recommendations else 0
        profile_length = len(run.profile_analysis) if run.profile_analysis else 0
        logger.info(f"[get_run] Run {run_id} - profile_analysis length: {profile_length}, personalized_recommendations length: {recommendations_length}")
        if run.personalized_recommendations:
            preview = run.personalized_recommendations[:200] if len(run.personalized_recommendations) > 200 else run.personalized_recommendations
            logger.info(f"[get_run] Run {run_id} personalized_recommendations preview: {preview}")
        
        # Safely serialize dates
        try:
            created_at = run.created_at.isoformat() if run.created_at else None
        except Exception as date_error:
            logger.warning(f"Error serializing created_at for run {run_id}: {str(date_error)}")
            created_at = None
        
        try:
            completed_at = run.completed_at.isoformat() if run.completed_at else None
        except Exception as date_error:
            logger.warning(f"Error serializing completed_at for run {run_id}: {str(date_error)}")
            completed_at = None
        
        response_data = {
            "success": True,
            "run": {
                "run_id": run.run_id,
                "user_id": run.user_id,
                "inputs": normalized_inputs,
                "reports": reports,
                "profile_analysis": run.profile_analysis,
                "personalized_recommendations": run.personalized_recommendations,
                "status": run.status,
                "created_at": created_at,
                "completed_at": completed_at,
            }
        }
        
        # Log final response structure
        logger.info(f"[get_run] Run {run_id} response - has reports: {bool(response_data['run']['reports'])}, reports keys: {list(response_data['run']['reports'].keys()) if isinstance(response_data['run']['reports'], dict) else 'not a dict'}, has recommendations_structured: {bool(response_data['run']['reports'].get('recommendations_structured') if isinstance(response_data['run']['reports'], dict) else False)}")
        
        return response_data
    except Exception as e:
        # Log the full traceback for debugging
        logger.error(f"Error in get_run endpoint for run_id {run_id}: {str(e)}\n{traceback.format_exc()}")
        raise handle_exception(
            error=e,
            context={
                "endpoint": "get_run",
                "run_id": run_id,
                "user_id": extract_user_id(current_user) if current_user else None
            }
        )

