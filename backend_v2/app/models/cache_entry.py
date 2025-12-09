"""Cache entry model for database-backed caching"""
from sqlalchemy import Column, String, Integer, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.core.database import Base
import hashlib
import json


class CacheEntry(Base):
    """Model for database-backed cache entries"""
    
    __tablename__ = "cache_entries"
    
    # Primary key (hash of cache key)
    cache_key_hash = Column(String(64), primary_key=True)
    
    # Cache key (for debugging)
    cache_key = Column(String(500), nullable=False, index=True)
    
    # Cache value (JSONB for PostgreSQL)
    cache_value = Column(JSONB, nullable=False)
    
    # Metadata
    cache_type = Column(String(50), nullable=False, index=True)  # profile, recommendations, tools, etc.
    ttl_seconds = Column(Integer, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Indexes
    __table_args__ = (
        Index("idx_cache_expires", "expires_at"),
        Index("idx_cache_type_expires", "cache_type", "expires_at"),
    )
    
    @staticmethod
    def generate_key_hash(key: str) -> str:
        """Generate hash for cache key"""
        return hashlib.sha256(key.encode()).hexdigest()
    
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        from datetime import datetime, timezone
        return datetime.now(timezone.utc) > self.expires_at
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "cache_key": self.cache_key,
            "cache_value": self.cache_value if self.cache_value else None,  # JSONB is already a dict
            "cache_type": self.cache_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }

