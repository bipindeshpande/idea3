"""Contact submission model for storing contact form submissions"""
from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.sql import func
from app.core.database import Base


class ContactSubmission(Base):
    """Contact submission table for storing contact form submissions"""
    
    __tablename__ = "contact_submissions"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Contact information
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=True)
    topic = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    status = Column(String(50), default="new", index=True)  # new, read, replied, archived
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "company": self.company,
            "topic": self.topic,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

