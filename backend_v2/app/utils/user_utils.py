"""Utility functions for user_id handling"""
from typing import Optional
from app.models.user import User
from app.utils.error_handler import AuthorizationError


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


def verify_run_ownership(
    run_user_id: Optional[str],
    requesting_user_id: Optional[str],
    resource_name: str = "run"
) -> None:
    """
    Verify that the requesting user has permission to access a resource.
    
    Security rules:
    - If resource has a user_id, requesting user must be authenticated and match
    - If resource has no user_id (NULL), require authentication (safer for production)
      This prevents unauthorized access to anonymous resources
    
    Args:
        run_user_id: The user_id of the resource (can be None)
        requesting_user_id: The user_id of the requesting user (can be None)
        resource_name: Name of resource for error messages (default: "run")
        
    Raises:
        AuthorizationError: If user doesn't have permission
    """
    # If resource has a user_id, requesting user must match
    if run_user_id:
        if not requesting_user_id:
            raise AuthorizationError(
                f"Authentication required to access this {resource_name}"
            )
        if run_user_id != requesting_user_id:
            raise AuthorizationError(
                f"You do not have permission to access this {resource_name}"
            )
    else:
        # Resource has no user_id - in production, we require authentication
        # to prevent unauthorized access to anonymous resources
        # (This is a security measure; if you want to allow anonymous access,
        # you'll need session/IP-based verification which is harder to implement securely)
        if not requesting_user_id:
            raise AuthorizationError(
                f"Authentication required to access this {resource_name}"
            )


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

