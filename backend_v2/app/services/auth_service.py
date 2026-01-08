"""Authentication service for JWT and password management"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from app.services.base_service import BaseService
from app.models.user import User
from app.core.config import settings


class AuthService(BaseService):
    """Service for authentication and authorization"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def decode_access_token(token: str) -> Optional[dict]:
        """Decode and verify a JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None
    
    def register_user(self, email: str, password: str) -> User:
        """Register a new user"""
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email == email).first()
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        hashed_password = self.get_password_hash(password)
        
        # Create user
        user = User(
            email=email,
            hashed_password=hashed_password,
            is_active=True,
            is_verified=False
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user and return user object if valid"""
        import logging
        logger = logging.getLogger("startup_discovery")
        
        user = self.db.query(User).filter(User.email == email).first()
        
        if not user:
            logger.info(f"Authentication failed: User not found for email: {email}")
            return None
        
        if not self.verify_password(password, user.hashed_password):
            logger.info(f"Authentication failed: Incorrect password for email: {email}")
            return None
        
        if not user.is_active:
            logger.warning(f"Authentication failed: User account is inactive for email: {email}")
            return None
        
        # Update last_login
        user.last_login = datetime.now(timezone.utc)
        self.db.commit()
        
        logger.info(f"Authentication successful for email: {email}, user_id: {user.user_id}")
        return user
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.user_id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

