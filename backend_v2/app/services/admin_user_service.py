"""Admin user service for user management operations"""
from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.services.base_service import BaseService
from app.models.user import User
from app.models.run import Run
from app.models.validation import Validation


class AdminUserService(BaseService):
    """Service for admin user management operations"""
    
    def calculate_days_remaining(self, subscription_type: str) -> int:
        """
        Calculate days remaining for a subscription type
        
        Args:
            subscription_type: User's subscription type
            
        Returns:
            Number of days remaining (default values for now)
        """
        if subscription_type == "free_trial":
            return 7  # Default free trial duration
        elif subscription_type in ["weekly", "starter", "pro"]:
            return 30  # Default subscription duration
        return 0
    
    def is_subscription_active(self, subscription_type: str, is_active: bool) -> bool:
        """
        Check if subscription is active
        
        Args:
            subscription_type: User's subscription type
            is_active: User's active status
            
        Returns:
            True if subscription is active
        """
        return subscription_type not in ["free", "free_trial"] and is_active
    
    def serialize_user(self, user: User) -> Dict[str, Any]:
        """
        Serialize user object to dictionary for API response
        
        Args:
            user: User object
            
        Returns:
            Dictionary with user data
        """
        days_remaining = self.calculate_days_remaining(user.subscription_type or "free")
        is_subscription_active = self.is_subscription_active(
            user.subscription_type or "free",
            user.is_active
        )
        
        return {
            "id": user.user_id,
            "email": user.email,
            "subscription_type": user.subscription_type or "free",
            "is_subscription_active": is_subscription_active,
            "days_remaining": days_remaining,
            "subscription_started_at": user.created_at.isoformat() if user.created_at else None,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    
    def serialize_user_detail(self, user: User) -> Dict[str, Any]:
        """
        Serialize user object with full details for API response
        
        Args:
            user: User object
            
        Returns:
            Dictionary with detailed user data
        """
        days_remaining = self.calculate_days_remaining(user.subscription_type or "free")
        
        return {
            "id": user.user_id,
            "email": user.email,
            "full_name": user.full_name,
            "subscription_type": user.subscription_type or "free",
            "is_active": user.is_active,
            "days_remaining": days_remaining,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
    
    def get_all_users(self) -> List[User]:
        """Get all users ordered by creation date"""
        return self.db.query(User).order_by(desc(User.created_at)).all()
    
    def get_user_by_id(self, user_id: str) -> User:
        """Get user by ID"""
        return self.db.query(User).filter(User.user_id == user_id).first()
    
    def get_user_runs(self, user_id: str, limit: int = 50) -> List[Run]:
        """Get user's runs"""
        return self.db.query(Run).filter(
            and_(
                Run.user_id == user_id,
                Run.deleted_at.is_(None)
            )
        ).order_by(desc(Run.created_at)).limit(limit).all()
    
    def get_user_validations(self, user_id: str, limit: int = 50) -> List[Validation]:
        """Get user's validations"""
        return self.db.query(Validation).filter(
            and_(
                Validation.user_id == user_id,
                Validation.deleted_at.is_(None)
            )
        ).order_by(desc(Validation.created_at)).limit(limit).all()
    
    def update_subscription(
        self, 
        user: User, 
        subscription_type: str, 
        duration_days: int
    ) -> None:
        """
        Update user subscription
        
        Args:
            user: User object to update
            subscription_type: New subscription type
            duration_days: Subscription duration in days
        """
        # Update subscription type
        user.subscription_type = subscription_type
        
        # Store subscription info in preferences (since we don't have subscription_end_at)
        # Create a new dict to ensure SQLAlchemy detects the change
        current_preferences = user.preferences or {}
        updated_preferences = {
            **current_preferences,
            "subscription_started_at": datetime.now(timezone.utc).isoformat(),
            "subscription_duration_days": duration_days,
            "subscription_end_at": (
                datetime.now(timezone.utc) + timedelta(days=duration_days)
            ).isoformat()
        }
        user.preferences = updated_preferences

