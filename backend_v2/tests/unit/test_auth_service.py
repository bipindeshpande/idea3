"""Unit tests for AuthService"""
import pytest
from app.services.auth_service import AuthService
from app.models.user import User
import uuid


@pytest.mark.unit
class TestAuthService:
    """Test AuthService methods"""
    
    def test_get_password_hash(self, db_session):
        """Test password hashing"""
        service = AuthService(db_session)
        password = "testpassword123"
        hashed = service.get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 0
        assert hashed.startswith("$2b$")  # bcrypt hash format
    
    def test_verify_password(self, db_session):
        """Test password verification"""
        service = AuthService(db_session)
        password = "testpassword123"
        hashed = service.get_password_hash(password)
        
        assert service.verify_password(password, hashed) is True
        assert service.verify_password("wrongpassword", hashed) is False
    
    def test_create_access_token(self, db_session):
        """Test token creation"""
        service = AuthService(db_session)
        user_id = str(uuid.uuid4())
        token = service.create_access_token(data={"sub": user_id})
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_decode_access_token(self, db_session):
        """Test token decoding"""
        service = AuthService(db_session)
        user_id = str(uuid.uuid4())
        token = service.create_access_token(data={"sub": user_id, "type": "access"})
        
        payload = service.decode_access_token(token)
        assert payload is not None
        assert payload.get("sub") == user_id
        assert payload.get("type") == "access"
    
    def test_authenticate_user(self, db_session, test_user):
        """Test user authentication"""
        service = AuthService(db_session)
        
        # Flush to ensure user is available in the session
        db_session.flush()
        
        # Correct credentials
        user = service.authenticate_user(test_user.email, "testpassword123")
        assert user is not None
        assert user.user_id == test_user.user_id
        
        # Wrong password
        user = service.authenticate_user(test_user.email, "wrongpassword")
        assert user is None
        
        # Non-existent user
        user = service.authenticate_user("nonexistent@example.com", "password")
        assert user is None
    
    def test_get_user_by_email(self, db_session, test_user):
        """Test getting user by email"""
        service = AuthService(db_session)
        user = service.get_user_by_email(test_user.email)
        
        assert user is not None
        assert user.user_id == test_user.user_id
        
        # Non-existent email
        user = service.get_user_by_email("nonexistent@example.com")
        assert user is None
    
    def test_get_user_by_id(self, db_session, test_user):
        """Test getting user by ID"""
        service = AuthService(db_session)
        user = service.get_user_by_id(test_user.user_id)
        
        assert user is not None
        assert user.email == test_user.email
        
        # Non-existent ID
        user = service.get_user_by_id(str(uuid.uuid4()))
        assert user is None

