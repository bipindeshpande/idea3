"""Error log model for storing errors in PostgreSQL"""
from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
from app.core.database import Base


class ErrorLog(Base):
    """Error log table for storing application errors"""
    
    __tablename__ = "error_logs"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Request tracking
    request_id = Column(String(255), nullable=True, index=True)
    run_id = Column(UUID(as_uuid=False), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=False), nullable=True, index=True)
    
    # Error details
    error_type = Column(String(255), nullable=False)
    error_message = Column(Text, nullable=False)
    error_traceback = Column(Text, nullable=True)
    
    # Context
    context = Column(JSONB, nullable=True)  # Additional context data
    endpoint = Column(String(255), nullable=True)
    method = Column(String(10), nullable=True)
    
    # Metadata
    severity = Column(String(50), default="error", index=True)  # error, warning, critical
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "request_id": self.request_id,
            "run_id": self.run_id,
            "user_id": self.user_id,
            "error_type": self.error_type,
            "error_message": self.error_message,
            "error_traceback": self.error_traceback,
            "context": self.context,
            "endpoint": self.endpoint,
            "method": self.method,
            "severity": self.severity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

