"""Psyche Profiling API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.psyche_scoring_service import PsycheScoringService
from app.services.psyche_scoring_map import get_questions


router = APIRouter(prefix="/psyche", tags=["psyche"])


class QuestionnaireAnswer(BaseModel):
    """Answer for a single question"""
    question_id: str
    answer_id: str


class QuestionnaireSubmission(BaseModel):
    """Questionnaire submission request"""
    answers: Dict[str, str]  # {question_id: answer_id}
    optional_text: Optional[str] = None


class QuestionnaireResponse(BaseModel):
    """Questionnaire response"""
    success: bool
    profile: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


@router.get("/questions", response_model=Dict[str, Any])
async def get_questions_endpoint():
    """Get all questionnaire questions"""
    questions = get_questions()
    return {
        "success": True,
        "questions": questions,
        "total": len(questions)
    }


@router.post("/submit", response_model=QuestionnaireResponse)
async def submit_questionnaire(
    submission: QuestionnaireSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit questionnaire answers and get scored profile.
    Requires authentication.
    """
    try:
        # Validate answers
        if not submission.answers or len(submission.answers) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one answer is required"
            )
        
        # Score and save profile
        scoring_service = PsycheScoringService(db)
        profile = scoring_service.save_profile(
            user_id=current_user.user_id,
            answers=submission.answers,
            optional_text=submission.optional_text
        )
        
        # Verify profile was saved
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Profile was not saved successfully"
            )
        
        return QuestionnaireResponse(
            success=True,
            profile=profile.to_dict(),
            message="Profile saved successfully"
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log full error details for debugging
        import traceback
        error_details = traceback.format_exc()
        print(f"[Psyche API] Error saving profile: {str(e)}")
        print(f"[Psyche API] Traceback: {error_details}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process questionnaire: {str(e)}"
        )


@router.get("/profile", response_model=Dict[str, Any])
async def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's psyche profile. Requires authentication."""
    try:
        scoring_service = PsycheScoringService(db)
        profile = scoring_service.get_profile(current_user.user_id)
        
        if not profile:
            return {
                "success": False,
                "profile": None,
                "message": "No profile found. Please complete the questionnaire."
            }
        
        return {
            "success": True,
            "profile": profile.to_dict(),
            "message": "Profile retrieved successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve profile: {str(e)}"
        )


@router.get("/profile/ai", response_model=Dict[str, Any])
async def get_profile_for_ai(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's psyche profile formatted for AI consumption.
    Does not include raw answers. Requires authentication.
    """
    try:
        scoring_service = PsycheScoringService(db)
        profile = scoring_service.get_profile_for_ai(current_user.user_id)
        
        if not profile:
            return {
                "success": False,
                "profile": None,
                "message": "No profile found. Please complete the questionnaire."
            }
        
        return {
            "success": True,
            "profile": profile,
            "message": "Profile retrieved successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve profile: {str(e)}"
        )

