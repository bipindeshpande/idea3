"""API route handlers"""
import logging
from fastapi import APIRouter, HTTPException, status, Body, Depends
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contact_submission import ContactSubmission
from .history import router as history_router
from .runs import router as runs_router
from .auth import router as auth_router
from .admin import router as admin_router
from .user import router as user_router
from .subscription import router as subscription_router
from .public import router as public_router
from .founder import router as founder_router
from .validation import router as validation_router
from .psyche import router as psyche_router
from .payment import router as payment_router
from .frameworks import router as frameworks_router

router = APIRouter()
logger = logging.getLogger(__name__)


class ContactRequest(BaseModel):
    """Contact form request model"""
    name: str
    email: EmailStr
    company: str = ""
    topic: str = ""
    message: str


# Include all route modules
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(history_router, prefix="/history", tags=["history"])
router.include_router(runs_router, prefix="/runs", tags=["runs"])
router.include_router(admin_router, prefix="/admin", tags=["admin"])
router.include_router(user_router, prefix="/user", tags=["user"])
router.include_router(subscription_router, prefix="/subscription", tags=["subscription"])
router.include_router(public_router, prefix="/public", tags=["public"])
router.include_router(founder_router, prefix="/founder", tags=["founder"])
router.include_router(validation_router, prefix="", tags=["validation"])
router.include_router(psyche_router)
router.include_router(payment_router, prefix="/payment", tags=["payment"])
router.include_router(frameworks_router, prefix="", tags=["frameworks"])


# Contact endpoint (expected at /api/contact, not /api/public/contact)
@router.post("/contact", status_code=status.HTTP_200_OK)
async def submit_contact(
    request: ContactRequest = Body(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Submit contact form
    
    Saves the contact form submission to the database for later review.
    In production, this could also trigger email notifications.
    """
    try:
        # Create contact submission record
        submission = ContactSubmission(
            name=request.name,
            email=request.email,
            company=request.company if request.company else None,
            topic=request.topic if request.topic else None,
            message=request.message,
            status="new"
        )
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
        logger.info(
            f"Contact form submission received: {request.name} ({request.email}) - Submission ID: {submission.id}"
        )
        
        return {
            "success": True,
            "message": "Thank you for your message! We'll get back to you soon."
        }
    except Exception as e:
        db.rollback()
        logger.error(
            f"Failed to submit contact form from {request.email}: {str(e)}",
            exc_info=True
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit contact form. Please try again later."
        )

