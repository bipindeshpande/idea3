"""FastAPI dependencies for authentication"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.services.rate_limit_service import RateLimitService
from app.models.user import User
from app.core.config import settings
from app.core.logger import request_id_var

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token
    
    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    auth_service = AuthService(db)
    
    # Decode token
    payload = auth_service.decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user_id from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = auth_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def get_current_user_or_none(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise
    
    Used for routes that work with or without authentication based on ALLOW_UNAUTHENTICATED setting
    """
    if not settings.ALLOW_UNAUTHENTICATED:
        # If unauthenticated access is not allowed, require auth
        if credentials is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return await get_current_user(credentials, db)
    else:
        # If unauthenticated access is allowed, make auth optional
        if credentials is None:
            return None
        try:
            return await get_current_user(credentials, db)
        except HTTPException:
            return None


async def get_current_admin_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated admin user
    
    Raises:
        HTTPException: 401 if not authenticated, 403 if not admin
    """
    user = await get_current_user(credentials, db)
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user


async def check_rate_limit_dependency(
    request: Request,
    db: Session,
    current_user: Optional[User],
    limit: int = 5,
    window_seconds: int = 60,
    endpoint: str = "discovery"
):
    """
    Dependency to check rate limit for discovery requests
    
    Uses Redis INCR with TTL to track requests per IP.
    Returns HTTP 429 if limit exceeded.
    Logs violations to database.
    
    Args:
        request: FastAPI request object
        db: Database session
        current_user: Optional authenticated user
        limit: Maximum requests allowed (default: 5)
        window_seconds: Time window in seconds (default: 60)
        endpoint: Endpoint name for logging (default: "discovery")
    
    Raises:
        HTTPException: 429 if rate limit exceeded
    """
    rate_limit_service = RateLimitService(db)
    
    # Get client IP
    ip_address = rate_limit_service.get_client_ip(request)
    
    # Check rate limit
    is_allowed, current_count, limit_value = rate_limit_service.check_rate_limit(
        ip_address=ip_address,
        limit=limit,
        window_seconds=window_seconds,
        endpoint=endpoint
    )
    
    if not is_allowed:
        # Get request ID and user ID if available
        request_id = request_id_var.get()
        user_id = current_user.user_id if current_user else None
        
        # Log rate limit violation to database
        rate_limit_service.log_rate_limit_violation(
            ip_address=ip_address,
            endpoint=endpoint,
            current_count=current_count,
            limit=limit_value,
            request_id=request_id,
            user_id=user_id
        )
        
        # Calculate retry after (remaining seconds in window)
        retry_after = window_seconds
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {current_count}/{limit_value} requests per {window_seconds} seconds",
            headers={
                "X-RateLimit-Limit": str(limit_value),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(retry_after),
                "Retry-After": str(retry_after)
            }
        )
    
    # Return rate limit info (can be used for response headers)
    return {
        "limit": limit_value,
        "remaining": max(0, limit_value - current_count),
        "reset": window_seconds
    }
