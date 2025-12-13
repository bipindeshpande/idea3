"""Founder Connection model for founder network"""
from sqlalchemy import Column, String, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime
from app.core.database import Base
import uuid


class FounderConnection(Base):
    """Model for founder connection requests"""
    
    __tablename__ = "founder_connections"
    
    # Primary key
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Connection participants
    sender_id = Column(UUID(as_uuid=False), ForeignKey("founder_profiles.id"), nullable=False, index=True)  # Profile ID of sender
    recipient_id = Column(UUID(as_uuid=False), ForeignKey("founder_profiles.id"), nullable=True, index=True)  # Profile ID of recipient (if connecting to profile)
    idea_listing_id = Column(UUID(as_uuid=False), ForeignKey("founder_idea_listings.id"), nullable=True, index=True)  # If connecting to idea
    
    # Connection type
    connection_type = Column(String(50), nullable=False, index=True, default="profile")  # profile or idea
    
    # Status
    status = Column(String(50), nullable=False, default="pending", index=True)  # pending, accepted, rejected, withdrawn
    
    # Optional message
    message = Column(String(1000), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    responded_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    sender_profile = relationship("FounderProfile", foreign_keys=[sender_id], back_populates="sent_connections")
    recipient_profile = relationship("FounderProfile", foreign_keys=[recipient_id], back_populates="received_connections")
    idea_listing = relationship("FounderIdeaListing", back_populates="connections")
    
    # Indexes
    __table_args__ = (
        Index("idx_connection_sender", "sender_id"),
        Index("idx_connection_recipient", "recipient_id"),
        Index("idx_connection_idea", "idea_listing_id"),
        Index("idx_connection_status", "status"),
        Index("idx_connection_type", "connection_type"),
        Index("idx_connection_sender_recipient", "sender_id", "recipient_id", "idea_listing_id"),
    )
    
    def to_dict(self, include_details=False):
        """Convert to dictionary, optionally including full details"""
        data = {
            "id": self.id,
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
            "idea_listing_id": self.idea_listing_id,
            "connection_type": self.connection_type,
            "status": self.status,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "responded_at": self.responded_at.isoformat() if self.responded_at else None,
        }
        
        if include_details:
            if self.sender_profile:
                data["sender"] = self.sender_profile.to_dict(anonymize=False)
            if self.recipient_profile:
                data["recipient"] = self.recipient_profile.to_dict(anonymize=False)
            if self.idea_listing:
                data["idea"] = self.idea_listing.to_dict()
        
        return data

