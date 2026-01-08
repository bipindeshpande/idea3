"""Integration tests for Admin API endpoints"""
import pytest
import os


@pytest.mark.integration
@pytest.mark.api
class TestAdminAPI:
    """Test admin API endpoints"""
    
    @pytest.fixture
    def admin_headers(self):
        """Get admin auth headers"""
        admin_password = os.getenv("ADMIN_PASSWORD", "admin2024")
        return {"Authorization": f"Bearer {admin_password}"}
    
    @pytest.fixture
    def admin_headers_with_db(self, db_session):
        """Get admin auth headers with database session"""
        admin_password = os.getenv("ADMIN_PASSWORD", "admin2024")
        return {"Authorization": f"Bearer {admin_password}"}
    
    def test_admin_login(self, client):
        """Test admin login"""
        admin_password = os.getenv("ADMIN_PASSWORD", "admin2024")
        response = client.post("/api/admin/login", json={
            "password": admin_password
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_admin_login_wrong_password(self, client):
        """Test admin login with wrong password"""
        response = client.post("/api/admin/login", json={
            "password": "wrongpassword"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
    
    def test_admin_stats(self, client, admin_headers):
        """Test getting admin stats"""
        response = client.get("/api/admin/stats", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "stats" in data
        
        stats = data["stats"]
        assert "total_users" in stats
        assert "total_runs" in stats
        assert "total_validations" in stats
        assert "active_subscriptions" in stats
    
    def test_admin_get_users(self, client, admin_headers, test_user):
        """Test getting all users"""
        response = client.get("/api/admin/users", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert len(data["users"]) > 0
    
    def test_admin_get_user_detail(self, client, admin_headers, test_user):
        """Test getting user details"""
        response = client.get(f"/api/admin/user/{test_user.user_id}",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        # Admin service returns "id" not "user_id"
        assert data["user"]["id"] == test_user.user_id
    
    def test_admin_update_subscription(self, client, admin_headers, test_user):
        """Test updating user subscription"""
        response = client.put(f"/api/admin/user/{test_user.user_id}/subscription",
            headers=admin_headers,
            json={
                "subscription_type": "pro",
                "duration_days": 30
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_admin_get_settings(self, client, admin_headers):
        """Test getting settings"""
        response = client.get("/api/admin/settings", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "settings" in data
    
    def test_admin_update_settings(self, client, admin_headers):
        """Test updating settings"""
        response = client.post("/api/admin/settings",
            headers=admin_headers,
            json={"debug_mode": False}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

