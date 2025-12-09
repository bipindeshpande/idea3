#!/usr/bin/env python
"""Script to set a user's role to admin"""
import sys
from app.core.database import SessionLocal
from app.models.user import User

if len(sys.argv) < 2:
    print("Usage: python scripts/set_admin.py <email>")
    sys.exit(1)

email = sys.argv[1]
db = SessionLocal()

try:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User with email {email} not found")
        sys.exit(1)
    
    user.role = "admin"
    db.commit()
    print(f"User {email} has been set to admin role")
except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    sys.exit(1)
finally:
    db.close()

