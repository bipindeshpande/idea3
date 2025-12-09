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

