"""Framework service for managing user framework instances"""
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime, timezone
import re
import json
from app.services.base_service import BaseService
from app.models.saved_framework import SavedFramework
from app.models.user import User
from app.models.validation import Validation
from app.models.run import Run


class FrameworkService(BaseService):
    """Service for framework operations"""
    
    def __init__(self, db: Session, redis_client=None):
        super().__init__(db, redis_client)
    
    def is_framework_tracking_enabled(self, user_id: str) -> bool:
        """Check if framework tracking is enabled for user"""
        user = self.db.query(User).filter(User.user_id == user_id).first()
        if not user or not user.preferences:
            return True  # Default to enabled
        return user.preferences.get("framework_tracking_enabled", True)
    
    def create_framework(
        self,
        user_id: str,
        framework_template_id: int,
        title: str,
        customized_content: str,
        linked_idea_id: Optional[str] = None,
        linked_validation_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> SavedFramework:
        """Create a new framework instance from template"""
        if not self.is_framework_tracking_enabled(user_id):
            raise ValueError("Framework tracking is disabled for this user")
        
        # Calculate initial progress
        progress = self._calculate_progress(customized_content)
        status = "draft" if progress == 0 else "in_progress"
        
        framework = SavedFramework(
            user_id=user_id,
            framework_template_id=framework_template_id,
            title=title,
            customized_content=customized_content,
            status=status,
            progress_percentage=progress,
            linked_idea_id=linked_idea_id,
            linked_validation_id=linked_validation_id,
            extra_metadata=metadata or {}
        )
        
        self.db.add(framework)
        self.db.commit()
        self.db.refresh(framework)
        
        return framework
    
    def get_framework(self, framework_id: str, user_id: Optional[str] = None) -> Optional[SavedFramework]:
        """Get framework by ID, optionally checking user ownership"""
        query = self.db.query(SavedFramework).filter(
            and_(
                SavedFramework.id == framework_id,
                SavedFramework.deleted_at.is_(None)
            )
        )
        
        if user_id:
            query = query.filter(SavedFramework.user_id == user_id)
        
        return query.first()
    
    def list_frameworks(
        self,
        user_id: str,
        status: Optional[str] = None,
        framework_template_id: Optional[int] = None,
        linked_idea_id: Optional[str] = None,
        linked_validation_id: Optional[str] = None
    ) -> List[SavedFramework]:
        """List frameworks for a user with optional filters"""
        if not self.is_framework_tracking_enabled(user_id):
            return []
        
        query = self.db.query(SavedFramework).filter(
            and_(
                SavedFramework.user_id == user_id,
                SavedFramework.deleted_at.is_(None)
            )
        )
        
        if status:
            query = query.filter(SavedFramework.status == status)
        if framework_template_id:
            query = query.filter(SavedFramework.framework_template_id == framework_template_id)
        if linked_idea_id:
            query = query.filter(SavedFramework.linked_idea_id == linked_idea_id)
        if linked_validation_id:
            query = query.filter(SavedFramework.linked_validation_id == linked_validation_id)
        
        return query.order_by(desc(SavedFramework.updated_at)).all()
    
    def update_framework(
        self,
        framework_id: str,
        user_id: str,
        title: Optional[str] = None,
        customized_content: Optional[str] = None,
        status: Optional[str] = None,
        linked_idea_id: Optional[str] = None,
        linked_validation_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[SavedFramework]:
        """Update framework instance"""
        framework = self.get_framework(framework_id, user_id)
        if not framework:
            return None
        
        if title is not None:
            framework.title = title
        if customized_content is not None:
            framework.customized_content = customized_content
            # Recalculate progress when content changes
            framework.progress_percentage = self._calculate_progress(customized_content)
            # Auto-update status based on progress
            if framework.progress_percentage == 100:
                framework.status = "completed"
            elif framework.progress_percentage > 0:
                framework.status = "in_progress"
            else:
                framework.status = "draft"
        if status is not None:
            framework.status = status
        if linked_idea_id is not None:
            framework.linked_idea_id = linked_idea_id
        if linked_validation_id is not None:
            framework.linked_validation_id = linked_validation_id
        if metadata is not None:
            framework.extra_metadata = {**(framework.extra_metadata or {}), **metadata}
        
        framework.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(framework)
        
        return framework
    
    def delete_framework(self, framework_id: str, user_id: str) -> bool:
        """Soft delete framework"""
        framework = self.get_framework(framework_id, user_id)
        if not framework:
            return False
        
        framework.deleted_at = datetime.now(timezone.utc)
        self.db.commit()
        
        return True
    
    def _calculate_progress(self, content: str) -> int:
        """Calculate progress percentage based on markdown checkboxes"""
        if not content:
            return 0
        
        # Count checkboxes: - [x] (completed) and - [ ] (incomplete)
        checkbox_pattern = r'- \[([ x])\]'
        matches = re.findall(checkbox_pattern, content)
        
        if not matches:
            # If no checkboxes, estimate progress based on content length
            # Simple heuristic: if there's substantial content, assume some progress
            content_length = len(content.strip())
            if content_length > 500:
                return 25  # Partial completion
            elif content_length > 100:
                return 10
            return 0
        
        total = len(matches)
        completed = sum(1 for match in matches if match.strip().lower() == 'x')
        
        if total == 0:
            return 0
        
        return int((completed / total) * 100)
    
    def populate_template_variables(
        self,
        template_content: str,
        user_id: Optional[str] = None,
        validation_id: Optional[str] = None,
        idea_id: Optional[str] = None
    ) -> str:
        """Populate template variables with user data"""
        content = template_content
        
        # Get user data
        if user_id:
            user = self.db.query(User).filter(User.user_id == user_id).first()
            if user:
                # Replace user variables
                content = content.replace("{{user.name}}", user.full_name or "User")
                content = content.replace("{{user.email}}", user.email or "")
        
        # Get validation data
        if validation_id:
            validation = self.db.query(Validation).filter(
                Validation.validation_id == validation_id
            ).first()
            if validation:
                # Replace validation variables
                content = content.replace("{{validation.idea}}", validation.idea_explanation or "")
                result = validation.validation_result or {}
                overall_score = result.get("overall_score", 0)
                content = content.replace("{{validation.overall_score}}", str(overall_score))
                content = content.replace("{{validation.scores}}", json.dumps(result.get("scores", {}), indent=2))
        
        # Get idea data from run
        if idea_id:
            # Parse idea_id format: run_id::idea_1
            if "::" in idea_id:
                run_id, idea_index = idea_id.split("::", 1)
                run = self.db.query(Run).filter(Run.run_id == run_id).first()
                if run and run.reports:
                    # Try to extract idea details from reports
                    reports = run.reports if isinstance(run.reports, dict) else json.loads(run.reports)
                    recommendations = reports.get("personalized_recommendations", "")
                    # Simple extraction - can be enhanced
                    content = content.replace("{{idea.title}}", idea_id)
        
        return content
    
    def get_export_content(self, framework: SavedFramework) -> str:
        """Generate export content with metadata"""
        lines = []
        
        # Add header with metadata
        lines.append(f"# {framework.title}")
        lines.append("")
        lines.append(f"**Created:** {framework.created_at.strftime('%Y-%m-%d %H:%M') if framework.created_at else 'N/A'}")
        lines.append(f"**Status:** {framework.status}")
        lines.append(f"**Progress:** {framework.progress_percentage}%")
        lines.append("")
        
        if framework.linked_validation_id:
            lines.append(f"**Linked Validation:** {framework.linked_validation_id}")
            lines.append("")
        if framework.linked_idea_id:
            lines.append(f"**Linked Idea:** {framework.linked_idea_id}")
            lines.append("")
        
        lines.append("---")
        lines.append("")
        
        # Add framework content
        lines.append(framework.customized_content)
        
        return "\n".join(lines)

