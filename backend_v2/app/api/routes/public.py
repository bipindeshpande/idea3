"""Public API routes (no authentication required)"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Dict, Any
from datetime import datetime, timezone
import json
from app.core.database import get_db
from app.models.user import User
from app.models.validation import Validation

router = APIRouter()


@router.get("/usage-stats", status_code=200)
async def get_usage_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get public usage statistics
    
    Returns real statistics from the database:
    - total_users: Total number of registered users
    - validations_this_month: Number of validations created this month
    - total_validations: Total number of completed validations (not deleted)
    - average_score: Average overall_score from all completed validations
    """
    try:
        # Get total users
        total_users = db.query(User).count()
        
        # Calculate month start (first day of current month, UTC)
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get validations this month (not deleted, completed)
        validations_this_month = db.query(Validation).filter(
            and_(
                Validation.created_at >= month_start,
                Validation.deleted_at.is_(None),
                Validation.status == "completed"
            )
        ).count()
        
        # Get total validations (not deleted, completed)
        total_validations = db.query(Validation).filter(
            and_(
                Validation.deleted_at.is_(None),
                Validation.status == "completed"
            )
        ).count()
        
        # Calculate average score from validation results
        # Query all completed validations and extract overall_score from validation_result JSONB
        validations = db.query(Validation).filter(
            and_(
                Validation.deleted_at.is_(None),
                Validation.status == "completed"
            )
        ).all()
        
        scores = []
        for validation in validations:
            try:
                validation_result = validation.validation_result
                # Handle both dict and JSON string formats
                if isinstance(validation_result, str):
                    validation_result = json.loads(validation_result)
                
                # Extract overall_score
                overall_score = validation_result.get("overall_score")
                if overall_score is not None:
                    try:
                        score = float(overall_score)
                        if score > 0:  # Only include valid scores
                            scores.append(score)
                    except (ValueError, TypeError):
                        continue
            except (json.JSONDecodeError, KeyError, AttributeError):
                # Skip invalid validation records
                continue
        
        # Calculate average score (round to 1 decimal place)
        average_score = round(sum(scores) / len(scores), 1) if scores else 0.0
        
        return {
            "success": True,
            "stats": {
                "total_users": total_users,
                "validations_this_month": validations_this_month,
                "total_validations": total_validations,
                "average_score": average_score,
            }
        }
    except Exception as e:
        # Return zeros on error rather than failing (graceful degradation for public endpoint)
        return {
            "success": True,
            "stats": {
                "total_users": 0,
                "validations_this_month": 0,
                "total_validations": 0,
                "average_score": 0.0,
            }
        }

