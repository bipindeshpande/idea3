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
        
        Returns runs and validations from database
        """
        from app.models.validation import Validation
        import json
        from datetime import datetime
        
        def serialize_for_json(obj):
            """Recursively serialize objects for JSON, handling datetime and other types"""
            if obj is None:
                return None
            elif isinstance(obj, (str, int, float, bool)):
                # Already JSON-serializable primitives
                return obj
            elif isinstance(obj, datetime):
                return obj.isoformat() if obj else None
            elif isinstance(obj, dict):
                return {k: serialize_for_json(v) for k, v in obj.items()}
            elif isinstance(obj, (list, tuple)):
                return [serialize_for_json(item) for item in obj]
            elif hasattr(obj, 'isoformat'):  # Handle other datetime-like objects
                try:
                    return obj.isoformat()
                except (AttributeError, TypeError):
                    return str(obj)
            else:
                # Fallback: try to convert to string
                try:
                    return str(obj)
                except Exception:
                    return None
        
        # Get user's runs - include both completed and processing runs (in case user refreshes page)
        runs = self.db.query(Run).filter(
            and_(
                Run.user_id == user_id,
                Run.deleted_at.is_(None)
            )
        ).order_by(desc(Run.created_at)).limit(limit).all()
        
        # Log for debugging
        self._log(f"Found {len(runs)} runs for user {user_id}", "INFO")
        
        runs_list = []
        for run in runs:
            try:
                run_dict = run.to_dict()
                # Recursively serialize any nested datetime objects in JSONB fields
                run_dict = serialize_for_json(run_dict)
                # Ensure JSON serialization works
                json.dumps(run_dict, default=str)
                runs_list.append(run_dict)
            except Exception as e:
                self._log(f"Error serializing run {run.run_id}: {str(e)}", "ERROR")
                # Skip this run if serialization fails
                continue
        
        # Get user's validations
        validations_list = []
        try:
            validations = self.db.query(Validation).filter(
                and_(
                    Validation.user_id == user_id,
                    Validation.deleted_at.is_(None)
                )
            ).order_by(desc(Validation.created_at)).limit(limit).all()
            
            for validation in validations:
                try:
                    validation_dict = validation.to_dict()
                    # Recursively serialize any nested datetime objects in JSONB fields
                    validation_dict = serialize_for_json(validation_dict)
                    # Ensure JSON serialization works
                    json.dumps(validation_dict, default=str)
                    validations_list.append(validation_dict)
                except Exception as e:
                    self._log(f"Error serializing validation {validation.validation_id}: {str(e)}", "ERROR")
                    # Skip this validation if serialization fails
                    continue
        except Exception as e:
            # Handle case where validations table doesn't exist yet (e.g., migration not run)
            error_msg = str(e)
            if "does not exist" in error_msg or "UndefinedTable" in error_msg:
                self._log("Validations table does not exist yet. Run migration: alembic upgrade head", "WARNING")
            else:
                self._log(f"Error querying validations: {str(e)}", "ERROR")
            # Return empty list if table doesn't exist
            validations_list = []
        
        # Ensure activity format matches frontend expectations
        activity = {
            "runs": runs_list,
            "validations": validations_list
        }
        
        return {
            "success": True,
            "activity": activity,
            "runs": runs_list,
            "validations": validations_list
        }
    
    def get_user_actions(self, user_id: str, idea_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get user actions feed
        
        Args:
            user_id: User ID
            idea_id: Optional filter by idea ID
            
        Returns:
            List of user actions
        """
        from app.models.action import Action
        
        query = self.db.query(Action).filter(Action.user_id == user_id)
        
        if idea_id:
            query = query.filter(Action.idea_id == idea_id)
        
        actions = query.order_by(desc(Action.created_at)).all()
        
        return {
            "success": True,
            "actions": [action.to_dict() for action in actions]
        }
    
    def create_action(
        self, 
        user_id: str, 
        idea_id: str, 
        action_text: str, 
        status: str = "pending",
        due_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new action for a user
        
        Args:
            user_id: User ID
            idea_id: Idea ID
            action_text: Action text
            status: Action status (default: "pending")
            due_date: Optional due date (ISO format string)
            
        Returns:
            Created action
        """
        from app.models.action import Action
        from datetime import datetime
        
        # Parse due_date if provided
        parsed_due_date = None
        if due_date:
            try:
                parsed_due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00')).date()
            except (ValueError, AttributeError):
                # If parsing fails, leave as None
                pass
        
        action = Action(
            user_id=user_id,
            idea_id=idea_id,
            action_text=action_text,
            status=status,
            due_date=parsed_due_date
        )
        
        self.db.add(action)
        self.db.commit()
        self.db.refresh(action)
        
        return {
            "success": True,
            "action": action.to_dict()
        }
    
    def update_action(self, user_id: str, action_id: str, status: str) -> Dict[str, Any]:
        """
        Update an action's status
        
        Args:
            user_id: User ID (for authorization)
            action_id: Action ID
            status: New status
            
        Returns:
            Updated action
        """
        from app.models.action import Action
        
        action = self.db.query(Action).filter(
            and_(
                Action.id == action_id,
                Action.user_id == user_id
            )
        ).first()
        
        if not action:
            raise ValueError("Action not found")
        
        action.status = status
        self.db.commit()
        self.db.refresh(action)
        
        return {
            "success": True,
            "action": action.to_dict()
        }
    
    def get_user_notes(self, user_id: str, idea_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get user notes list
        
        Args:
            user_id: User ID
            idea_id: Optional filter by idea ID
            
        Returns:
            List of user notes
        """
        from app.models.note import Note
        
        query = self.db.query(Note).filter(Note.user_id == user_id)
        
        if idea_id:
            query = query.filter(Note.idea_id == idea_id)
        
        notes = query.order_by(desc(Note.created_at)).all()
        
        return {
            "success": True,
            "notes": [note.to_dict() for note in notes]
        }
    
    def create_note(
        self, 
        user_id: str, 
        idea_id: str, 
        content: str, 
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Create a new note for a user
        
        Args:
            user_id: User ID
            idea_id: Idea ID
            content: Note content
            tags: Optional list of tags
            
        Returns:
            Created note
        """
        from app.models.note import Note
        
        note = Note(
            user_id=user_id,
            idea_id=idea_id,
            content=content,
            tags=tags if tags else []
        )
        
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        
        return {
            "success": True,
            "note": note.to_dict()
        }
    
    def compare_sessions(
        self, 
        user_id: str, 
        run_ids: List[str], 
        validation_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Compare multiple discovery sessions
        
        Args:
            user_id: User ID (for authorization)
            run_ids: List of run IDs to compare
            validation_ids: List of validation IDs to compare (not implemented yet)
            
        Returns:
            Comparison data with runs and their reports
        """
        from app.models.run import Run
        
        # Fetch runs that belong to the user
        runs = self.db.query(Run).filter(
            and_(
                Run.run_id.in_(run_ids),
                Run.user_id == user_id,
                Run.deleted_at.is_(None)
            )
        ).all()
        
        # Build comparison structure
        runs_data = []
        for run in runs:
            runs_data.append({
                "run_id": run.run_id,
                "inputs": run.inputs,
                "reports": run.reports,
                "created_at": run.created_at.isoformat() if run.created_at else None,
            })
        
        # TODO: Add validation comparison when needed
        
        return {
            "success": True,
            "comparison": {
                "runs": runs_data,
                "validations": []  # Placeholder for future validation comparison
            }
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
    
    def get_smart_recommendations(self, user_id: str) -> Dict[str, Any]:
        """
        Get smart recommendations based on user's validation history
        
        Returns similar high-scoring ideas from validation history
        For now, returns mock data - will be refined later with actual validation data
        """
        # TODO: Implement actual logic to:
        # 1. Query validation results for this user
        # 2. Find high-scoring validations (score >= 7)
        # 3. Group by similar ideas/patterns
        # 4. Return top similar ideas
        
        # Mock data for now
        return {
            "success": True,
            "insights": {
                "similar_ideas": []  # Empty for now - will be populated when validation data is available
            }
        }

