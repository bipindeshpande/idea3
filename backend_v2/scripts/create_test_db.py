#!/usr/bin/env python3
"""Script to create the test database"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_test_database():
    """Create the test database"""
    # Extract connection details from production database URL
    # Format: postgresql://user:password@host:port/database
    db_url = settings.DATABASE_URL
    
    # Parse the URL to get components
    if db_url.startswith("postgresql://"):
        parts = db_url.replace("postgresql://", "").split("/")
        auth_and_host = parts[0]
        prod_db = parts[1] if len(parts) > 1 else "postgres"
        
        # Connect to postgres database to create test database
        postgres_url = f"postgresql://{auth_and_host}/postgres"
        test_db_name = "startup_discovery_test"
        
        print(f"Connecting to PostgreSQL...")
        print(f"Creating test database: {test_db_name}")
        
        try:
            # Connect to postgres database (not the app database)
            engine = create_engine(postgres_url, isolation_level="AUTOCOMMIT")
            
            with engine.connect() as conn:
                # Check if database already exists
                result = conn.execute(text(
                    "SELECT 1 FROM pg_database WHERE datname = :dbname"
                ), {"dbname": test_db_name})
                
                if result.fetchone():
                    print(f"✓ Database '{test_db_name}' already exists. Skipping creation.")
                else:
                    # Create the database
                    conn.execute(text(f'CREATE DATABASE "{test_db_name}"'))
                    print(f"✓ Database '{test_db_name}' created successfully!")
                
                # Grant privileges (need to connect as superuser or have privileges)
                try:
                    # Extract user from connection string
                    user = auth_and_host.split("@")[0].split(":")[0]
                    conn.execute(text(
                        f"GRANT ALL PRIVILEGES ON DATABASE \"{test_db_name}\" TO \"{user}\""
                    ))
                    print(f"✓ Privileges granted to user '{user}'")
                except Exception as e:
                    print(f"⚠ Warning: Could not grant privileges: {e}")
                    print("  You may need to grant privileges manually:")
                    print(f"  GRANT ALL PRIVILEGES ON DATABASE {test_db_name} TO {user};")
            
            # Connect to the new database to grant schema privileges
            test_db_url = f"postgresql://{auth_and_host}/{test_db_name}"
            test_engine = create_engine(test_db_url)
            
            with test_engine.connect() as conn:
                try:
                    user = auth_and_host.split("@")[0].split(":")[0]
                    conn.execute(text(f'GRANT ALL ON SCHEMA public TO "{user}"'))
                    conn.commit()
                    print(f"✓ Schema privileges granted")
                except Exception as e:
                    print(f"⚠ Warning: Could not grant schema privileges: {e}")
            
            print(f"\n✓ Test database setup complete!")
            print(f"  Database URL: {test_db_url}")
            return True
            
        except Exception as e:
            print(f"✗ Error creating database: {e}")
            print("\nAlternative: Create manually using SQL:")
            print(f"  CREATE DATABASE {test_db_name};")
            print(f"  GRANT ALL PRIVILEGES ON DATABASE {test_db_name} TO startup_discovery;")
            return False
    
    else:
        print(f"✗ Unsupported database URL format: {db_url}")
        return False

if __name__ == "__main__":
    success = create_test_database()
    sys.exit(0 if success else 1)

