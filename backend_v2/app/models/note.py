"""Note model for user notes"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class Note(Base):
    """Model for storing user notes"""
    
    __tablename__ = "notes"
    
    # Primary key
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign keys
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.user_id"), nullable=False, index=True)
    
    # Note data
    # Canonical idea_id format: {run_id}::idea_{index}
    # Example: "abc123::idea_1"
    # This format must not change.
    idea_id = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    tags = Column(JSONB, nullable=True, default=list)  # Array of strings stored as JSONB
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notes")
    
    # Indexes
    __table_args__ = (
        Index("idx_notes_user_idea", "user_id", "idea_id"),
    )
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "idea_id": self.idea_id,
            "content": self.content,
            "tags": self.tags if self.tags else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

