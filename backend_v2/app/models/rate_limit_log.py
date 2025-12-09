"""Rate limit log model for storing rate limit violations"""
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class RateLimitLog(Base):
    """Rate limit log table for storing rate limit violations"""
    
    __tablename__ = "rate_limit_logs"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # IP address and endpoint
    ip_address = Column(String(45), nullable=False, index=True)  # IPv6 max length is 45
    endpoint = Column(String(255), nullable=False, index=True)
    
    # Rate limit details
    request_count = Column(Integer, nullable=False)  # Current count when limit exceeded
    limit = Column(Integer, nullable=False)  # Rate limit threshold
    
    # Request tracking
    request_id = Column(String(255), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=False), nullable=True, index=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "ip_address": self.ip_address,
            "endpoint": self.endpoint,
            "request_count": self.request_count,
            "limit": self.limit,
            "request_id": self.request_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

