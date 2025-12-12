"""Validation model for storing idea validation results"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Validation(Base):
    """Model for storing idea validation data"""
    
    __tablename__ = "validations"
    
    # Primary key
    validation_id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=True, index=True)
    
    # Input data - category answers and idea explanation
    category_answers = Column(JSONB, nullable=False)  # Validation form answers
    idea_explanation = Column(Text, nullable=False)  # User's idea description
    
    # Validation result data (JSONB for PostgreSQL)
    validation_result = Column(JSONB, nullable=False)  # Contains scores, recommendations, next_steps, etc.
    
    # Metadata
    status = Column(String(50), default="completed", index=True)  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)  # Soft delete timestamp
    
    # Relationships
    user = relationship("User", back_populates="validations")
    
    # Indexes
    __table_args__ = (
        Index("idx_validations_user_created", "user_id", "created_at"),
        Index("idx_validations_status", "status"),
    )
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "validation_id": self.validation_id,
            "id": self.validation_id,  # Alias for compatibility
            "user_id": self.user_id,
            "category_answers": self.category_answers,
            "idea_explanation": self.idea_explanation,
            "validation_result": self.validation_result,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

