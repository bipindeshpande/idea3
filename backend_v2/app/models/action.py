"""Action model for user action items"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Action(Base):
    """Model for storing user action items"""
    
    __tablename__ = "actions"
    
    # Primary key
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=False, index=True)
    
    # Action data
    idea_id = Column(String(255), nullable=False, index=True)  # Format: "run_{run_id}_idea_{index}" or similar
    action_text = Column(String(1000), nullable=False)
    status = Column(String(50), default="pending", index=True)  # pending, in_progress, completed, blocked
    due_date = Column(Date, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="actions")
    
    # Indexes
    __table_args__ = (
        Index("idx_actions_user_idea", "user_id", "idea_id"),
        Index("idx_actions_status", "status"),
    )
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "idea_id": self.idea_id,
            "action_text": self.action_text,
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

