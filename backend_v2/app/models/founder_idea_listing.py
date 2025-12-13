"""Founder Idea Listing model for founder network"""
from sqlalchemy import Column, String, Boolean, Float, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from app.core.database import Base
import uuid


class FounderIdeaListing(Base):
    """Model for founder idea listings"""
    
    __tablename__ = "founder_idea_listings"
    
    # Primary key
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key - profile that owns this listing
    profile_id = Column(UUID(as_uuid=False), ForeignKey("founder_profiles.id"), nullable=False, index=True)
    
    # Idea data
    title = Column(String(500), nullable=False)
    brief_description = Column(String(2000), nullable=True)
    industry = Column(String(255), nullable=True, index=True)
    stage = Column(String(50), nullable=True, index=True)  # idea, mvp, launched
    skills_needed = Column(ARRAY(String), nullable=True, default=[])  # Array of strings
    
    # Source tracking (optional - links to validation or discovery)
    source_type = Column(String(50), nullable=True, index=True)  # validation, discovery, manual
    source_id = Column(String(255), nullable=True, index=True)  # validation_id or run_id
    validation_score = Column(Float, nullable=True)  # If from validation
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    founder_profile = relationship("FounderProfile", back_populates="idea_listings")
    connections = relationship("FounderConnection", back_populates="idea_listing", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_idea_listing_profile", "profile_id"),
        Index("idx_idea_listing_active", "is_active"),
        Index("idx_idea_listing_source", "source_type", "source_id"),
        Index("idx_idea_listing_industry_stage", "industry", "stage"),
    )
    
    def to_dict(self, include_founder=False):
        """Convert to dictionary, optionally including founder profile"""
        data = {
            "id": self.id,
            "profile_id": self.profile_id,
            "title": self.title,
            "brief_description": self.brief_description,
            "industry": self.industry,
            "stage": self.stage,
            "skills_needed": self.skills_needed or [],
            "source_type": self.source_type,
            "source_id": self.source_id,
            "validation_score": float(self.validation_score) if self.validation_score else None,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_founder and self.founder_profile:
            data["founder"] = self.founder_profile.to_dict(anonymize=True)
        
        return data

