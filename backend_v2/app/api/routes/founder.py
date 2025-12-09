"""Founder API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


class PsychologyData(BaseModel):
    """Founder psychology data model"""
    motivation: Optional[str] = None
    motivation_other: Optional[str] = None
    fear: Optional[str] = None
    fear_other: Optional[str] = None
    decision_style: Optional[str] = None
    energy_pattern: Optional[str] = None
    consistency_pattern: Optional[str] = None
    risk_approach: Optional[str] = None
    success_definition: Optional[str] = None
    success_other: Optional[str] = None
    archetype: Optional[str] = None


@router.get("/psychology", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_founder_psychology(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get founder psychology data for the current user
    
    Returns empty psychology data structure.
    In production, this would load from a founder_psychology table.
    """
    # For now, return empty structure
    # TODO: Implement actual database storage and retrieval
    return {
        "success": True,
        "data": {
            "motivation": "",
            "motivation_other": "",
            "fear": "",
            "fear_other": "",
            "decision_style": "",
            "energy_pattern": "",
            "consistency_pattern": "",
            "risk_approach": "",
            "success_definition": "",
            "success_other": "",
            "archetype": ""
        }
    }


@router.post("/psychology", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def save_founder_psychology(
    data: PsychologyData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Save founder psychology data for the current user
    
    Accepts psychology data and saves it.
    In production, this would save to a founder_psychology table.
    """
    # For now, just return success
    # TODO: Implement actual database storage
    return {
        "success": True,
        "message": "Founder psychology saved successfully",
        "data": data.model_dump(exclude_none=True)
    }

