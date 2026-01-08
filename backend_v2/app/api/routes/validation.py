"""Validation API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user_or_none
from app.models.user import User
from app.services.validation_service import ValidationService
from app.utils.user_utils import extract_user_id, verify_run_ownership
from app.utils.error_handler import handle_exception, ValidationError, NotFoundError, AuthorizationError
from app.utils.response_models import ValidationResponse, create_success_response, create_error_response

router = APIRouter()


class ValidateIdeaRequest(BaseModel):
    """Request model for idea validation"""
    category_answers: Dict[str, Any]
    idea_explanation: str
    idea_id: Optional[str] = None  # Optional: for validating recommendation ideas
    idea_metadata: Optional[Dict[str, Any]] = None  # Optional: idea title, summary, etc.
    include_next_steps: Optional[bool] = True  # Optional: whether to generate next_steps (default: True)


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
        Standardized validation response with validation_id and validation data
    """
    try:
        # Extract user_id consistently
        user_id = extract_user_id(current_user)
        
        # Validate request
        if not request.category_answers:
            raise ValidationError("category_answers is required")
        if not request.idea_explanation or not request.idea_explanation.strip():
            raise ValidationError("idea_explanation is required and cannot be empty")
        
        validation_service = ValidationService(db)
        
        result = validation_service.validate_idea(
            user_id=user_id,
            category_answers=request.category_answers,
            idea_explanation=request.idea_explanation,
            idea_id=request.idea_id,
            idea_metadata=request.idea_metadata,
            include_next_steps=request.include_next_steps if request.include_next_steps is not None else True
        )
        
        # Standardize response format - always use 'validation' key
        return create_success_response({
            "validation_id": result.get("validation_id"),
            "validation": result.get("validation"),  # Always use 'validation' key
            "created_at": result.get("created_at")
        })
        
    except Exception as e:
        raise handle_exception(
            error=e,
            context={
                "endpoint": "validate_idea",
                "user_id": user_id,
                "has_idea_id": bool(request.idea_id)
            }
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
        Standardized validation response with updated validation data
    """
    try:
        # Extract user_id consistently
        user_id = extract_user_id(current_user)
        
        # Validate request
        if not request.category_answers:
            raise ValidationError("category_answers is required")
        if not request.idea_explanation or not request.idea_explanation.strip():
            raise ValidationError("idea_explanation is required and cannot be empty")
        
        validation_service = ValidationService(db)
        
        # Verify ownership - check for all users (authenticated or not)
        validation = validation_service.get_validation(validation_id, user_id)
        if not validation:
            raise NotFoundError("Validation", validation_id)
        
        # Verify user has permission to access this validation
        verify_run_ownership(validation.user_id, user_id, resource_name="validation")
        
        result = validation_service.validate_idea(
            user_id=user_id,
            category_answers=request.category_answers,
            idea_explanation=request.idea_explanation,
            validation_id=validation_id,
            idea_id=request.idea_id,
            idea_metadata=request.idea_metadata
        )
        
        # Standardize response format - always use 'validation' key
        return create_success_response({
            "validation_id": result.get("validation_id"),
            "validation": result.get("validation"),  # Always use 'validation' key
            "updated_at": result.get("updated_at")
        })
        
    except Exception as e:
        raise handle_exception(
            error=e,
            context={
                "endpoint": "update_validation",
                "validation_id": validation_id,
                "user_id": user_id
            }
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
        Standardized validation response with validation data
    """
    try:
        # Extract user_id consistently
        user_id = extract_user_id(current_user)
        
        validation_service = ValidationService(db)
        validation = validation_service.get_validation(validation_id, user_id)
        
        if not validation:
            raise NotFoundError("Validation", validation_id)
        
        # Verify user has permission to access this validation
        verify_run_ownership(validation.user_id, user_id, resource_name="validation")
        
        # Standardize response format - always use 'validation' key
        return create_success_response({
            "validation_id": validation.validation_id,
            "id": validation.validation_id,  # Alias for backward compatibility
            "category_answers": validation.category_answers,
            "idea_explanation": validation.idea_explanation,
            "validation": validation.validation_result,  # Always use 'validation' key
            "status": validation.status,
            "created_at": validation.created_at.isoformat() if validation.created_at else None,
        })
        
    except Exception as e:
        raise handle_exception(
            error=e,
            context={
                "endpoint": "get_validation",
                "validation_id": validation_id,
                "user_id": user_id
            }
        )

