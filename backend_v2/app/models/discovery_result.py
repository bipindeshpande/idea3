"""Discovery Result model for storing discovery run results"""
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class DiscoveryResult(Base):
    """Model for storing discovery result data"""
    
    __tablename__ = "discovery_results"
    
    # Primary key
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key to runs table
    run_id = Column(UUID(as_uuid=False), ForeignKey("runs.run_id"), nullable=False, index=True)
    
    # Input payload (JSONB for PostgreSQL)
    input_payload = Column(JSONB, nullable=False)
    
    # Result data (JSONB for PostgreSQL)
    result = Column(JSONB, nullable=False)
    
    # Status
    status = Column(String(50), nullable=False, default="pending", index=True)  # pending, completed, failed
    
    # Error message (nullable)
    error_message = Column(String(500), nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "run_id": self.run_id,
            "input_payload": self.input_payload,
            "result": self.result,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

