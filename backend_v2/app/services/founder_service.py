"""Founder network service for managing profiles, listings, and connections"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from sqlalchemy import func
from app.services.base_service import BaseService
from app.models.founder_profile import FounderProfile
from app.models.founder_idea_listing import FounderIdeaListing
from app.models.founder_connection import FounderConnection
from app.models.user import User


class FounderService(BaseService):
    """Service for founder network operations"""
    
    def get_or_create_profile(self, user_id: str) -> FounderProfile:
        """Get existing profile or create a new one for the user"""
        profile = self.db.query(FounderProfile).filter(
            FounderProfile.user_id == user_id
        ).first()
        
        if not profile:
            profile = FounderProfile(user_id=user_id, is_public=True)
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
        
        return profile
    
    def get_profile(self, user_id: str, include_private: bool = False) -> Optional[FounderProfile]:
        """Get profile for a user"""
        query = self.db.query(FounderProfile).filter(
            FounderProfile.user_id == user_id
        )
        
        if not include_private:
            query = query.filter(FounderProfile.is_public == True)
        
        return query.first()
    
    def update_profile(self, user_id: str, data: Dict[str, Any]) -> FounderProfile:
        """Update or create profile for a user"""
        profile = self.get_or_create_profile(user_id)
        
        # Update fields from data
        if "full_name" in data:
            profile.full_name = data["full_name"]
        if "bio" in data:
            profile.bio = data["bio"]
        if "location" in data:
            profile.location = data["location"]
        if "primary_skills" in data:
            profile.primary_skills = data["primary_skills"] if isinstance(data["primary_skills"], list) else []
        if "industries_of_interest" in data:
            profile.industries_of_interest = data["industries_of_interest"] if isinstance(data["industries_of_interest"], list) else []
        if "looking_for" in data:
            profile.looking_for = data["looking_for"]
        if "commitment_level" in data:
            profile.commitment_level = data["commitment_level"]
        if "experience_summary" in data:
            profile.experience_summary = data["experience_summary"]
        if "linkedin_url" in data:
            profile.linkedin_url = data["linkedin_url"]
        if "website_url" in data:
            profile.website_url = data["website_url"]
        if "is_public" in data:
            profile.is_public = bool(data["is_public"])
        
        self.db.commit()
        self.db.refresh(profile)
        return profile
    
    def get_user_listings(self, user_id: str) -> List[FounderIdeaListing]:
        """Get all idea listings for a user"""
        profile = self.get_profile(user_id, include_private=True)
        if not profile:
            return []
        
        return self.db.query(FounderIdeaListing).filter(
            FounderIdeaListing.profile_id == profile.id
        ).order_by(FounderIdeaListing.created_at.desc()).all()
    
    def create_listing(self, user_id: str, data: Dict[str, Any]) -> FounderIdeaListing:
        """Create a new idea listing"""
        profile = self.get_or_create_profile(user_id)
        
        listing = FounderIdeaListing(
            profile_id=profile.id,
            title=data.get("title", ""),
            brief_description=data.get("brief_description"),
            industry=data.get("industry"),
            stage=data.get("stage", "idea"),
            skills_needed=data.get("skills_needed", []) if isinstance(data.get("skills_needed"), list) else [],
            source_type=data.get("source_type"),
            source_id=data.get("source_id"),
            validation_score=data.get("validation_score"),
            is_active=True
        )
        
        self.db.add(listing)
        self.db.commit()
        self.db.refresh(listing)
        return listing
    
    def update_listing(self, listing_id: str, user_id: str, data: Dict[str, Any]) -> Optional[FounderIdeaListing]:
        """Update an existing listing (only if owned by user)"""
        profile = self.get_profile(user_id, include_private=True)
        if not profile:
            return None
        
        listing = self.db.query(FounderIdeaListing).filter(
            and_(
                FounderIdeaListing.id == listing_id,
                FounderIdeaListing.profile_id == profile.id
            )
        ).first()
        
        if not listing:
            return None
        
        # Update fields
        if "title" in data:
            listing.title = data["title"]
        if "brief_description" in data:
            listing.brief_description = data["brief_description"]
        if "industry" in data:
            listing.industry = data["industry"]
        if "stage" in data:
            listing.stage = data["stage"]
        if "skills_needed" in data:
            listing.skills_needed = data["skills_needed"] if isinstance(data["skills_needed"], list) else []
        if "is_active" in data:
            listing.is_active = bool(data["is_active"])
        
        self.db.commit()
        self.db.refresh(listing)
        return listing
    
    def browse_listings(self, filters: Dict[str, Any] = None, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Browse idea listings with filters"""
        filters = filters or {}
        
        query = self.db.query(FounderIdeaListing).join(FounderProfile).filter(
            and_(
                FounderIdeaListing.is_active == True,
                FounderProfile.is_public == True
            )
        )
        
        # Apply filters
        if filters.get("industry"):
            query = query.filter(FounderIdeaListing.industry.ilike(f"%{filters['industry']}%"))
        if filters.get("stage"):
            query = query.filter(FounderIdeaListing.stage == filters["stage"])
        if filters.get("skills_needed"):
            # PostgreSQL array contains check
            query = query.filter(
                FounderIdeaListing.skills_needed.contains([filters["skills_needed"]])
            )
        if filters.get("commitment_level"):
            query = query.filter(FounderProfile.commitment_level == filters["commitment_level"])
        if filters.get("location"):
            query = query.filter(FounderProfile.location.ilike(f"%{filters['location']}%"))
        
        # Get total count
        total = query.count()
        
        # Paginate
        listings = query.order_by(FounderIdeaListing.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        
        return {
            "listings": [listing.to_dict(include_founder=True) for listing in listings],
            "total": total,
            "page": page,
            "per_page": per_page
        }
    
    def browse_profiles(self, filters: Dict[str, Any] = None, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Browse founder profiles with filters"""
        filters = filters or {}
        
        query = self.db.query(FounderProfile).filter(
            FounderProfile.is_public == True
        )
        
        # Apply filters
        if filters.get("skills"):
            # PostgreSQL array contains check - handle string search
            skill_filter = filters["skills"]
            query = query.filter(
                func.array_to_string(FounderProfile.primary_skills, ',').ilike(f"%{skill_filter}%")
            )
        if filters.get("industries"):
            # PostgreSQL array contains check - handle string search
            industry_filter = filters["industries"]
            query = query.filter(
                func.array_to_string(FounderProfile.industries_of_interest, ',').ilike(f"%{industry_filter}%")
            )
        if filters.get("commitment_level"):
            query = query.filter(FounderProfile.commitment_level == filters["commitment_level"])
        if filters.get("location"):
            query = query.filter(FounderProfile.location.ilike(f"%{filters['location']}%"))
        
        # Get total count
        total = query.count()
        
        # Paginate
        profiles = query.order_by(FounderProfile.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        
        return {
            "profiles": [profile.to_dict(anonymize=True) for profile in profiles],
            "total": total,
            "page": page,
            "per_page": per_page
        }
    
    def create_connection(self, sender_user_id: str, recipient_profile_id: str = None, idea_listing_id: str = None) -> FounderConnection:
        """Create a connection request"""
        sender_profile = self.get_or_create_profile(sender_user_id)
        
        if not recipient_profile_id and not idea_listing_id:
            raise ValueError("Either recipient_profile_id or idea_listing_id must be provided")
        
        # If connecting to an idea, get the profile that owns it
        if idea_listing_id:
            listing = self.db.query(FounderIdeaListing).filter(
                FounderIdeaListing.id == idea_listing_id
            ).first()
            if not listing:
                raise ValueError("Idea listing not found")
            recipient_profile_id = listing.profile_id
            connection_type = "idea"
        else:
            connection_type = "profile"
            # Verify recipient profile exists
            recipient = self.db.query(FounderProfile).filter(
                FounderProfile.id == recipient_profile_id
            ).first()
            if not recipient:
                raise ValueError("Recipient profile not found")
        
        # Check if connection already exists
        existing = self.db.query(FounderConnection).filter(
            and_(
                FounderConnection.sender_id == sender_profile.id,
                or_(
                    FounderConnection.recipient_id == recipient_profile_id,
                    FounderConnection.idea_listing_id == idea_listing_id
                )
            )
        ).first()
        
        if existing:
            raise ValueError("Connection request already exists")
        
        connection = FounderConnection(
            sender_id=sender_profile.id,
            recipient_id=recipient_profile_id,
            idea_listing_id=idea_listing_id,
            connection_type=connection_type,
            status="pending"
        )
        
        self.db.add(connection)
        self.db.commit()
        self.db.refresh(connection)
        return connection
    
    def get_user_connections(self, user_id: str) -> Dict[str, Any]:
        """Get all connections for a user (sent and received)"""
        profile = self.get_profile(user_id, include_private=True)
        if not profile:
            return {
                "sent": [],
                "received": []
            }
        
        # Get sent connections - sender_id is profile.id
        sent = self.db.query(FounderConnection).filter(
            FounderConnection.sender_id == profile.id
        ).order_by(FounderConnection.created_at.desc()).all()
        
        # Get received connections - recipient_id is profile.id
        received = self.db.query(FounderConnection).filter(
            FounderConnection.recipient_id == profile.id
        ).order_by(FounderConnection.created_at.desc()).all()
        
        # Transform to include idea listing info if present
        sent_list = []
        for conn in sent:
            conn_dict = conn.to_dict()
            # Include idea listing title if present
            if conn.idea_listing:
                conn_dict["idea"] = {
                    "id": conn.idea_listing.id,
                    "title": conn.idea_listing.title
                }
            sent_list.append(conn_dict)
        
        received_list = []
        for conn in received:
            conn_dict = conn.to_dict()
            # Include sender profile info (anonymized)
            if conn.sender_profile:
                conn_dict["sender"] = conn.sender_profile.to_dict(anonymize=True)
            # Include idea listing if present
            if conn.idea_listing:
                conn_dict["idea"] = {
                    "id": conn.idea_listing.id,
                    "title": conn.idea_listing.title
                }
            received_list.append(conn_dict)
        
        return {
            "sent": sent_list,
            "received": received_list
        }
    
    def respond_to_connection(self, connection_id: str, user_id: str, action: str) -> Optional[FounderConnection]:
        """Respond to a connection request (accept/reject)"""
        profile = self.get_profile(user_id, include_private=True)
        if not profile:
            return None
        
        connection = self.db.query(FounderConnection).filter(
            and_(
                FounderConnection.id == connection_id,
                FounderConnection.recipient_id == profile.id,
                FounderConnection.status == "pending"
            )
        ).first()
        
        if not connection:
            return None
        
        if action == "accept":
            connection.status = "accepted"
        elif action == "reject":
            connection.status = "rejected"
        else:
            raise ValueError("Invalid action. Must be 'accept' or 'reject'")
        
        from datetime import datetime, timezone
        connection.responded_at = datetime.now(timezone.utc)
        
        self.db.commit()
        self.db.refresh(connection)
        return connection
    
    def delete_connection(self, connection_id: str, user_id: str) -> bool:
        """Delete/withdraw a connection (only if user is sender)"""
        profile = self.get_profile(user_id, include_private=True)
        if not profile:
            return False
        
        connection = self.db.query(FounderConnection).filter(
            and_(
                FounderConnection.id == connection_id,
                FounderConnection.sender_id == profile.id
            )
        ).first()
        
        if not connection:
            return False
        
        # If pending, mark as withdrawn; otherwise delete
        if connection.status == "pending":
            connection.status = "withdrawn"
            self.db.commit()
        else:
            self.db.delete(connection)
            self.db.commit()
        
        return True
    
    def get_connection_detail(self, connection_id: str, user_id: str) -> Optional[FounderConnection]:
        """Get connection details (only if user is participant)"""
        profile = self.get_profile(user_id, include_private=True)
        if not profile:
            return None
        
        connection = self.db.query(FounderConnection).filter(
            and_(
                FounderConnection.id == connection_id,
                or_(
                    FounderConnection.sender_id == profile.id,
                    FounderConnection.recipient_id == profile.id
                )
            )
        ).first()
        
        return connection

