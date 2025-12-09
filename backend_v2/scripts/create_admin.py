#!/usr/bin/env python
"""Script to create an admin user for testing"""
import sys
from app.core.database import SessionLocal
from app.services.auth_service import AuthService

if len(sys.argv) < 3:
    print("Usage: python scripts/create_admin.py <email> <password>")
    sys.exit(1)

email = sys.argv[1]
password = sys.argv[2]
db = SessionLocal()

try:
    auth_service = AuthService(db)
    
    # Check if user exists
    from app.models.user import User
    existing_user = db.query(User).filter(User.email == email).first()
    
    if existing_user:
        # Update to admin
        existing_user.role = "admin"
        if not existing_user.hashed_password:
            existing_user.hashed_password = auth_service.get_password_hash(password)
        db.commit()
        print(f"✅ User {email} updated to admin role")
    else:
        # Create new admin user
        user = auth_service.register_user(email, password)
        user.role = "admin"
        db.commit()
        print(f"✅ Admin user {email} created successfully")
    
    # Get token for immediate use
    user = auth_service.authenticate_user(email, password)
    if user:
        token = auth_service.create_access_token(data={"sub": user.user_id})
        print(f"\n🔑 Access Token:")
        print(token)
        print(f"\nUse this header in your requests:")
        print(f"Authorization: Bearer {token}")
    
except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    sys.exit(1)
finally:
    db.close()

