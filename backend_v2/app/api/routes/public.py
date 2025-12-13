"""Public API routes (no authentication required)"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional

router = APIRouter()


class ContactRequest(BaseModel):
    """Contact form request model"""
    name: str
    email: EmailStr
    subject: str
    message: str


@router.get("/usage-stats", status_code=200)
async def get_usage_stats() -> Dict[str, Any]:
    """
    Get public usage statistics
    
    Returns mock statistics for the landing page.
    In production, this would query the database for real stats.
    """
    return {
        "success": True,
        "stats": {
            "total_users": 0,
            "validations_this_month": 0,
            "total_validations": 0,
            "average_score": 0,
        }
    }


@router.post("/contact", status_code=status.HTTP_200_OK)
async def submit_contact(request: ContactRequest) -> Dict[str, Any]:
    """
    Submit contact form
    
    In production, this would send an email or save to database.
    For now, returns success message.
    """
    try:
        # TODO: In production, send email or save to database
        # For now, just log and return success
        print(f"Contact form submission: {request.name} ({request.email}) - {request.subject}")
        print(f"Message: {request.message}")
        
        return {
            "success": True,
            "message": "Thank you for your message! We'll get back to you soon."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit contact form: {str(e)}"
        )


# Note: Contact endpoint should be at /api/contact, not /api/public/contact
# Adding it without prefix since public router is mounted at /public
# We'll need to add it to main router or change the route structure

