"""Pytest configuration and shared fixtures"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime, timezone
import uuid

# Set test environment
os.environ["TESTING"] = "1"

from app.core.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.run import Run
from app.models.validation import Validation
from app.models.action import Action
from app.models.note import Note
from app.services.auth_service import AuthService


# Test database setup - Use separate test database for isolation
# Default test database URL (can be overridden via TEST_DATABASE_URL env var)
from app.core.config import settings
from urllib.parse import urlparse, urlunparse

# Extract connection details from production database URL
# Default test database: startup_discovery_test
def get_test_db_url():
    """Construct test database URL from production URL"""
    parsed = urlparse(settings.DATABASE_URL)
    # Replace database name with test database name
    test_path = "/startup_discovery_test"
    test_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        test_path,
        parsed.params,
        parsed.query,
        parsed.fragment
    ))
    return test_url

default_test_db_url = get_test_db_url()

# Use TEST_DATABASE_URL if set, otherwise use default test database
SQLALCHEMY_TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", default_test_db_url)

# Ensure all models are imported so metadata is populated
from app.models import (
    User, Run, Validation, Action, Note, 
    FounderProfile, FounderIdeaListing, FounderConnection,
    FounderPsychology, PsycheProfile, SavedFramework,
    ContactSubmission, CacheEntry, DiscoveryResult,
    ErrorLog, RateLimitLog, LLMUsage
)

# Create engine - PostgreSQL doesn't need special handling
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    # PostgreSQL-specific settings
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create a connection and start a transaction
    connection = engine.connect()
    transaction = connection.begin()
    
    # Bind the session to this connection
    session = TestingSessionLocal(bind=connection)
    
    try:
        yield session
    except Exception:
        transaction.rollback()
        raise
    finally:
        # Always rollback the transaction to clean up test data
        transaction.rollback()
        session.close()
        connection.close()
        # Note: Transaction rollback ensures each test starts with a clean state


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    # TestClient takes app as positional argument
    test_client = TestClient(app)
    try:
        yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    auth_service = AuthService(db_session)
    # Use unique email per test to avoid conflicts
    import time
    unique_email = f"test_{int(time.time() * 1000000)}@example.com"
    user = User(
        user_id=str(uuid.uuid4()),
        email=unique_email,
        hashed_password=auth_service.get_password_hash("testpassword123"),
        is_active=True,
        subscription_type="free"
    )
    db_session.add(user)
    db_session.flush()  # Flush to get the ID, but don't commit (transaction will rollback)
    db_session.refresh(user)
    return user


@pytest.fixture
def test_user_pro(db_session):
    """Create a test user with pro subscription"""
    auth_service = AuthService(db_session)
    # Use unique email per test to avoid conflicts
    import time
    unique_email = f"pro_{int(time.time() * 1000000)}@example.com"
    user = User(
        user_id=str(uuid.uuid4()),
        email=unique_email,
        hashed_password=auth_service.get_password_hash("testpassword123"),
        is_active=True,
        subscription_type="pro"
    )
    db_session.add(user)
    db_session.flush()  # Flush to get the ID, but don't commit (transaction will rollback)
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user, db_session):
    """Get auth headers for test user"""
    from app.services.auth_service import AuthService
    
    # Create token using test session
    auth_service = AuthService(db_session)
    token = auth_service.create_access_token(data={"sub": test_user.user_id})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_run(db_session, test_user):
    """Create a test discovery run"""
    run = Run(
        run_id=str(uuid.uuid4()),
        user_id=test_user.user_id,
        status="completed",
        inputs={"interest_area": "AI", "goal_type": "startup"},
        reports={"personalized_recommendations": "Test recommendations"},
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(run)
    db_session.commit()
    db_session.refresh(run)
    return run


@pytest.fixture
def test_validation(db_session, test_user):
    """Create a test validation"""
    validation = Validation(
        validation_id=str(uuid.uuid4()),
        user_id=test_user.user_id,
        category_answers={},
        idea_explanation="Test idea",
        status="completed",
        validation_result={"overall_score": 8.5},
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(validation)
    db_session.commit()
    db_session.refresh(validation)
    return validation


@pytest.fixture
def test_action(db_session, test_user):
    """Create a test action"""
    action = Action(
        id=str(uuid.uuid4()),
        user_id=test_user.user_id,
        idea_id="test_run::idea_1",
        action_text="Test action",
        status="pending",
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(action)
    db_session.commit()
    db_session.refresh(action)
    return action


@pytest.fixture
def test_note(db_session, test_user):
    """Create a test note"""
    note = Note(
        id=str(uuid.uuid4()),
        user_id=test_user.user_id,
        idea_id="test_run::idea_1",
        content="Test note",
        created_at=datetime.now(timezone.utc)
    )
    db_session.add(note)
    db_session.commit()
    db_session.refresh(note)
    return note

