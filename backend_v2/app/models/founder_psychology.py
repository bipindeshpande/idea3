"""Founder Psychology model for storing founder psychology data"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class FounderPsychology(Base):
    """Model for storing founder psychology data"""
    
    __tablename__ = "founder_psychology"
    
    # Primary key
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=False, index=True, unique=True)
    
    # Psychology fields
    motivation = Column(String(255), nullable=True)
    motivation_other = Column(Text, nullable=True)
    fear = Column(String(255), nullable=True)
    fear_other = Column(Text, nullable=True)
    decision_style = Column(String(50), nullable=True)
    energy_pattern = Column(String(50), nullable=True)
    consistency_pattern = Column(String(50), nullable=True)
    risk_approach = Column(String(50), nullable=True)
    success_definition = Column(String(255), nullable=True)
    success_other = Column(Text, nullable=True)
    archetype = Column(String(50), nullable=True)  # Visionary, Builder, Operator, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="founder_psychology")
    
    # Indexes
    __table_args__ = (
        Index("idx_founder_psychology_user_id", "user_id"),
    )
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "motivation": self.motivation,
            "motivation_other": self.motivation_other,
            "fear": self.fear,
            "fear_other": self.fear_other,
            "decision_style": self.decision_style,
            "energy_pattern": self.energy_pattern,
            "consistency_pattern": self.consistency_pattern,
            "risk_approach": self.risk_approach,
            "success_definition": self.success_definition,
            "success_other": self.success_other,
            "archetype": self.archetype,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }







