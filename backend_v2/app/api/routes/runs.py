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
    
    Returns:
    - runs: List of run objects
    - pagination: Pagination metadata
    """
    try:
        user_id = current_user.user_id if current_user else None
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


@router.delete("/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_run(
    run_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = None  # TODO: Get from auth middleware
):
    """
    Soft delete a run by setting deleted_at timestamp
    
    Path Parameters:
    - run_id: UUID of the run to delete
    
    Returns:
    - 204 No Content on success
    """
    try:
        run_history_service = RunHistoryService(db)
        run_history_service.soft_delete_run(run_id=run_id, user_id=user_id)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete run: {str(e)}"
        )

