"""Integration tests for Auth API endpoints"""
import pytest


@pytest.mark.integration
@pytest.mark.api
class TestAuthAPI:
    """Test authentication API endpoints"""
    
    def test_register_user(self, client):
        """Test user registration"""
        response = client.post("/api/auth/register", json={
            "email": "newuser@example.com",
            "password": "password123"
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "user_id" in data
        assert data["email"] == "newuser@example.com"
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registering with duplicate email"""
        response = client.post("/api/auth/register", json={
            "email": test_user.email,
            "password": "password123"
        })
        
        assert response.status_code == 400
    
    def test_login_success(self, client, test_user):
        """Test successful login"""
        response = client.post("/api/auth/login", json={
            "email": test_user.email,
            "password": "testpassword123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "session_token" in data
        assert "user" in data
    
    def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password"""
        response = client.post("/api/auth/login", json={
            "email": test_user.email,
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
    
    def test_logout(self, client, auth_headers):
        """Test logout endpoint"""
        response = client.post("/api/auth/logout", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_forgot_password(self, client, test_user):
        """Test forgot password request"""
        response = client.post("/api/auth/forgot-password", json={
            "email": test_user.email
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data
    
    def test_reset_password(self, client, test_user, db_session):
        """Test password reset with token"""
        from app.services.auth_service import AuthService
        
        # Create reset token using test session
        auth_service = AuthService(db_session)
        token = auth_service.create_access_token(
            data={"sub": test_user.user_id, "type": "password_reset"},
            expires_delta=None
        )
        
        response = client.post("/api/auth/reset-password", json={
            "token": token,
            "password": "newpassword123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify new password works
        login_response = client.post("/api/auth/login", json={
            "email": test_user.email,
            "password": "newpassword123"
        })
        assert login_response.status_code == 200
    
    def test_change_password(self, client, auth_headers, test_user):
        """Test changing password"""
        response = client.post("/api/auth/change-password", 
            headers=auth_headers,
            json={
                "current_password": "testpassword123",
                "new_password": "newpassword456"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify new password works
        login_response = client.post("/api/auth/login", json={
            "email": test_user.email,
            "password": "newpassword456"
        })
        assert login_response.status_code == 200
    
    def test_change_password_wrong_current(self, client, auth_headers):
        """Test changing password with wrong current password"""
        response = client.post("/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "wrongpassword",
                "new_password": "newpassword456"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "error" in data

