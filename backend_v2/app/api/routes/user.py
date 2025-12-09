"""User API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.user_service import UserService

router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard summary metrics for the current user
    
    Returns:
        Dashboard data with summary statistics
    """
    try:
        user_service = UserService(db)
        result = user_service.get_dashboard_data(current_user.user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}"
        )


@router.get("/activity", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of items to return")
):
    """
    Get user activity list (runs and validations)
    
    Query Parameters:
    - limit: Maximum number of items to return (default: 50, max: 100)
    
    Returns:
        List of user activities including runs and validations
    """
    try:
        user_service = UserService(db)
        result = user_service.get_user_activity(current_user.user_id, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user activity: {str(e)}"
        )


@router.get("/actions", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_actions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    idea_id: Optional[str] = Query(None, description="Filter actions by idea ID")
):
    """
    Get user actions feed
    
    Query Parameters:
    - idea_id: Optional filter by idea ID
    
    Returns:
        List of user actions
    """
    try:
        user_service = UserService(db)
        result = user_service.get_user_actions(current_user.user_id, idea_id=idea_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user actions: {str(e)}"
        )


@router.get("/notes", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_notes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    idea_id: Optional[str] = Query(None, description="Filter notes by idea ID")
):
    """
    Get user notes list
    
    Query Parameters:
    - idea_id: Optional filter by idea ID
    
    Returns:
        List of user notes
    """
    try:
        user_service = UserService(db)
        result = user_service.get_user_notes(current_user.user_id, idea_id=idea_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user notes: {str(e)}"
        )

