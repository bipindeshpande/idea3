"""Founder Profile model for founder network"""
from sqlalchemy import Column, String, Boolean, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from app.core.database import Base
import uuid


class FounderProfile(Base):
    """Model for founder network profiles"""
    
    __tablename__ = "founder_profiles"
    
    # Primary key
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key - one profile per user
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=False, unique=True, index=True)
    
    # Profile data
    full_name = Column(String(255), nullable=True)
    bio = Column(String(2000), nullable=True)
    location = Column(String(255), nullable=True)
    primary_skills = Column(ARRAY(String), nullable=True, default=[])  # Array of strings
    industries_of_interest = Column(ARRAY(String), nullable=True, default=[])  # Array of strings
    looking_for = Column(String(1000), nullable=True)
    commitment_level = Column(String(50), nullable=True)  # part-time, full-time, flexible
    experience_summary = Column(String(5000), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    
    # Privacy
    is_public = Column(Boolean, default=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="founder_profile")
    idea_listings = relationship("FounderIdeaListing", back_populates="founder_profile", cascade="all, delete-orphan")
    sent_connections = relationship("FounderConnection", foreign_keys="FounderConnection.sender_id", back_populates="sender_profile", cascade="all, delete-orphan")
    received_connections = relationship("FounderConnection", foreign_keys="FounderConnection.recipient_id", back_populates="recipient_profile", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_founder_profile_user_id", "user_id"),
        Index("idx_founder_profile_public", "is_public"),
    )
    
    def to_dict(self, anonymize=False):
        """Convert to dictionary, optionally anonymizing"""
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "bio": self.bio,
            "location": self.location,
            "primary_skills": self.primary_skills or [],
            "industries_of_interest": self.industries_of_interest or [],
            "looking_for": self.looking_for,
            "commitment_level": self.commitment_level,
            "experience_summary": self.experience_summary,
            "linkedin_url": self.linkedin_url,
            "website_url": self.website_url,
            "is_public": self.is_public,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        
        # Anonymize for public viewing (don't expose user_id or contact info)
        if anonymize:
            data.pop("user_id", None)
            data.pop("linkedin_url", None)
            data.pop("website_url", None)
            # Could also anonymize name if needed
        
        return data

