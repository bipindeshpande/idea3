"""Integration tests for Founder API endpoints"""
import pytest
from datetime import datetime, timezone
import uuid


@pytest.mark.integration
@pytest.mark.api
class TestFounderAPI:
    """Test founder API endpoints"""
    
    # ==================== Psychology Endpoints ====================
    
    def test_get_psychology_not_found(self, client, auth_headers):
        """Test getting psychology when none exists"""
        response = client.get("/api/founder/psychology", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        # Should return empty structure
        assert data["data"]["motivation"] == ""
    
    def test_save_psychology_success(self, client, auth_headers):
        """Test saving founder psychology"""
        response = client.post("/api/founder/psychology",
            headers=auth_headers,
            json={
                "motivation": "impact",
                "fear": "failure",
                "decision_style": "analytical",
                "energy_pattern": "morning",
                "archetype": "Visionary"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["motivation"] == "impact"
        assert data["data"]["archetype"] == "Visionary"
    
    def test_get_psychology_after_save(self, client, auth_headers):
        """Test getting psychology after saving"""
        # First save
        client.post("/api/founder/psychology",
            headers=auth_headers,
            json={
                "motivation": "impact",
                "archetype": "Builder"
            }
        )
        
        # Then get
        response = client.get("/api/founder/psychology", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["motivation"] == "impact"
        assert data["data"]["archetype"] == "Builder"
    
    def test_update_psychology(self, client, auth_headers):
        """Test updating existing psychology"""
        # First save
        client.post("/api/founder/psychology",
            headers=auth_headers,
            json={
                "motivation": "impact",
                "archetype": "Builder"
            }
        )
        
        # Then update
        response = client.post("/api/founder/psychology",
            headers=auth_headers,
            json={
                "motivation": "wealth",
                "archetype": "Operator"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["motivation"] == "wealth"
        assert data["data"]["archetype"] == "Operator"
    
    def test_save_psychology_without_auth(self, client):
        """Test saving psychology without authentication"""
        response = client.post("/api/founder/psychology",
            json={
                "motivation": "impact"
            }
        )
        
        assert response.status_code == 401
    
    # ==================== Profile Endpoints ====================
    
    def test_get_profile_not_found(self, client, auth_headers):
        """Test getting profile when none exists"""
        response = client.get("/api/founder/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["profile"] is None
    
    def test_save_profile_success(self, client, auth_headers):
        """Test saving founder profile"""
        response = client.post("/api/founder/profile",
            headers=auth_headers,
            json={
                "full_name": "John Doe",
                "bio": "Experienced entrepreneur",
                "location": "San Francisco, CA",
                "primary_skills": ["Python", "JavaScript"],
                "industries_of_interest": ["AI", "SaaS"],
                "commitment_level": "full-time",
                "is_public": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Profile saved successfully"
        assert "profile" in data
        assert data["profile"]["full_name"] == "John Doe"
        assert data["profile"]["location"] == "San Francisco, CA"
        assert len(data["profile"]["primary_skills"]) == 2
    
    def test_get_profile_after_save(self, client, auth_headers):
        """Test getting profile after saving"""
        # First save
        client.post("/api/founder/profile",
            headers=auth_headers,
            json={
                "full_name": "Jane Smith",
                "bio": "Tech entrepreneur"
            }
        )
        
        # Then get
        response = client.get("/api/founder/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["profile"]["full_name"] == "Jane Smith"
        assert data["profile"]["bio"] == "Tech entrepreneur"
    
    def test_update_profile(self, client, auth_headers):
        """Test updating existing profile"""
        # First save
        client.post("/api/founder/profile",
            headers=auth_headers,
            json={
                "full_name": "John Doe",
                "location": "NYC"
            }
        )
        
        # Then update
        response = client.post("/api/founder/profile",
            headers=auth_headers,
            json={
                "full_name": "John Doe Updated",
                "location": "San Francisco, CA"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["profile"]["full_name"] == "John Doe Updated"
        assert data["profile"]["location"] == "San Francisco, CA"
    
    def test_save_profile_without_auth(self, client):
        """Test saving profile without authentication"""
        response = client.post("/api/founder/profile",
            json={
                "full_name": "John Doe"
            }
        )
        
        assert response.status_code == 401
    
    # ==================== Idea Listings Endpoints ====================
    
    def test_get_user_listings_empty(self, client, auth_headers):
        """Test getting listings when none exist"""
        response = client.get("/api/founder/ideas", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["listings"] == []
    
    def test_create_listing_success(self, client, auth_headers, db_session, test_user):
        """Test creating an idea listing"""
        from app.models.founder_profile import FounderProfile
        
        # Create a profile first (required for listing)
        profile = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="Test User",
            is_public=True
        )
        db_session.add(profile)
        db_session.commit()
        
        response = client.post("/api/founder/ideas",
            headers=auth_headers,
            json={
                "title": "AI-Powered Analytics Platform",
                "brief_description": "A platform for data analytics",
                "industry": "AI",
                "stage": "idea",
                "skills_needed": ["Python", "ML"]
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Listing created successfully"
        assert "listing" in data
        assert data["listing"]["title"] == "AI-Powered Analytics Platform"
        assert data["listing"]["industry"] == "AI"
    
    def test_get_user_listings_after_create(self, client, auth_headers, db_session, test_user):
        """Test getting listings after creating one"""
        from app.models.founder_profile import FounderProfile
        
        # Create a profile first
        profile = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="Test User",
            is_public=True
        )
        db_session.add(profile)
        db_session.commit()
        
        # Create a listing
        client.post("/api/founder/ideas",
            headers=auth_headers,
            json={
                "title": "Test Idea",
                "industry": "Tech"
            }
        )
        
        # Get listings
        response = client.get("/api/founder/ideas", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["listings"]) > 0
        assert any(l["title"] == "Test Idea" for l in data["listings"])
    
    def test_get_listing_by_id_success(self, client, auth_headers, db_session, test_user):
        """Test getting a single listing by ID"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_idea_listing import FounderIdeaListing
        
        # Create a profile
        profile = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="Test User",
            is_public=True
        )
        db_session.add(profile)
        db_session.flush()
        
        # Create a listing
        listing = FounderIdeaListing(
            id=str(uuid.uuid4()),
            profile_id=profile.id,
            title="Test Listing",
            industry="Tech"
        )
        db_session.add(listing)
        db_session.commit()
        
        response = client.get(f"/api/founder/ideas/{listing.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["listing"]["id"] == listing.id
        assert data["listing"]["title"] == "Test Listing"
    
    def test_get_listing_not_found(self, client, auth_headers):
        """Test getting non-existent listing"""
        fake_id = str(uuid.uuid4())
        response = client.get(f"/api/founder/ideas/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_update_listing_success(self, client, auth_headers, db_session, test_user):
        """Test updating a listing"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_idea_listing import FounderIdeaListing
        
        # Create a profile
        profile = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="Test User",
            is_public=True
        )
        db_session.add(profile)
        db_session.flush()
        
        # Create a listing
        listing = FounderIdeaListing(
            id=str(uuid.uuid4()),
            profile_id=profile.id,
            title="Original Title",
            industry="Tech"
        )
        db_session.add(listing)
        db_session.commit()
        
        # Update listing
        response = client.put(f"/api/founder/ideas/{listing.id}",
            headers=auth_headers,
            json={
                "title": "Updated Title",
                "industry": "AI"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Listing updated successfully"
        assert data["listing"]["title"] == "Updated Title"
        assert data["listing"]["industry"] == "AI"
    
    def test_update_listing_not_found(self, client, auth_headers):
        """Test updating non-existent listing"""
        fake_id = str(uuid.uuid4())
        response = client.put(f"/api/founder/ideas/{fake_id}",
            headers=auth_headers,
            json={
                "title": "Updated Title"
            }
        )
        
        assert response.status_code == 404
    
    def test_browse_listings_with_filters(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test browsing listings with filters"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_idea_listing import FounderIdeaListing
        
        # Create profiles for both users
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        db_session.add(profile2)
        db_session.flush()
        
        # Create listings with different industries - flush after each
        listing1 = FounderIdeaListing(
            id=str(uuid.uuid4()),
            profile_id=profile1.id,
            title="AI Idea",
            industry="AI",
            is_active=True
        )
        db_session.add(listing1)
        db_session.flush()
        
        listing2 = FounderIdeaListing(
            id=str(uuid.uuid4()),
            profile_id=profile2.id,
            title="SaaS Idea",
            industry="SaaS",
            is_active=True
        )
        db_session.add(listing2)
        db_session.flush()
        db_session.commit()
        
        # Browse with industry filter
        response = client.get("/api/founder/ideas/browse?industry=AI", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "listings" in data
        assert "total" in data
        # Should only see AI listings
        ai_listings = [l for l in data["listings"] if l.get("industry") == "AI"]
        assert len(ai_listings) > 0
    
    def test_browse_listings_pagination(self, client, auth_headers, db_session, test_user):
        """Test browsing listings with pagination"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_idea_listing import FounderIdeaListing
        
        # Create a profile
        profile = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="Test User",
            is_public=True
        )
        db_session.add(profile)
        db_session.flush()
        
        # Create multiple listings - flush after each
        for i in range(5):
            listing = FounderIdeaListing(
                id=str(uuid.uuid4()),
                profile_id=profile.id,
                title=f"Listing {i}",
                is_active=True
            )
            db_session.add(listing)
            db_session.flush()  # Flush after each to avoid UUID bulk insert issues
        db_session.commit()
        
        # Browse with pagination
        response = client.get("/api/founder/ideas/browse?page=1&per_page=2", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["listings"]) <= 2
        assert data["page"] == 1
        assert data["per_page"] == 2
    
    # ==================== People Browse Endpoint ====================
    
    def test_browse_profiles_basic(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test browsing profiles"""
        from app.models.founder_profile import FounderProfile
        
        # Create public profiles - flush after each
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True,
            location="San Francisco"
        )
        db_session.add(profile1)
        db_session.flush()
        
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True,
            location="NYC"
        )
        db_session.add(profile2)
        db_session.flush()
        db_session.commit()
        
        response = client.get("/api/founder/people/browse", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "profiles" in data
        assert "total" in data
        assert isinstance(data["profiles"], list)
    
    def test_browse_profiles_with_filters(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test browsing profiles with filters"""
        from app.models.founder_profile import FounderProfile
        
        # Create profiles with different locations - flush after each
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True,
            location="San Francisco",
            commitment_level="full-time"
        )
        db_session.add(profile1)
        db_session.flush()
        
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True,
            location="NYC",
            commitment_level="part-time"
        )
        db_session.add(profile2)
        db_session.flush()
        db_session.commit()
        
        # Browse with location filter
        response = client.get("/api/founder/people/browse?location=San Francisco", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Should filter by location
        sf_profiles = [p for p in data["profiles"] if p.get("location") == "San Francisco"]
        assert len(sf_profiles) > 0
    
    def test_browse_profiles_pagination(self, client, auth_headers, db_session, test_user):
        """Test browsing profiles with pagination"""
        from app.models.founder_profile import FounderProfile
        
        # Create a profile
        profile = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="Test User",
            is_public=True
        )
        db_session.add(profile)
        db_session.commit()
        
        response = client.get("/api/founder/people/browse?page=1&per_page=10", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["page"] == 1
        assert data["per_page"] == 10
    
    # ==================== Connection Endpoints ====================
    
    def test_create_connection_to_profile(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test creating connection to a profile"""
        from app.models.founder_profile import FounderProfile
        
        # Create profiles for both users - flush after each
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile2)
        db_session.flush()
        db_session.commit()
        
        response = client.post("/api/founder/connect",
            headers=auth_headers,
            json={
                "recipient_profile_id": profile2.id
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Connection request sent"
        assert "connection" in data
        assert data["connection"]["recipient_id"] == profile2.id
        assert data["connection"]["status"] == "pending"
    
    def test_create_connection_to_idea(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test creating connection to an idea listing"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_idea_listing import FounderIdeaListing
        
        # Create profiles
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        db_session.add(profile2)
        db_session.flush()
        
        # Create a listing
        listing = FounderIdeaListing(
            id=str(uuid.uuid4()),
            profile_id=profile2.id,
            title="Test Idea",
            is_active=True
        )
        db_session.add(listing)
        db_session.flush()
        db_session.commit()
        
        response = client.post("/api/founder/connect",
            headers=auth_headers,
            json={
                "idea_listing_id": listing.id
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["connection"]["idea_listing_id"] == listing.id
        assert data["connection"]["connection_type"] == "idea"
    
    def test_create_connection_missing_params(self, client, auth_headers):
        """Test creating connection without required params"""
        response = client.post("/api/founder/connect",
            headers=auth_headers,
            json={}
        )
        
        assert response.status_code == 400
    
    def test_get_connections(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test getting user connections"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_connection import FounderConnection
        
        # Create profiles
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        db_session.add(profile2)
        db_session.flush()
        
        # Create a connection
        connection = FounderConnection(
            id=str(uuid.uuid4()),
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.flush()
        db_session.commit()
        
        response = client.get("/api/founder/connections", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "sent" in data or "received" in data or "connections" in data
    
    def test_respond_to_connection_accept(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test accepting a connection request"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_connection import FounderConnection
        
        # Create profiles
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        db_session.add(profile2)
        db_session.flush()
        
        # Create a connection (profile2 receives from profile1)
        connection = FounderConnection(
            id=str(uuid.uuid4()),
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.commit()
        
        # Use profile2's auth (test_user_pro) to accept
        from app.services.auth_service import AuthService
        auth_service = AuthService(db_session)
        token = auth_service.create_access_token(data={"sub": test_user_pro.user_id})
        pro_headers = {"Authorization": f"Bearer {token}"}
        
        response = client.put(f"/api/founder/connections/{connection.id}/respond",
            headers=pro_headers,
            json={
                "action": "accept"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Connection accepted"
        assert data["connection"]["status"] == "accepted"
    
    def test_respond_to_connection_reject(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test rejecting a connection request"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_connection import FounderConnection
        
        # Create profiles
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        db_session.add(profile2)
        db_session.flush()
        
        # Create a connection
        connection = FounderConnection(
            id=str(uuid.uuid4()),
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.flush()
        db_session.commit()
        
        # Use profile2's auth to reject
        from app.services.auth_service import AuthService
        auth_service = AuthService(db_session)
        token = auth_service.create_access_token(data={"sub": test_user_pro.user_id})
        pro_headers = {"Authorization": f"Bearer {token}"}
        
        response = client.put(f"/api/founder/connections/{connection.id}/respond",
            headers=pro_headers,
            json={
                "action": "reject"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Connection rejected"
        assert data["connection"]["status"] == "rejected"
    
    def test_respond_to_connection_invalid_action(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test responding with invalid action"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_connection import FounderConnection
        
        # Create profiles
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        db_session.add(profile2)
        db_session.flush()
        
        # Create a connection
        connection = FounderConnection(
            id=str(uuid.uuid4()),
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.flush()
        db_session.commit()
        
        # Use profile2's auth
        from app.services.auth_service import AuthService
        auth_service = AuthService(db_session)
        token = auth_service.create_access_token(data={"sub": test_user_pro.user_id})
        pro_headers = {"Authorization": f"Bearer {token}"}
        
        response = client.put(f"/api/founder/connections/{connection.id}/respond",
            headers=pro_headers,
            json={
                "action": "invalid_action"
            }
        )
        
        assert response.status_code == 400
    
    def test_delete_connection(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test deleting a connection"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_connection import FounderConnection
        
        # Create profiles
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        db_session.add(profile2)
        db_session.flush()
        
        # Create a connection
        connection = FounderConnection(
            id=str(uuid.uuid4()),
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.flush()
        db_session.commit()
        
        # Delete connection (sender can delete)
        response = client.delete(f"/api/founder/connections/{connection.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Connection deleted successfully"
    
    def test_delete_connection_not_found(self, client, auth_headers):
        """Test deleting non-existent connection"""
        fake_id = str(uuid.uuid4())
        response = client.delete(f"/api/founder/connections/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_get_connection_detail(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test getting connection detail"""
        from app.models.founder_profile import FounderProfile
        from app.models.founder_connection import FounderConnection
        
        # Create profiles
        profile1 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            full_name="User 1",
            is_public=True
        )
        profile2 = FounderProfile(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            full_name="User 2",
            is_public=True
        )
        db_session.add(profile1)
        db_session.flush()
        db_session.add(profile2)
        db_session.flush()
        
        # Create a connection
        connection = FounderConnection(
            id=str(uuid.uuid4()),
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.flush()
        db_session.commit()
        
        response = client.get(f"/api/founder/connections/{connection.id}/detail", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "connection" in data
        assert data["connection"]["id"] == connection.id
        # Should include details
        assert "sender" in data["connection"] or "recipient" in data["connection"]
    
    def test_get_connection_detail_not_found(self, client, auth_headers):
        """Test getting non-existent connection detail"""
        fake_id = str(uuid.uuid4())
        response = client.get(f"/api/founder/connections/{fake_id}/detail", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_create_listing_without_profile(self, client, auth_headers):
        """Test creating listing without a profile (service auto-creates profile)"""
        response = client.post("/api/founder/ideas",
            headers=auth_headers,
            json={
                "title": "Test Idea"
            }
        )
        
        # Service auto-creates profile, so should succeed
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["listing"]["title"] == "Test Idea"

