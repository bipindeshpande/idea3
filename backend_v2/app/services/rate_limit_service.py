"""Rate limiting service using Redis"""
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import Request, HTTPException, status
from app.services.base_service import BaseService
from app.models.rate_limit_log import RateLimitLog
from app.core.redis_client import get_redis
from app.core.config import settings
from app.core.logger import request_id_var


class RateLimitService(BaseService):
    """Service for rate limiting using Redis"""
    
    def __init__(self, db: Session, redis_client=None):
        super().__init__(db, redis_client)
        self.redis = redis_client or get_redis()
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request"""
        # Check for forwarded IP (when behind proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(",")[0].strip()
        
        # Check for real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        # Fall back to direct client IP
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def check_rate_limit(
        self,
        ip_address: str,
        limit: int = 5,
        window_seconds: int = 60,
        endpoint: str = "discovery"
    ) -> tuple[bool, int, int]:
        """
        Check if IP address has exceeded rate limit
        
        Args:
            ip_address: Client IP address
            limit: Maximum number of requests allowed
            window_seconds: Time window in seconds (default: 60 for 1 minute)
            endpoint: Endpoint name for logging
        
        Returns:
            Tuple of (is_allowed, current_count, limit)
        """
        if not self.redis:
            # If Redis is not available, allow the request
            self._log("Redis not available, skipping rate limit check", "WARNING")
            return True, 0, limit
        
        # Create Redis key: rate_limit:{endpoint}:{ip_address}
        redis_key = f"rate_limit:{endpoint}:{ip_address}"
        
        try:
            # Use INCR to increment counter (creates key if doesn't exist)
            current_count = self.redis.incr(redis_key)
            
            # Set TTL if this is the first request in the window
            if current_count == 1:
                self.redis.expire(redis_key, window_seconds)
            
            # Check if limit exceeded
            is_allowed = current_count <= limit
            
            return is_allowed, current_count, limit
            
        except Exception as e:
            # If Redis operation fails, allow the request but log error
            self._log(f"Rate limit check failed: {e}", "ERROR")
            return True, 0, limit
    
    def log_rate_limit_violation(
        self,
        ip_address: str,
        endpoint: str,
        current_count: int,
        limit: int,
        request_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> RateLimitLog:
        """
        Log rate limit violation to database
        
        Args:
            ip_address: Client IP address
            endpoint: Endpoint that was rate limited
            current_count: Current request count
            limit: Rate limit threshold
            request_id: Optional request ID
            user_id: Optional user ID
        
        Returns:
            RateLimitLog entry
        """
        rate_limit_log = RateLimitLog(
            ip_address=ip_address,
            endpoint=endpoint,
            request_count=current_count,
            limit=limit,
            request_id=request_id,
            user_id=user_id
        )
        
        self.db.add(rate_limit_log)
        self.db.commit()
        self.db.refresh(rate_limit_log)
        
        return rate_limit_log

