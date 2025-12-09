"""Subscription API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.user_service import UserService

router = APIRouter()


class ActivateDevRequest(BaseModel):
    """Request model for development subscription activation"""
    subscription_type: str


class ChangePlanRequest(BaseModel):
    """Request model for changing subscription plan"""
    plan_id: Optional[str] = None
    subscription_type: Optional[str] = None  # Frontend sends this field name


@router.get("/status", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get subscription details for the current user
    
    Returns:
        Subscription information including type, status, and billing details
    """
    try:
        user_service = UserService(db)
        result = user_service.get_subscription_status(current_user.user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch subscription status: {str(e)}"
        )


@router.post("/activate-dev", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def activate_dev_subscription(
    request: ActivateDevRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Activate a subscription in development mode (bypasses payment)
    
    This endpoint is used for development/testing purposes to activate
    subscriptions without going through payment processing.
    
    Returns:
        Success status and updated subscription information
    """
    try:
        user_service = UserService(db)
        result = user_service.activate_dev_subscription(
            user_id=current_user.user_id,
            subscription_type=request.subscription_type
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
            detail=f"Failed to activate subscription: {str(e)}"
        )


class CancelSubscriptionRequest(BaseModel):
    """Request model for canceling subscription"""
    cancellation_reason: Optional[str] = None
    cancellation_category: Optional[str] = None
    additional_comments: Optional[str] = None


@router.post("/cancel", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def cancel_subscription(
    request: CancelSubscriptionRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel the current user's subscription
    
    Accepts optional cancellation reason fields for analytics.
    
    Returns:
        Success status and updated subscription information
    """
    try:
        user_service = UserService(db)
        # Note: cancellation_reason, cancellation_category, additional_comments
        # are accepted but not stored in the current mock implementation
        # In production, these would be logged to analytics
        result = user_service.cancel_subscription(current_user.user_id)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel subscription: {str(e)}"
        )


@router.post("/change-plan", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def change_subscription_plan(
    request: ChangePlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change the user's subscription plan
    
    Returns:
        Success status and updated subscription information
    """
    try:
        # Frontend sends 'subscription_type', but we accept both for flexibility
        plan_id = request.plan_id or request.subscription_type
        if not plan_id:
            raise ValueError("Either 'plan_id' or 'subscription_type' must be provided")
        
        user_service = UserService(db)
        result = user_service.change_subscription_plan(
            user_id=current_user.user_id,
            plan_id=plan_id
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
            detail=f"Failed to change subscription plan: {str(e)}"
        )

