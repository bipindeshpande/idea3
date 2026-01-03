"""User profile and constraints retrieval for validation"""
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.models.run import Run
import json


class UserProfileRetriever:
    """Handles retrieval of user profile and constraints for validation"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_profile_and_constraints(
        self,
        user_id: str
    ) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """
        Get user profile and constraints from their latest discovery run
        
        Returns:
            Tuple of (user_profile, user_constraints)
        """
        try:
            # Get latest completed run for user
            latest_run = self.db.query(Run).filter(
                and_(
                    Run.user_id == user_id,
                    Run.status == "completed",
                    Run.deleted_at.is_(None)
                )
            ).order_by(desc(Run.created_at)).first()
            
            if not latest_run:
                return None, None
            
            user_profile = None
            user_constraints = None
            
            # Extract profile analysis from run
            if latest_run.profile_analysis:
                try:
                    # Try to parse as JSON first
                    if latest_run.profile_analysis.startswith("{"):
                        user_profile = json.loads(latest_run.profile_analysis)
                    else:
                        # Otherwise use as string
                        user_profile = latest_run.profile_analysis
                except Exception:
                    user_profile = latest_run.profile_analysis
            
            # Extract constraints from inputs
            if latest_run.inputs:
                user_constraints = {
                    "budget_range": latest_run.inputs.get("budget_range"),
                    "time_commitment": latest_run.inputs.get("time_commitment"),
                    "risk_tolerance": latest_run.inputs.get("risk_tolerance"),
                    "skills": latest_run.inputs.get("skills"),
                    "preferred_work_style": latest_run.inputs.get("preferred_work_style"),
                    "startup_style": latest_run.inputs.get("startup_style"),
                }
            
            return user_profile, user_constraints
            
        except Exception as e:
            # Logging would be handled by the service calling this
            return None, None

