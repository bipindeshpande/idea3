"""User API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.user_service import UserService

router = APIRouter()


# Pydantic models for request bodies
class CreateActionRequest(BaseModel):
    idea_id: str
    action_text: str
    status: str = "pending"
    due_date: Optional[str] = None


class UpdateActionRequest(BaseModel):
    status: str


class CreateNoteRequest(BaseModel):
    idea_id: str
    content: str
    tags: List[str] = []


class CompareSessionsRequest(BaseModel):
    run_ids: List[str]
    validation_ids: List[str] = []


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


@router.get("/smart-recommendations", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_smart_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get smart recommendations based on user's validation history
    
    Returns:
        Similar high-scoring ideas from validation history
    """
    try:
        user_service = UserService(db)
        result = user_service.get_smart_recommendations(current_user.user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch smart recommendations: {str(e)}"
        )


@router.post("/actions", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_action(
    request: CreateActionRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new action for the current user
    
    Request Body:
        - idea_id: Idea ID
        - action_text: Action text
        - status: Action status (default: "pending")
        - due_date: Optional due date (ISO format string)
    
    Returns:
        Created action with id and timestamps
    """
    try:
        user_service = UserService(db)
        result = user_service.create_action(
            user_id=current_user.user_id,
            idea_id=request.idea_id,
            action_text=request.action_text,
            status=request.status,
            due_date=request.due_date
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create action: {str(e)}"
        )


@router.put("/actions/{action_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def update_action(
    action_id: str = Path(..., description="Action ID"),
    request: UpdateActionRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an action's status
    
    Path Parameters:
        - action_id: Action ID
    
    Request Body:
        - status: New status
    
    Returns:
        Updated action
    """
    try:
        user_service = UserService(db)
        result = user_service.update_action(
            user_id=current_user.user_id,
            action_id=action_id,
            status=request.status
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update action: {str(e)}"
        )


@router.post("/notes", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_note(
    request: CreateNoteRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new note for the current user
    
    Request Body:
        - idea_id: Idea ID
        - content: Note content
        - tags: Optional list of tags (default: [])
    
    Returns:
        Created note with id and timestamps
    """
    try:
        user_service = UserService(db)
        result = user_service.create_note(
            user_id=current_user.user_id,
            idea_id=request.idea_id,
            content=request.content,
            tags=request.tags
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create note: {str(e)}"
        )


@router.post("/compare-sessions", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def compare_sessions(
    request: CompareSessionsRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compare multiple discovery sessions
    
    Request Body:
        - run_ids: List of run IDs to compare
        - validation_ids: List of validation IDs to compare (optional)
    
    Returns:
        Comparison data with runs and their reports
    """
    try:
        user_service = UserService(db)
        result = user_service.compare_sessions(
            user_id=current_user.user_id,
            run_ids=request.run_ids,
            validation_ids=request.validation_ids
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare sessions: {str(e)}"
        )

