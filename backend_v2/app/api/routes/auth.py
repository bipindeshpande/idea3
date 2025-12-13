"""Authentication API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.auth_service import AuthService
from app.core.config import settings
from app.models.user import User
from datetime import timedelta

router = APIRouter()


class RegisterRequest(BaseModel):
    """Request model for user registration"""
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    """Response model for user registration"""
    success: bool
    user_id: str
    email: str
    message: str


class LoginRequest(BaseModel):
    """Request model for user login"""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Response model for user login"""
    success: bool = True
    session_token: str  # Frontend expects 'session_token' not 'access_token'
    access_token: str  # Keep for backward compatibility
    token_type: str
    user_id: str
    email: str
    user: Optional[Dict[str, Any]] = None  # Frontend expects user object


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user
    
    Creates a new user account with email and password.
    Password is hashed using bcrypt before storage.
    
    Returns:
        User ID and email on success
    """
    try:
        auth_service = AuthService(db)
        user = auth_service.register_user(
            email=request.email,
            password=request.password
        )
        
        return RegisterResponse(
            success=True,
            user_id=user.user_id,
            email=user.email,
            message="User registered successfully"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login and get JWT access token
    
    Authenticates user with email and password.
    Returns a JWT access token for subsequent API requests.
    
    Returns:
        JWT access token and user information
    """
    auth_service = AuthService(db)
    
    # Authenticate user
    user = auth_service.authenticate_user(
        email=request.email,
        password=request.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.user_id},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        success=True,
        session_token=access_token,  # Frontend expects this field name
        access_token=access_token,  # Keep for backward compatibility
        token_type="bearer",
        user_id=user.user_id,
        email=user.email,
        user=user.to_dict()  # Frontend expects user object
    )


@router.get("/me", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information
    
    Returns:
        User object with all user details
    """
    return {
        "success": True,
        "user": current_user.to_dict()
    }


class ForgotPasswordRequest(BaseModel):
    """Request model for forgot password"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request model for reset password"""
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    """Request model for change password"""
    current_password: str
    new_password: str


@router.post("/logout", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout endpoint
    
    Note: JWT tokens are stateless, so logout is handled client-side.
    This endpoint exists for consistency and could be used for server-side
    token blacklisting in the future.
    
    Returns:
        Success message
    """
    # In a production system, you might want to blacklist the token here
    # For now, we just return success - frontend handles token removal
    return {
        "success": True,
        "message": "Logged out successfully"
    }


@router.post("/forgot-password", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset
    
    Generates a reset token and sends it via email (if email service configured).
    For now, returns a mock response indicating success.
    
    In production, this should:
    1. Generate a secure reset token
    2. Store it in database with expiration
    3. Send email with reset link
    """
    try:
        auth_service = AuthService(db)
        user = auth_service.get_user_by_email(request.email)
        
        # Always return success (don't reveal if email exists for security)
        # In production, generate and send reset token
        # For now, return success message
        return {
            "success": True,
            "message": "If an account with that email exists, a password reset link has been sent."
        }
    except Exception as e:
        # Always return success to avoid email enumeration
        return {
            "success": True,
            "message": "If an account with that email exists, a password reset link has been sent."
        }


@router.post("/reset-password", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using token
    
    Validates reset token and updates password.
    
    Note: This is a simplified implementation. In production:
    1. Verify token from database
    2. Check token expiration
    3. Update password
    4. Invalidate token
    """
    try:
        auth_service = AuthService(db)
        
        # TODO: In production, verify token from database
        # For now, decode token to get user_id
        payload = auth_service.decode_access_token(request.token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
        
        user = auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update password
        hashed_password = auth_service.get_password_hash(request.new_password)
        user.hashed_password = hashed_password
        db.commit()
        
        return {
            "success": True,
            "message": "Password reset successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}"
        )


@router.post("/change-password", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change password for authenticated user
    
    Requires current password verification.
    """
    try:
        auth_service = AuthService(db)
        
        # Verify current password
        if not auth_service.verify_password(request.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Update password
        hashed_password = auth_service.get_password_hash(request.new_password)
        current_user.hashed_password = hashed_password
        db.commit()
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )

