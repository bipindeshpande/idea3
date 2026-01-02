"""Saved Framework model for storing user framework instances"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class SavedFramework(Base):
    """Model for storing user framework instances"""
    
    __tablename__ = "saved_frameworks"
    
    # Primary key
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=False, index=True)
    
    # Framework template reference (ID from frameworksConfig.js)
    framework_template_id = Column(Integer, nullable=False, index=True)
    
    # Framework content - customized markdown content (JSONB for flexibility)
    customized_content = Column(Text, nullable=False)  # Store markdown as text
    
    # Metadata
    title = Column(String(500), nullable=False)  # User-customized title
    status = Column(String(50), default="draft", index=True)  # draft, in_progress, completed
    progress_percentage = Column(Integer, default=0)  # 0-100
    
    # Links to ideas/validations
    linked_idea_id = Column(String(255), nullable=True, index=True)  # Format: run_id::idea_1 or validation_id
    linked_validation_id = Column(UUID(as_uuid=False), ForeignKey("validations.validation_id"), nullable=True, index=True)
    
    # Additional metadata stored as JSONB (using extra_metadata to avoid conflict with SQLAlchemy's reserved 'metadata' attribute)
    extra_metadata = Column(JSONB, nullable=True)  # Store custom fields, tags, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)  # Soft delete
    
    # Relationships
    user = relationship("User", back_populates="saved_frameworks")
    validation = relationship("Validation", foreign_keys=[linked_validation_id])
    
    # Indexes
    __table_args__ = (
        Index("idx_saved_frameworks_user_status", "user_id", "status"),
        Index("idx_saved_frameworks_user_created", "user_id", "created_at"),
        Index("idx_saved_frameworks_template", "framework_template_id"),
    )
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "framework_template_id": self.framework_template_id,
            "customized_content": self.customized_content,
            "title": self.title,
            "status": self.status,
            "progress_percentage": self.progress_percentage,
            "linked_idea_id": self.linked_idea_id,
            "linked_validation_id": self.linked_validation_id,
            "metadata": self.extra_metadata if self.extra_metadata else {},  # Keep 'metadata' key in dict for API compatibility
            "extra_metadata": self.extra_metadata if self.extra_metadata else {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

