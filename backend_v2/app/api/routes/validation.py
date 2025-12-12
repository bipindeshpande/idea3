"""Validation API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user_or_none
from app.models.user import User
from app.services.validation_service import ValidationService

router = APIRouter()


class ValidateIdeaRequest(BaseModel):
    """Request model for idea validation"""
    category_answers: Dict[str, Any]
    idea_explanation: str
    idea_id: Optional[str] = None  # Optional: for validating recommendation ideas
    idea_metadata: Optional[Dict[str, Any]] = None  # Optional: idea title, summary, etc.


@router.post("/validate-idea", status_code=status.HTTP_200_OK)
async def validate_idea(
    request: ValidateIdeaRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Validate an idea and generate personalized recommendations
    
    Request body:
    {
        "category_answers": {...},
        "idea_explanation": "..."
    }
    
    Returns:
        Validation result with scores, recommendations, and personalized next_steps
    """
    try:
        validation_service = ValidationService(db)
        user_id = current_user.user_id if current_user else None
        
        result = validation_service.validate_idea(
            user_id=user_id,
            category_answers=request.category_answers,
            idea_explanation=request.idea_explanation,
            idea_id=request.idea_id,
            idea_metadata=request.idea_metadata
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate idea: {str(e)}"
        )


@router.put("/validate-idea/{validation_id}", status_code=status.HTTP_200_OK)
async def update_validation(
    validation_id: str,
    request: ValidateIdeaRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Update an existing validation
    
    Returns:
        Updated validation result with new personalized next_steps
    """
    try:
        validation_service = ValidationService(db)
        user_id = current_user.user_id if current_user else None
        
        # Verify ownership if user is authenticated
        if current_user:
            validation = validation_service.get_validation(validation_id, user_id)
            if not validation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Validation not found or access denied"
                )
        
        result = validation_service.validate_idea(
            user_id=user_id,
            category_answers=request.category_answers,
            idea_explanation=request.idea_explanation,
            validation_id=validation_id,
            idea_id=request.idea_id,
            idea_metadata=request.idea_metadata
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update validation: {str(e)}"
        )


@router.get("/validate-idea/{validation_id}", status_code=status.HTTP_200_OK)
async def get_validation(
    validation_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Get validation by ID
    
    Returns:
        Validation data including personalized next_steps
    """
    try:
        validation_service = ValidationService(db)
        user_id = current_user.user_id if current_user else None
        
        validation = validation_service.get_validation(validation_id, user_id)
        
        if not validation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Validation not found"
            )
        
        return {
            "success": True,
            "validation_id": validation.validation_id,
            "id": validation.validation_id,  # Alias for compatibility
            "category_answers": validation.category_answers,
            "idea_explanation": validation.idea_explanation,
            "validation_result": validation.validation_result,
            "validation": validation.validation_result,  # Alias for frontend compatibility
            "status": validation.status,
            "created_at": validation.created_at.isoformat() if validation.created_at else None,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get validation: {str(e)}"
        )

