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


class UpdateNoteRequest(BaseModel):
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class CompareSessionsRequest(BaseModel):
    run_ids: List[str]
    validation_ids: List[str] = []


class UpdatePreferencesRequest(BaseModel):
    preferences: Dict[str, Any]


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
    import traceback
    try:
        user_service = UserService(db)
        result = user_service.get_user_activity(current_user.user_id, limit=limit)
        return result
    except Exception as e:
        # Log full traceback for debugging
        error_traceback = traceback.format_exc()
        print(f"Error in get_user_activity: {str(e)}\n{error_traceback}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user activity: {str(e)}"
        )


@router.get("/actions", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_actions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    idea_id: Optional[str] = Query(None, description="Filter actions by idea ID (canonical format: run_id::idea_index)")
):
    """
    Get user actions feed
    
    Canonical idea_id format: {run_id}::idea_{index}
    Example: "abc123::idea_1"
    This format must not change.
    
    Query Parameters:
    - idea_id: Optional filter by idea ID (must be in canonical format)
    
    Returns:
        List of user actions
    """
    try:
        user_service = UserService(db)
        result = user_service.get_user_actions(current_user.user_id, idea_id=idea_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"[API] Error in get_user_actions: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user actions: {str(e)}"
        )


@router.get("/notes", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_notes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    idea_id: Optional[str] = Query(None, description="Filter notes by idea ID (canonical format: run_id::idea_index)")
):
    """
    Get user notes list
    
    Canonical idea_id format: {run_id}::idea_{index}
    Example: "abc123::idea_1"
    This format must not change.
    
    Query Parameters:
    - idea_id: Optional filter by idea ID (must be in canonical format)
    
    Returns:
        List of user notes
    """
    try:
        user_service = UserService(db)
        result = user_service.get_user_notes(current_user.user_id, idea_id=idea_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"[API] Error in get_user_notes: {str(e)}", exc_info=True)
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
    
    Canonical idea_id format: {run_id}::idea_{index}
    Example: "abc123::idea_1"
    This format must not change.
    
    Request Body:
        - idea_id: Idea ID (canonical format: run_id::idea_index)
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
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"[API create_action] Exception: {str(e)}", exc_info=True)
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
    
    Canonical idea_id format: {run_id}::idea_{index}
    Example: "abc123::idea_1"
    This format must not change.
    
    Request Body:
        - idea_id: Idea ID (canonical format: run_id::idea_index)
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
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"[API create_note] Exception: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create note: {str(e)}"
        )


@router.delete("/actions/{action_id}", status_code=status.HTTP_200_OK)
async def delete_action(
    action_id: str = Path(..., description="Action ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an action
    
    Path Parameters:
        - action_id: Action ID
    
    Returns:
        Success confirmation
    """
    try:
        user_service = UserService(db)
        result = user_service.delete_action(
            user_id=current_user.user_id,
            action_id=action_id
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
            detail=f"Failed to delete action: {str(e)}"
        )


@router.delete("/notes/{note_id}", status_code=status.HTTP_200_OK)
async def delete_note(
    note_id: str = Path(..., description="Note ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a note
    
    Path Parameters:
        - note_id: Note ID
    
    Returns:
        Success confirmation
    """
    try:
        user_service = UserService(db)
        result = user_service.delete_note(
            user_id=current_user.user_id,
            note_id=note_id
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
            detail=f"Failed to delete note: {str(e)}"
        )


@router.put("/notes/{note_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def update_note(
    note_id: str = Path(..., description="Note ID"),
    request: UpdateNoteRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a note
    
    Path Parameters:
        - note_id: Note ID
    
    Request Body:
        - content: Updated note content (optional)
        - tags: Updated tags list (optional)
    
    Returns:
        Updated note
    """
    try:
        user_service = UserService(db)
        result = user_service.update_note(
            user_id=current_user.user_id,
            note_id=note_id,
            content=request.content,
            tags=request.tags
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
            detail=f"Failed to update note: {str(e)}"
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


@router.delete("/run/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_run(
    run_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soft delete a run for the current user
    
    Path Parameters:
        - run_id: UUID of the run to delete
    
    Returns:
        - 204 No Content on success
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"[API] delete_user_run called: run_id={run_id}, user_id={current_user.user_id}")
        
        from app.services.run_history_service import RunHistoryService
        run_history_service = RunHistoryService(db)
        run_history_service.soft_delete_run(run_id=run_id, user_id=current_user.user_id)
        
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


@router.put("/preferences", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def update_user_preferences(
    request: UpdatePreferencesRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user preferences
    
    Request Body:
        - preferences: Dictionary of preferences to update
    
    Returns:
        Updated user preferences
    """
    try:
        user = db.query(User).filter(User.user_id == current_user.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Merge with existing preferences
        current_preferences = user.preferences or {}
        updated_preferences = {**current_preferences, **request.preferences}
        
        user.preferences = updated_preferences
        db.commit()
        db.refresh(user)
        
        return {
            "success": True,
            "preferences": user.preferences
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(e)}"
        )


@router.get("/usage", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user usage statistics including credits for connections, validations, and discoveries
    
    Returns:
        Usage data with limits and remaining credits for different features
    """
    try:
        user_service = UserService(db)
        
        # Get connection usage from founder connections
        from app.models.founder_connection import FounderConnection
        from app.models.founder_profile import FounderProfile
        from datetime import datetime, timedelta, timezone
        
        # Get user's profile to count connections
        profile = db.query(FounderProfile).filter(
            FounderProfile.user_id == current_user.user_id
        ).first()
        
        connection_count = 0
        if profile:
            # Count connections sent this month
            month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            connection_count = db.query(FounderConnection).filter(
                and_(
                    FounderConnection.sender_id == profile.id,
                    FounderConnection.created_at >= month_start
                )
            ).count()
        
        # Determine limits based on subscription type
        subscription_type = current_user.subscription_type or "free"
        
        if subscription_type in ["pro", "annual"]:
            connection_limit = 999  # Unlimited
            validation_limit = 999
            discovery_limit = 999
        elif subscription_type == "starter":
            connection_limit = 15
            validation_limit = 10
            discovery_limit = 20
        else:  # free
            connection_limit = 3
            validation_limit = 2
            discovery_limit = 4
        
        # Get validation and discovery counts (can be enhanced later with proper tracking)
        from app.models.validation import Validation
        from app.models.run import Run
        
        month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        validation_count = db.query(Validation).filter(
            and_(
                Validation.user_id == current_user.user_id,
                Validation.created_at >= month_start
            )
        ).count()
        
        discovery_count = db.query(Run).filter(
            and_(
                Run.user_id == current_user.user_id,
                Run.created_at >= month_start,
                Run.deleted_at.is_(None)
            )
        ).count()
        
        return {
            "success": True,
            "usage": {
                "connections": {
                    "used": connection_count,
                    "limit": connection_limit,
                    "remaining": max(0, connection_limit - connection_count)
                },
                "validations": {
                    "used": validation_count,
                    "limit": validation_limit,
                    "remaining": max(0, validation_limit - validation_count)
                },
                "discoveries": {
                    "used": discovery_count,
                    "limit": discovery_limit,
                    "remaining": max(0, discovery_limit - discovery_count)
                }
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get usage: {str(e)}"
        )

