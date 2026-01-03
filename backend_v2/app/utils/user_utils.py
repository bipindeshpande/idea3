"""Utility functions for user_id handling"""
from typing import Optional
from app.models.user import User


def extract_user_id(user: Optional[User]) -> Optional[str]:
    """
    Safely extract user_id from User object
    
    Args:
        user: Optional User object from authentication
        
    Returns:
        user_id string if user exists and is valid, None otherwise
    """
    if user is None:
        return None
    
    if not hasattr(user, 'user_id'):
        return None
    
    user_id = user.user_id
    if not user_id or not isinstance(user_id, str):
        return None
    
    return user_id


def validate_user_id(user_id: Optional[str], allow_none: bool = True) -> Optional[str]:
    """
    Validate user_id format
    
    Args:
        user_id: User ID to validate
        allow_none: Whether None is allowed
        
    Returns:
        Validated user_id or None
        
    Raises:
        ValueError: If user_id is invalid and allow_none is False
    """
    if user_id is None:
        if allow_none:
            return None
        raise ValueError("user_id is required")
    
    if not isinstance(user_id, str):
        raise ValueError(f"user_id must be a string, got {type(user_id)}")
    
    if not user_id.strip():
        if allow_none:
            return None
        raise ValueError("user_id cannot be empty")
    
    return user_id.strip()

