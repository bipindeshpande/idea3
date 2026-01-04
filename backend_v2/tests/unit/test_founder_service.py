"""Unit tests for FounderService"""
import pytest
import uuid
from datetime import datetime, timezone

from app.services.founder_service import FounderService
from app.models.founder_profile import FounderProfile
from app.models.founder_idea_listing import FounderIdeaListing
from app.models.founder_connection import FounderConnection
from app.models.user import User


@pytest.mark.unit
class TestFounderService:
    """Test founder service operations"""
    
    @pytest.fixture
    def founder_service(self, db_session):
        """Create founder service instance"""
        return FounderService(db_session)
    
    # Use test_user and test_user_pro fixtures from conftest instead
    # They provide unique users per test with proper transaction handling
    
    def test_get_or_create_profile_new(self, founder_service, test_user):
        """Test creating new profile"""
        profile = founder_service.get_or_create_profile(test_user.user_id)
        
        assert profile is not None
        assert profile.user_id == test_user.user_id
        assert profile.is_public is True
    
    def test_get_or_create_profile_existing(self, founder_service, test_user, db_session):
        """Test getting existing profile"""
        # Create profile first
        existing_profile = FounderProfile(
            user_id=test_user.user_id,
            full_name="Existing User",
            is_public=True
        )
        db_session.add(existing_profile)
        db_session.commit()
        
        profile = founder_service.get_or_create_profile(test_user.user_id)
        
        assert profile.id == existing_profile.id
        assert profile.full_name == "Existing User"
    
    def test_get_profile_public(self, founder_service, test_user, db_session):
        """Test getting public profile"""
        profile = FounderProfile(
            user_id=test_user.user_id,
            full_name="Public User",
            is_public=True
        )
        db_session.add(profile)
        db_session.commit()
        
        result = founder_service.get_profile(test_user.user_id)
        
        assert result is not None
        assert result.full_name == "Public User"
    
    def test_get_profile_private_excluded(self, founder_service, test_user, db_session):
        """Test that private profiles are excluded by default"""
        profile = FounderProfile(
            user_id=test_user.user_id,
            full_name="Private User",
            is_public=False
        )
        db_session.add(profile)
        db_session.commit()
        
        result = founder_service.get_profile(test_user.user_id)
        
        assert result is None
    
    def test_get_profile_private_included(self, founder_service, test_user, db_session):
        """Test getting private profile with include_private=True"""
        profile = FounderProfile(
            user_id=test_user.user_id,
            full_name="Private User",
            is_public=False
        )
        db_session.add(profile)
        db_session.commit()
        
        result = founder_service.get_profile(test_user.user_id, include_private=True)
        
        assert result is not None
        assert result.full_name == "Private User"
    
    def test_update_profile_create(self, founder_service, test_user):
        """Test updating profile creates new one if doesn't exist"""
        data = {
            "full_name": "New User",
            "bio": "Test bio",
            "location": "San Francisco"
        }
        
        profile = founder_service.update_profile(test_user.user_id, data)
        
        assert profile is not None
        assert profile.full_name == "New User"
        assert profile.bio == "Test bio"
        assert profile.location == "San Francisco"
    
    def test_update_profile_update(self, founder_service, test_user, db_session):
        """Test updating existing profile"""
        existing = FounderProfile(
            user_id=test_user.user_id,
            full_name="Old Name",
            is_public=True
        )
        db_session.add(existing)
        db_session.commit()
        
        data = {
            "full_name": "New Name",
            "bio": "Updated bio"
        }
        
        profile = founder_service.update_profile(test_user.user_id, data)
        
        assert profile.full_name == "New Name"
        assert profile.bio == "Updated bio"
    
    def test_update_profile_list_fields(self, founder_service, test_user):
        """Test updating list fields"""
        data = {
            "primary_skills": ["Python", "JavaScript"],
            "industries_of_interest": ["AI", "SaaS"]
        }
        
        profile = founder_service.update_profile(test_user.user_id, data)
        
        assert profile.primary_skills == ["Python", "JavaScript"]
        assert profile.industries_of_interest == ["AI", "SaaS"]
    
    def test_update_profile_list_fields_non_list(self, founder_service, test_user):
        """Test that non-list values are converted to empty list"""
        data = {
            "primary_skills": "not a list"
        }
        
        profile = founder_service.update_profile(test_user.user_id, data)
        
        assert profile.primary_skills == []
    
    def test_update_profile_is_public(self, founder_service, test_user):
        """Test updating is_public field"""
        data = {"is_public": False}
        
        profile = founder_service.update_profile(test_user.user_id, data)
        
        assert profile.is_public is False
    
    def test_get_user_listings_empty(self, founder_service, test_user):
        """Test getting listings when none exist"""
        listings = founder_service.get_user_listings(test_user.user_id)
        
        assert listings == []
    
    def test_get_user_listings_with_listings(self, founder_service, test_user, db_session):
        """Test getting user listings"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        listing1 = FounderIdeaListing(
            profile_id=profile.id,
            title="Idea 1",
            is_active=True
        )
        listing2 = FounderIdeaListing(
            profile_id=profile.id,
            title="Idea 2",
            is_active=True
        )
        db_session.add(listing1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(listing2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.commit()
        
        listings = founder_service.get_user_listings(test_user.user_id)
        
        assert len(listings) == 2
        # Should be ordered by created_at desc (but timestamps might be identical, so just check both are present)
        titles = [l.title for l in listings]
        assert "Idea 1" in titles
        assert "Idea 2" in titles
    
    def test_create_listing(self, founder_service, test_user):
        """Test creating a listing"""
        data = {
            "title": "New Idea",
            "brief_description": "Test description",
            "industry": "AI",
            "stage": "idea"
        }
        
        listing = founder_service.create_listing(test_user.user_id, data)
        
        assert listing is not None
        assert listing.title == "New Idea"
        assert listing.brief_description == "Test description"
        assert listing.industry == "AI"
        assert listing.stage == "idea"
        assert listing.is_active is True
    
    def test_create_listing_auto_creates_profile(self, founder_service, test_user):
        """Test that creating listing auto-creates profile"""
        data = {"title": "Test Idea"}
        
        listing = founder_service.create_listing(test_user.user_id, data)
        
        assert listing is not None
        # Profile should have been created
        profile = founder_service.get_profile(test_user.user_id, include_private=True)
        assert profile is not None
    
    def test_get_listing_by_id_owner(self, founder_service, test_user, db_session):
        """Test getting listing by ID as owner"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        listing = FounderIdeaListing(
            profile_id=profile.id,
            title="Test Idea",
            is_active=True
        )
        db_session.add(listing)
        db_session.commit()
        
        result = founder_service.get_listing(listing.id, user_id=test_user.user_id)
        
        assert result is not None
        assert result.id == listing.id
    
    def test_get_listing_by_id_public(self, founder_service, test_user, test_user_pro, db_session):
        """Test getting public listing"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        listing = FounderIdeaListing(
            profile_id=profile.id,
            title="Public Idea",
            is_active=True
        )
        db_session.add(listing)
        db_session.commit()
        
        result = founder_service.get_listing(listing.id, user_id=test_user_pro.user_id)
        
        assert result is not None
        assert result.id == listing.id
    
    def test_get_listing_inactive(self, founder_service, test_user, test_user_pro, db_session):
        """Test that inactive listings are not returned"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        listing = FounderIdeaListing(
            profile_id=profile.id,
            title="Inactive Idea",
            is_active=False
        )
        db_session.add(listing)
        db_session.commit()
        
        result = founder_service.get_listing(listing.id, user_id=test_user_pro.user_id)
        
        assert result is None
    
    def test_update_listing(self, founder_service, test_user, db_session):
        """Test updating listing"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        listing = FounderIdeaListing(
            profile_id=profile.id,
            title="Original Title",
            industry="Tech"
        )
        db_session.add(listing)
        db_session.commit()
        
        data = {
            "title": "Updated Title",
            "industry": "AI"
        }
        
        result = founder_service.update_listing(listing.id, test_user.user_id, data)
        
        assert result is not None
        assert result.title == "Updated Title"
        assert result.industry == "AI"
    
    def test_update_listing_not_owner(self, founder_service, test_user, test_user_pro, db_session):
        """Test that non-owners cannot update listing"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        listing = FounderIdeaListing(
            profile_id=profile.id,
            title="Original Title"
        )
        db_session.add(listing)
        db_session.commit()
        
        result = founder_service.update_listing(listing.id, test_user_pro.user_id, {"title": "Hacked"})
        
        assert result is None
    
    def test_browse_listings_basic(self, founder_service, test_user, db_session):
        """Test browsing listings"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        listing = FounderIdeaListing(
            profile_id=profile.id,
            title="Public Idea",
            is_active=True
        )
        db_session.add(listing)
        db_session.commit()
        
        result = founder_service.browse_listings()
        
        assert "listings" in result
        assert "total" in result
        assert result["total"] >= 1
    
    def test_browse_listings_filter_industry(self, founder_service, test_user, db_session):
        """Test filtering listings by industry"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        listing = FounderIdeaListing(
            profile_id=profile.id,
            title="AI Idea",
            industry="AI",
            is_active=True
        )
        db_session.add(listing)
        db_session.commit()
        
        result = founder_service.browse_listings(filters={"industry": "AI"})
        
        assert result["total"] >= 1
        assert any(l["industry"] == "AI" for l in result["listings"])
    
    def test_browse_listings_pagination(self, founder_service, test_user, db_session):
        """Test listing pagination"""
        profile = FounderProfile(user_id=test_user.user_id, is_public=True)
        db_session.add(profile)
        db_session.flush()
        
        # Create multiple listings
        for i in range(5):
            listing = FounderIdeaListing(
                profile_id=profile.id,
                title=f"Idea {i}",
                is_active=True
            )
            db_session.add(listing)
            db_session.flush()  # Flush after each to avoid bulk insert UUID issues
        db_session.commit()
        
        result = founder_service.browse_listings(page=1, per_page=2)
        
        assert len(result["listings"]) <= 2
        assert result["page"] == 1
        assert result["per_page"] == 2
    
    def test_browse_profiles_basic(self, founder_service, test_user, db_session):
        """Test browsing profiles"""
        profile = FounderProfile(
            user_id=test_user.user_id,
            full_name="Public User",
            is_public=True
        )
        db_session.add(profile)
        db_session.commit()
        
        result = founder_service.browse_profiles()
        
        assert "profiles" in result
        assert "total" in result
        assert result["total"] >= 1
    
    def test_browse_profiles_filter_location(self, founder_service, test_user, db_session):
        """Test filtering profiles by location"""
        profile = FounderProfile(
            user_id=test_user.user_id,
            location="San Francisco",
            is_public=True
        )
        db_session.add(profile)
        db_session.commit()
        
        result = founder_service.browse_profiles(filters={"location": "San Francisco"})
        
        assert result["total"] >= 1
    
    def test_create_connection_to_profile(self, founder_service, test_user, test_user_pro, db_session):
        """Test creating connection to profile"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.commit()
        
        connection = founder_service.create_connection(
            sender_user_id=test_user.user_id,
            recipient_profile_id=profile2.id
        )
        
        assert connection is not None
        assert connection.sender_id == profile1.id
        assert connection.recipient_id == profile2.id
        assert connection.connection_type == "profile"
        assert connection.status == "pending"
    
    def test_create_connection_to_idea(self, founder_service, test_user, test_user_pro, db_session):
        """Test creating connection to idea listing"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        
        listing = FounderIdeaListing(
            profile_id=profile2.id,
            title="Test Idea",
            is_active=True
        )
        db_session.add(listing)
        db_session.commit()
        
        connection = founder_service.create_connection(
            sender_user_id=test_user.user_id,
            idea_listing_id=listing.id
        )
        
        assert connection is not None
        assert connection.idea_listing_id == listing.id
        assert connection.connection_type == "idea"
    
    def test_create_connection_missing_params(self, founder_service, test_user):
        """Test creating connection without required params"""
        with pytest.raises(ValueError, match="Either recipient_profile_id or idea_listing_id"):
            founder_service.create_connection(test_user.user_id)
    
    def test_create_connection_duplicate(self, founder_service, test_user, test_user_pro, db_session):
        """Test that duplicate connections are rejected"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.commit()
        
        # Create first connection
        founder_service.create_connection(
            sender_user_id=test_user.user_id,
            recipient_profile_id=profile2.id
        )
        
        # Try to create duplicate
        with pytest.raises(ValueError, match="already exists"):
            founder_service.create_connection(
                sender_user_id=test_user.user_id,
                recipient_profile_id=profile2.id
            )
    
    def test_get_user_connections(self, founder_service, test_user, test_user_pro, db_session):
        """Test getting user connections"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.commit()
        
        # Create connection
        connection = FounderConnection(
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.commit()
        
        result = founder_service.get_user_connections(test_user.user_id)
        
        assert "sent" in result
        assert "received" in result
        assert len(result["sent"]) == 1
    
    def test_respond_to_connection_accept(self, founder_service, test_user, test_user_pro, db_session):
        """Test accepting connection"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        
        connection = FounderConnection(
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.commit()
        
        result = founder_service.respond_to_connection(
            connection.id,
            test_user_pro.user_id,
            "accept"
        )
        
        assert result is not None
        assert result.status == "accepted"
    
    def test_respond_to_connection_reject(self, founder_service, test_user, test_user_pro, db_session):
        """Test rejecting connection"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        
        connection = FounderConnection(
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.commit()
        
        result = founder_service.respond_to_connection(
            connection.id,
            test_user_pro.user_id,
            "reject"
        )
        
        assert result is not None
        assert result.status == "rejected"
    
    def test_respond_to_connection_invalid_action(self, founder_service, test_user, test_user_pro, db_session):
        """Test responding with invalid action"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        
        connection = FounderConnection(
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.commit()
        
        with pytest.raises(ValueError, match="Invalid action"):
            founder_service.respond_to_connection(
                connection.id,
                test_user_pro.user_id,
                "invalid"
            )
    
    def test_delete_connection(self, founder_service, test_user, test_user_pro, db_session):
        """Test deleting connection"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        
        connection = FounderConnection(
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.commit()
        
        result = founder_service.delete_connection(connection.id, test_user.user_id)
        
        assert result is True
        # Check it's marked as withdrawn
        db_session.refresh(connection)
        assert connection.status == "withdrawn"
    
    def test_get_connection_detail(self, founder_service, test_user, test_user_pro, db_session):
        """Test getting connection detail"""
        profile1 = FounderProfile(user_id=test_user.user_id, is_public=True)
        profile2 = FounderProfile(user_id=test_user_pro.user_id, is_public=True)
        db_session.add(profile1)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        db_session.add(profile2)
        db_session.flush()  # Flush to avoid bulk insert UUID issues
        
        connection = FounderConnection(
            sender_id=profile1.id,
            recipient_id=profile2.id,
            connection_type="profile",
            status="pending"
        )
        db_session.add(connection)
        db_session.commit()
        
        result = founder_service.get_connection_detail(connection.id, test_user.user_id)
        
        assert result is not None
        assert result.id == connection.id

