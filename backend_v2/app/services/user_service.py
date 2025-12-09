"""User service for user-related operations"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from datetime import datetime, timedelta, timezone
from app.services.base_service import BaseService
from app.models.user import User
from app.models.run import Run


class UserService(BaseService):
    """Service for user operations"""
    
    def get_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """
        Get dashboard summary data for a user
        
        Returns mock data for now - will be refined later
        """
        # Get user's runs count
        total_runs = self.db.query(Run).filter(
            and_(
                Run.user_id == user_id,
                Run.deleted_at.is_(None)
            )
        ).count()
        
        # Get completed runs
        completed_runs = self.db.query(Run).filter(
            and_(
                Run.user_id == user_id,
                Run.status == "completed",
                Run.deleted_at.is_(None)
            )
        ).count()
        
        # Get recent runs (last 7 days)
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_runs = self.db.query(Run).filter(
            and_(
                Run.user_id == user_id,
                Run.created_at >= seven_days_ago,
                Run.deleted_at.is_(None)
            )
        ).count()
        
        # Mock data for now
        return {
            "success": True,
            "dashboard": {
                "total_runs": total_runs,
                "completed_runs": completed_runs,
                "recent_runs": recent_runs,
                "active_ideas": 0,  # Mock - will be refined
                "saved_notes": 0,  # Mock - will be refined
                "total_actions": 0,  # Mock - will be refined
            }
        }
    
    def get_user_activity(self, user_id: str, limit: int = 50) -> Dict[str, Any]:
        """
        Get user activity list (runs and validations)
        
        Returns mock data structure for now - will be refined later
        """
        # Get user's runs
        runs = self.db.query(Run).filter(
            and_(
                Run.user_id == user_id,
                Run.deleted_at.is_(None)
            )
        ).order_by(desc(Run.created_at)).limit(limit).all()
        
        runs_list = [run.to_dict() for run in runs]
        
        # Mock validations (will be refined when validation model exists)
        validations = []
        
        return {
            "success": True,
            "runs": runs_list,
            "validations": validations
        }
    
    def get_user_actions(self, user_id: str, idea_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get user actions feed
        
        Returns mock data for now - will be refined later
        """
        # Mock actions data structure
        actions = []
        
        # If idea_id is provided, filter by idea (mock for now)
        if idea_id:
            # Will filter by idea_id when actions model exists
            pass
        
        return {
            "success": True,
            "actions": actions
        }
    
    def get_user_notes(self, user_id: str, idea_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get user notes list
        
        Returns mock data for now - will be refined later
        """
        # Mock notes data structure
        notes = []
        
        # If idea_id is provided, filter by idea (mock for now)
        if idea_id:
            # Will filter by idea_id when notes model exists
            pass
        
        return {
            "success": True,
            "notes": notes
        }
    
    def get_subscription_status(self, user_id: str) -> Dict[str, Any]:
        """
        Get subscription details for the user
        
        Returns subscription information from user model
        """
        user = self.db.query(User).filter(User.user_id == user_id).first()
        
        if not user:
            return {
                "success": False,
                "error": "User not found"
            }
        
        # Mock subscription data - will be refined when subscription model exists
        # Frontend expects is_active field, not just status
        subscription_type = user.subscription_type or "free"
        is_active = subscription_type != "free"  # Free subscriptions are not active
        
        return {
            "success": True,
            "subscription": {
                "type": subscription_type,
                "status": "active" if is_active else "expired",
                "is_active": is_active,  # Frontend expects this field
                "current_period_start": None,  # Mock
                "current_period_end": None,  # Mock
                "cancel_at_period_end": False,  # Mock
                "trial_end": None,  # Mock
            }
        }
    
    def activate_dev_subscription(self, user_id: str, subscription_type: str) -> Dict[str, Any]:
        """
        Activate a subscription in development mode (bypasses payment)
        
        This is a mock implementation for development/testing purposes.
        In production, this would integrate with payment processing.
        """
        user = self.db.query(User).filter(User.user_id == user_id).first()
        
        if not user:
            raise ValueError("User not found")
        
        # Validate subscription type
        valid_types = ["starter", "pro", "weekly", "free", "annual"]
        if subscription_type not in valid_types:
            raise ValueError(f"Invalid subscription type. Must be one of: {', '.join(valid_types)}")
        
        # Update user's subscription type
        user.subscription_type = subscription_type
        self.db.commit()
        self.db.refresh(user)
        
        period_start = datetime.now(timezone.utc)
        # Annual subscriptions get 365 days, others get 30 days
        if subscription_type == "annual":
            period_end = period_start + timedelta(days=365)
        else:
            period_end = period_start + timedelta(days=30)
        
        return {
            "success": True,
            "message": f"Subscription activated: {subscription_type}",
            "subscription": {
                "type": subscription_type,
                "status": "active",
                "is_active": True,  # Frontend expects this field
                "current_period_start": period_start.isoformat(),
                "current_period_end": period_end.isoformat(),
                "cancel_at_period_end": False,
            }
        }
    
    def cancel_subscription(self, user_id: str) -> Dict[str, Any]:
        """
        Cancel the user's subscription
        
        This is a mock implementation. In production, this would
        integrate with payment processor to cancel the subscription.
        """
        user = self.db.query(User).filter(User.user_id == user_id).first()
        
        if not user:
            raise ValueError("User not found")
        
        if not user.subscription_type or user.subscription_type == "free":
            raise ValueError("No active subscription to cancel")
        
        # Mark subscription for cancellation at period end
        # In production, this would update the subscription model
        # For now, we'll just set it to free after a delay (mock)
        
        return {
            "success": True,
            "message": "Subscription will be cancelled at the end of the current period",
            "subscription": {
                "type": user.subscription_type,
                "status": "active",
                "is_active": True,  # Frontend expects this field
                "cancel_at_period_end": True,
            }
        }
    
    def change_subscription_plan(self, user_id: str, plan_id: str) -> Dict[str, Any]:
        """
        Change the user's subscription plan
        
        This is a mock implementation. In production, this would
        integrate with payment processor to change the plan.
        """
        user = self.db.query(User).filter(User.user_id == user_id).first()
        
        if not user:
            raise ValueError("User not found")
        
        # Validate plan_id
        valid_plans = ["starter", "pro", "weekly", "free", "annual"]
        if plan_id not in valid_plans:
            raise ValueError(f"Invalid plan ID. Must be one of: {', '.join(valid_plans)}")
        
        # Update user's subscription type
        user.subscription_type = plan_id
        self.db.commit()
        self.db.refresh(user)
        
        period_start = datetime.now(timezone.utc)
        # Annual subscriptions get 365 days, others get 30 days
        if plan_id == "annual":
            period_end = period_start + timedelta(days=365)
        else:
            period_end = period_start + timedelta(days=30)
        
        return {
            "success": True,
            "message": f"Subscription plan changed to: {plan_id}",
            "subscription": {
                "type": plan_id,
                "status": "active",
                "is_active": True,  # Frontend expects this field
                "current_period_start": period_start.isoformat(),
                "current_period_end": period_end.isoformat(),
                "cancel_at_period_end": False,
            }
        }

