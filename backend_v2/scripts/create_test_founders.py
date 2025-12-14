#!/usr/bin/env python3
"""Script to create test founder users with profiles"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.founder_profile import FounderProfile
from app.services.auth_service import AuthService
from app.services.founder_service import FounderService


def create_test_founder(email: str, password: str, full_name: str, create_profile: bool = True):
    """Create a test founder user with optional profile"""
    db: Session = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"⚠️  User with email '{email}' already exists!")
            print(f"   User ID: {existing_user.user_id}")
            
            # Check if profile exists
            if create_profile:
                profile = db.query(FounderProfile).filter(FounderProfile.user_id == existing_user.user_id).first()
                if profile:
                    print(f"   Profile already exists: {profile.id}")
                else:
                    print(f"   Creating profile...")
                    founder_service = FounderService(db)
                    profile = founder_service.get_or_create_profile(existing_user.user_id)
                    print(f"   ✅ Profile created: {profile.id}")
            
            return existing_user
        
        # Create user using AuthService (handles password hashing)
        auth_service = AuthService(db)
        user = auth_service.register_user(email=email, password=password)
        
        # Update full name if provided
        if full_name:
            user.full_name = full_name
            db.commit()
        
        print(f"✅ User created: {email} (ID: {user.user_id})")
        
        # Create founder profile
        if create_profile:
            founder_service = FounderService(db)
            profile = founder_service.get_or_create_profile(user.user_id)
            
            # Set some default profile data
            profile.full_name = full_name or email.split('@')[0]
            profile.bio = f"Test founder profile for {email}"
            profile.primary_skills = ["Product Development", "Business Strategy"]
            profile.industries_of_interest = ["SaaS", "E-commerce"]
            profile.looking_for = "Looking for co-founders and collaborators"
            profile.commitment_level = "full-time"
            profile.is_public = True
            db.commit()
            
            print(f"✅ Profile created: {profile.id}")
            print(f"   Public: {profile.is_public}")
        
        return user
        
    except ValueError as e:
        print(f"❌ Error: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return None
    finally:
        db.close()


def main():
    """Create 3 test founder accounts"""
    print("=" * 60)
    print("Creating Test Founder Accounts")
    print("=" * 60)
    print("")
    
    founders = [
        {"email": "test1@test1.com", "name": "Test Founder 1"},
        {"email": "test2@test2.com", "name": "Test Founder 2"},
        {"email": "test3@test3.com", "name": "Test Founder 3"},
    ]
    
    password = "1234"
    
    created_count = 0
    skipped_count = 0
    
    for founder in founders:
        print(f"\n--- Creating {founder['email']} ---")
        result = create_test_founder(
            email=founder['email'],
            password=password,
            full_name=founder['name'],
            create_profile=True
        )
        
        if result:
            created_count += 1
        else:
            skipped_count += 1
    
    print("")
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Created/Updated: {created_count} founders")
    print(f"⚠️  Skipped: {skipped_count} founders")
    print("")
    print("Login Credentials:")
    print("  Email: test1@test1.com, test2@test2.com, test3@test3.com")
    print("  Password: 1234")
    print("")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        traceback.print_exc()
        sys.exit(1)

