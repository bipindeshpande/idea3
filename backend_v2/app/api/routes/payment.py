"""Payment API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


class CreateIntentRequest(BaseModel):
    """Request model for creating payment intent"""
    amount: int  # Amount in cents
    currency: str = "usd"
    plan_id: Optional[str] = None


class ConfirmPaymentRequest(BaseModel):
    """Request model for confirming payment"""
    payment_intent_id: str
    plan_id: Optional[str] = None


@router.post("/create-intent", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def create_payment_intent(
    request: CreateIntentRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a Stripe payment intent
    
    Note: This is a mock implementation. In production, this would:
    1. Create a Stripe PaymentIntent
    2. Return client_secret for frontend
    3. Store intent_id in database for tracking
    """
    try:
        # TODO: Integrate with Stripe
        # For now, return mock payment intent
        return {
            "success": True,
            "payment_intent": {
                "id": f"pi_mock_{current_user.user_id[:8]}",
                "client_secret": f"pi_mock_{current_user.user_id[:8]}_secret",
                "amount": request.amount,
                "currency": request.currency,
                "status": "requires_payment_method"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment intent: {str(e)}"
        )


@router.post("/confirm", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def confirm_payment(
    request: ConfirmPaymentRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Confirm a payment and activate subscription
    
    Note: This is a mock implementation. In production, this would:
    1. Verify payment with Stripe
    2. Update user subscription
    3. Send confirmation email
    """
    try:
        # TODO: Verify payment with Stripe and update subscription
        # For now, return mock success
        return {
            "success": True,
            "message": "Payment confirmed successfully",
            "subscription": {
                "type": request.plan_id or "starter",
                "status": "active",
                "is_active": True
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm payment: {str(e)}"
        )

