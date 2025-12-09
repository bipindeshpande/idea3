"""Run model for storing discovery runs"""
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Run(Base):
    """Model for storing discovery run data"""
    
    __tablename__ = "runs"
    
    # Primary key
    run_id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=True, index=True)
    
    # Input data (intake form responses) - using JSONB for PostgreSQL
    inputs = Column(JSONB, nullable=False)
    
    # Output data (reports) - using JSONB for PostgreSQL
    reports = Column(JSONB, nullable=True)
    
    # Stage outputs
    profile_analysis = Column(Text, nullable=True)  # Stage 1 output
    personalized_recommendations = Column(Text, nullable=True)  # Stage 2 output
    
    # Metadata
    status = Column(String(50), default="pending", index=True)  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)  # Soft delete timestamp
    
    # Relationships
    user = relationship("User", back_populates="runs")
    
    # Indexes
    __table_args__ = (
        Index("idx_runs_user_created", "user_id", "created_at"),
        Index("idx_runs_status", "status"),
    )
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "run_id": self.run_id,
            "user_id": self.user_id,
            "inputs": self.inputs,
            "reports": self.reports,
            "profile_analysis": self.profile_analysis,
            "personalized_recommendations": self.personalized_recommendations,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
        }

