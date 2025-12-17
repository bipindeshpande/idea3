"""Run history API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.core.database import get_db
from app.core.dependencies import get_current_user_or_none
from app.models.user import User
from app.services.run_history_service import RunHistoryService

router = APIRouter()


@router.get("", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_runs(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status (pending, processing, completed, failed)"),
    sort_by: str = Query("created_at", description="Field to sort by (created_at, completed_at, status)"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order (asc, desc)"),
    include_all: bool = Query(False, description="Include all runs regardless of user (for debugging)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Get paginated list of runs
    
    Query Parameters:
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    - status: Filter by status (optional)
    - sort_by: Field to sort by (default: created_at)
    - sort_order: Sort order - asc or desc (default: desc)
    - include_all: If true, show all runs regardless of user_id (for debugging)
    
    Returns:
    - runs: List of run objects
    - pagination: Pagination metadata
    """
    try:
        # For debugging: if include_all=True, don't filter by user_id
        user_id = None if include_all else (current_user.user_id if current_user else None)
        
        run_history_service = RunHistoryService(db)
        result = run_history_service.get_runs(
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_order=sort_order,
            user_id=user_id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch runs: {str(e)}"
        )


@router.get("/stats", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_runs_stats(
    include_all: bool = Query(False, description="Include all runs regardless of user (for debugging)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Get statistics about runs (discoveries vs validations)
    
    Query Parameters:
    - include_all: If true, show stats for all runs regardless of user_id (for debugging)
    
    Returns:
        - success: Boolean
        - discoveries: Count of discovery runs
        - validations: Count of validation runs
        - other: Count of other runs
    """
    try:
        # For debugging: if include_all=True, don't filter by user_id
        user_id = None if include_all else (current_user.user_id if current_user else None)
        
        run_history_service = RunHistoryService(db)
        
        # Get all runs for the user using the service (normalized format)
        all_runs_result = run_history_service.get_runs(
            page=1,
            page_size=1000,  # Get a large number to count all
            user_id=user_id
        )
        
        runs = all_runs_result.get("runs", [])
        
        # Count by run_type (from normalized runs)
        discoveries = sum(1 for run in runs if run.get("run_type") == "discovery")
        validations = sum(1 for run in runs if run.get("run_type") == "validation")
        other = len(runs) - discoveries - validations
        
        return {
            "success": True,
            "discoveries": discoveries,
            "validations": validations,
            "other": other,
            "total": len(runs)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch run statistics: {str(e)}"
        )


@router.get("/{run_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Get full details for a specific run
    
    Path Parameters:
    - run_id: UUID of the run
    
    Returns:
    - Full run details including inputs, reports, and metadata
    """
    try:
        user_id = current_user.user_id if current_user else None
        run_history_service = RunHistoryService(db)
        result = run_history_service.get_run_by_id(run_id=run_id, user_id=user_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch run: {str(e)}"
        )


@router.post("/assign-null-runs", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def assign_null_runs_to_user(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Assign all runs with user_id = NULL to the current authenticated user
    
    This is useful for migrating old runs that were created before authentication
    was required.
    
    Returns:
        - success: Boolean
        - assigned_count: Number of runs assigned
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        from app.models.run import Run
        
        # Count runs with NULL user_id
        null_runs_count = db.query(Run).filter(
            Run.user_id.is_(None),
            Run.deleted_at.is_(None)
        ).count()
        
        # Update runs with NULL user_id to current user
        updated = db.query(Run).filter(
            Run.user_id.is_(None),
            Run.deleted_at.is_(None)
        ).update(
            {Run.user_id: current_user.user_id},
            synchronize_session=False
        )
        
        db.commit()
        
        return {
            "success": True,
            "assigned_count": updated,
            "message": f"Assigned {updated} runs to user {current_user.user_id}"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign runs: {str(e)}"
        )


@router.delete("/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Soft delete a run by setting deleted_at timestamp
    
    Path Parameters:
    - run_id: UUID of the run to delete
    
    Returns:
    - 204 No Content on success
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        user_id = current_user.user_id if current_user else None
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to delete runs"
            )
        
        logger.info(f"[API] delete_run called: run_id={run_id}, user_id={user_id}")
        
        run_history_service = RunHistoryService(db)
        run_history_service.soft_delete_run(run_id=run_id, user_id=user_id)
        
        logger.info(f"[API] Successfully deleted run: run_id={run_id}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[API] Error deleting run {run_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete run: {str(e)}"
        )
