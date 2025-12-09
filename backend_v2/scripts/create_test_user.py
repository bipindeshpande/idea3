#!/usr/bin/env python3
"""Script to create a test user directly in the database"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.services.auth_service import AuthService
import uuid


def create_test_user(email: str, password: str):
    """Create a test user with the specified email and password"""
    db: Session = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ User with email '{email}' already exists!")
            print(f"   User ID: {existing_user.user_id}")
            return False
        
        # Create user using AuthService (handles password hashing)
        auth_service = AuthService(db)
        user = auth_service.register_user(email=email, password=password)
        
        print(f"✅ Test user created successfully!")
        print(f"")
        print(f"User Details:")
        print(f"  User ID: {user.user_id}")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.role}")
        print(f"  Subscription: {user.subscription_type}")
        print(f"")
        print(f"Login credentials:")
        print(f"  Email: {email}")
        print(f"  Password: {password}")
        
        return True
        
    except ValueError as e:
        print(f"❌ Error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Create a test user")
    parser.add_argument("--email", default="test@test.com", help="User email address")
    parser.add_argument("--password", default="1234", help="User password")
    parser.add_argument("--skip-validation", action="store_true", 
                       help="Skip email format validation (use with caution)")
    
    args = parser.parse_args()
    
    # Note: Email validation is enforced by Pydantic's EmailStr type
    # If you need to bypass it, you'd need to modify the User model
    # For now, we'll use the provided email and let validation handle it
    
    print("=== Creating Test User ===")
    print(f"Email: {args.email}")
    print(f"Password: {'*' * len(args.password)}")
    print("")
    
    success = create_test_user(args.email, args.password)
    
    if not success:
        sys.exit(1)

