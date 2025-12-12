"""Psyche Profile model for storing deterministic psyche profiles"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class PsycheProfile(Base):
    """Model for storing deterministic psyche profiles"""
    
    __tablename__ = "psyche_profiles"
    
    # Primary key
    profile_id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=False, index=True, unique=True)
    
    # Psyche profile data (structured scores)
    personality = Column(JSONB, nullable=False)  # {O, C, E, A, N}
    decision_style = Column(JSONB, nullable=False)  # {risk, speed_vs_certainty, maximize}
    motivation = Column(JSONB, nullable=False)  # {autonomy, mastery, purpose}
    confidence = Column(String(10), nullable=False)  # 0.0 to 1.0 as string
    
    # Raw answers (optional, for debugging/retakes)
    raw_answers = Column(JSONB, nullable=True)  # {Q1: "A", Q2: "B", ...}
    optional_text = Column(String, nullable=True)  # Optional text field response
    
    # Metadata
    version = Column(String(10), default="1.0")  # For future schema changes
    psyche_version = Column(String(10), nullable=True)  # Version of scoring algorithm used
    computed_at = Column(DateTime(timezone=True), nullable=True)  # When profile was computed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="psyche_profile")
    
    # Indexes
    __table_args__ = (
        Index("idx_psyche_profiles_user_created", "user_id", "created_at"),
    )
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "profile_id": self.profile_id,
            "user_id": self.user_id,
            "personality": self.personality,
            "decision_style": self.decision_style,
            "motivation": self.motivation,
            "confidence": float(self.confidence) if self.confidence else 0.0,
            "version": self.version,
            "psyche_version": self.psyche_version,
            "computed_at": self.computed_at.isoformat() if self.computed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def to_ai_format(self):
        """Format for AI consumption (no raw answers)"""
        return {
            "personality": self.personality,
            "decision_style": self.decision_style,
            "motivation": self.motivation,
            "confidence": float(self.confidence) if self.confidence else 0.0,
        }

