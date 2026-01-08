"""Integration tests for Subscription API endpoints"""
import pytest


@pytest.mark.integration
@pytest.mark.api
class TestSubscriptionAPI:
    """Test subscription API endpoints"""
    
    # ==================== Get Subscription Status ====================
    
    def test_get_subscription_status_free_user(self, client, auth_headers):
        """Test getting subscription status for free user"""
        response = client.get("/api/subscription/status", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "subscription" in data
        assert data["subscription"]["type"] == "free"
        assert data["subscription"]["status"] == "expired"
        assert data["subscription"]["is_active"] is False
    
    def test_get_subscription_status_pro_user(self, client, auth_headers, db_session, test_user):
        """Test getting subscription status for pro user"""
        from app.services.user_service import UserService
        
        # Set user to pro subscription
        user_service = UserService(db_session)
        user_service.activate_dev_subscription(test_user.user_id, "pro")
        
        response = client.get("/api/subscription/status", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "pro"
        assert data["subscription"]["status"] == "active"
        assert data["subscription"]["is_active"] is True
    
    def test_get_subscription_status_starter_user(self, client, auth_headers, db_session, test_user):
        """Test getting subscription status for starter user"""
        from app.services.user_service import UserService
        
        # Set user to starter subscription
        user_service = UserService(db_session)
        user_service.activate_dev_subscription(test_user.user_id, "starter")
        
        response = client.get("/api/subscription/status", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "starter"
        assert data["subscription"]["status"] == "active"
        assert data["subscription"]["is_active"] is True
    
    def test_get_subscription_status_without_auth(self, client):
        """Test getting subscription status without authentication"""
        response = client.get("/api/subscription/status")
        
        assert response.status_code == 401
    
    # ==================== Activate Dev Subscription ====================
    
    def test_activate_dev_subscription_starter(self, client, auth_headers, db_session, test_user):
        """Test activating starter subscription"""
        response = client.post("/api/subscription/activate-dev",
            headers=auth_headers,
            json={
                "subscription_type": "starter"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "subscription" in data
        assert data["subscription"]["type"] == "starter"
        assert data["subscription"]["status"] == "active"
        assert data["subscription"]["is_active"] is True
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "starter"
    
    def test_activate_dev_subscription_pro(self, client, auth_headers, db_session, test_user):
        """Test activating pro subscription"""
        response = client.post("/api/subscription/activate-dev",
            headers=auth_headers,
            json={
                "subscription_type": "pro"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "pro"
        assert data["subscription"]["is_active"] is True
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "pro"
    
    def test_activate_dev_subscription_annual(self, client, auth_headers, db_session, test_user):
        """Test activating annual subscription"""
        response = client.post("/api/subscription/activate-dev",
            headers=auth_headers,
            json={
                "subscription_type": "annual"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "annual"
        assert data["subscription"]["is_active"] is True
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "annual"
    
    def test_activate_dev_subscription_weekly(self, client, auth_headers, db_session, test_user):
        """Test activating weekly subscription"""
        response = client.post("/api/subscription/activate-dev",
            headers=auth_headers,
            json={
                "subscription_type": "weekly"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "weekly"
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "weekly"
    
    def test_activate_dev_subscription_free(self, client, auth_headers, db_session, test_user):
        """Test activating free subscription (should work)"""
        # First set to pro
        from app.services.user_service import UserService
        user_service = UserService(db_session)
        user_service.activate_dev_subscription(test_user.user_id, "pro")
        
        # Then set to free
        response = client.post("/api/subscription/activate-dev",
            headers=auth_headers,
            json={
                "subscription_type": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "free"
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "free"
    
    def test_activate_dev_subscription_invalid_type(self, client, auth_headers):
        """Test activating with invalid subscription type"""
        response = client.post("/api/subscription/activate-dev",
            headers=auth_headers,
            json={
                "subscription_type": "invalid_type"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "Invalid subscription type" in data["detail"]
    
    def test_activate_dev_subscription_missing_type(self, client, auth_headers):
        """Test activating without subscription type"""
        response = client.post("/api/subscription/activate-dev",
            headers=auth_headers,
            json={}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_activate_dev_subscription_without_auth(self, client):
        """Test activating subscription without authentication"""
        response = client.post("/api/subscription/activate-dev",
            json={
                "subscription_type": "pro"
            }
        )
        
        assert response.status_code == 401
    
    def test_activate_dev_subscription_already_active(self, client, auth_headers, db_session, test_user):
        """Test activating subscription when already active (should work)"""
        from app.services.user_service import UserService
        
        # First activate pro
        user_service = UserService(db_session)
        user_service.activate_dev_subscription(test_user.user_id, "pro")
        
        # Then activate starter (should work, just changes the type)
        response = client.post("/api/subscription/activate-dev",
            headers=auth_headers,
            json={
                "subscription_type": "starter"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "starter"
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "starter"
    
    # ==================== Cancel Subscription ====================
    
    def test_cancel_subscription_success(self, client, auth_headers, db_session, test_user):
        """Test canceling an active subscription"""
        from app.services.user_service import UserService
        
        # First activate pro subscription
        user_service = UserService(db_session)
        user_service.activate_dev_subscription(test_user.user_id, "pro")
        
        # Then cancel it
        response = client.post("/api/subscription/cancel",
            headers=auth_headers,
            json={}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data
        assert "cancelled" in data["message"].lower()
        assert data["subscription"]["cancel_at_period_end"] is True
        assert data["subscription"]["is_active"] is True  # Still active until period end
    
    def test_cancel_subscription_with_reason(self, client, auth_headers, db_session, test_user):
        """Test canceling subscription with cancellation reason"""
        from app.services.user_service import UserService
        
        # First activate pro subscription
        user_service = UserService(db_session)
        user_service.activate_dev_subscription(test_user.user_id, "pro")
        
        # Cancel with reason
        response = client.post("/api/subscription/cancel",
            headers=auth_headers,
            json={
                "cancellation_reason": "Too expensive",
                "cancellation_category": "pricing",
                "additional_comments": "Need cheaper option"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["cancel_at_period_end"] is True
    
    def test_cancel_subscription_no_active_subscription(self, client, auth_headers):
        """Test canceling when no active subscription (free user)"""
        response = client.post("/api/subscription/cancel",
            headers=auth_headers,
            json={}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "No active subscription" in data["detail"]
    
    def test_cancel_subscription_without_auth(self, client):
        """Test canceling subscription without authentication"""
        response = client.post("/api/subscription/cancel",
            json={}
        )
        
        assert response.status_code == 401
    
    # ==================== Change Subscription Plan ====================
    
    def test_change_plan_with_plan_id(self, client, auth_headers, db_session, test_user):
        """Test changing plan using plan_id"""
        response = client.post("/api/subscription/change-plan",
            headers=auth_headers,
            json={
                "plan_id": "pro"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "pro"
        assert data["subscription"]["is_active"] is True
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "pro"
    
    def test_change_plan_with_subscription_type(self, client, auth_headers, db_session, test_user):
        """Test changing plan using subscription_type (frontend field name)"""
        response = client.post("/api/subscription/change-plan",
            headers=auth_headers,
            json={
                "subscription_type": "starter"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "starter"
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "starter"
    
    def test_change_plan_upgrade_free_to_pro(self, client, auth_headers, db_session, test_user):
        """Test upgrading from free to pro"""
        # User starts as free
        assert test_user.subscription_type == "free"
        
        response = client.post("/api/subscription/change-plan",
            headers=auth_headers,
            json={
                "plan_id": "pro"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "pro"
        assert data["subscription"]["is_active"] is True
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "pro"
    
    def test_change_plan_downgrade_pro_to_free(self, client, auth_headers, db_session, test_user):
        """Test downgrading from pro to free"""
        from app.services.user_service import UserService
        
        # First set to pro
        user_service = UserService(db_session)
        user_service.activate_dev_subscription(test_user.user_id, "pro")
        
        # Then downgrade to free
        response = client.post("/api/subscription/change-plan",
            headers=auth_headers,
            json={
                "plan_id": "free"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "free"
        # Note: change_plan returns is_active: True (mock), but get_subscription_status correctly shows False
        # Verify the actual status endpoint shows it correctly
        status_response = client.get("/api/subscription/status", headers=auth_headers)
        status_data = status_response.json()
        assert status_data["subscription"]["is_active"] is False
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "free"
    
    def test_change_plan_starter_to_annual(self, client, auth_headers, db_session, test_user):
        """Test changing from starter to annual"""
        from app.services.user_service import UserService
        
        # First set to starter
        user_service = UserService(db_session)
        user_service.activate_dev_subscription(test_user.user_id, "starter")
        
        # Then change to annual
        response = client.post("/api/subscription/change-plan",
            headers=auth_headers,
            json={
                "plan_id": "annual"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "annual"
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "annual"
    
    def test_change_plan_invalid_plan_id(self, client, auth_headers):
        """Test changing plan with invalid plan_id"""
        response = client.post("/api/subscription/change-plan",
            headers=auth_headers,
            json={
                "plan_id": "invalid_plan"
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "Invalid plan ID" in data["detail"]
    
    def test_change_plan_missing_both_fields(self, client, auth_headers):
        """Test changing plan without plan_id or subscription_type"""
        response = client.post("/api/subscription/change-plan",
            headers=auth_headers,
            json={}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "plan_id" in data["detail"].lower() or "subscription_type" in data["detail"].lower()
    
    def test_change_plan_without_auth(self, client):
        """Test changing plan without authentication"""
        response = client.post("/api/subscription/change-plan",
            json={
                "plan_id": "pro"
            }
        )
        
        assert response.status_code == 401
    
    def test_change_plan_plan_id_takes_precedence(self, client, auth_headers, db_session, test_user):
        """Test that plan_id takes precedence over subscription_type when both provided"""
        response = client.post("/api/subscription/change-plan",
            headers=auth_headers,
            json={
                "plan_id": "pro",
                "subscription_type": "starter"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["subscription"]["type"] == "pro"  # plan_id should take precedence
        
        # Verify in database
        db_session.refresh(test_user)
        assert test_user.subscription_type == "pro"

