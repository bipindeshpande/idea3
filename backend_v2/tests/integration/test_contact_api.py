"""Integration tests for Contact API endpoint"""
import pytest
from app.models.contact_submission import ContactSubmission


@pytest.mark.integration
@pytest.mark.api
class TestContactAPI:
    """Test contact API endpoint"""
    
    def test_submit_contact_success(self, client, db_session):
        """Test successful contact form submission"""
        response = client.post("/api/contact", json={
            "name": "John Doe",
            "email": "john.doe@example.com",
            "company": "Acme Corp",
            "topic": "General Inquiry",
            "message": "This is a test message for contact form submission."
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data
        assert "Thank you for your message" in data["message"]
        
        # Verify database persistence
        submission = db_session.query(ContactSubmission).filter(
            ContactSubmission.email == "john.doe@example.com"
        ).first()
        
        assert submission is not None
        assert submission.name == "John Doe"
        assert submission.email == "john.doe@example.com"
        assert submission.company == "Acme Corp"
        assert submission.topic == "General Inquiry"
        assert submission.message == "This is a test message for contact form submission."
        assert submission.status == "new"
        assert submission.id is not None
    
    def test_submit_contact_minimal_fields(self, client, db_session):
        """Test contact submission with only required fields"""
        response = client.post("/api/contact", json={
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "message": "Minimal contact message."
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify database persistence with optional fields as None
        submission = db_session.query(ContactSubmission).filter(
            ContactSubmission.email == "jane.smith@example.com"
        ).first()
        
        assert submission is not None
        assert submission.name == "Jane Smith"
        assert submission.email == "jane.smith@example.com"
        assert submission.company is None
        assert submission.topic is None
        assert submission.message == "Minimal contact message."
        assert submission.status == "new"
    
    def test_submit_contact_empty_optional_fields(self, client, db_session):
        """Test contact submission with empty optional fields"""
        response = client.post("/api/contact", json={
            "name": "Bob Johnson",
            "email": "bob.johnson@example.com",
            "company": "",
            "topic": "",
            "message": "Message with empty optional fields."
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify empty strings are converted to None
        submission = db_session.query(ContactSubmission).filter(
            ContactSubmission.email == "bob.johnson@example.com"
        ).first()
        
        assert submission is not None
        assert submission.company is None
        assert submission.topic is None
    
    def test_submit_contact_missing_name(self, client):
        """Test contact submission with missing name field"""
        response = client.post("/api/contact", json={
            "email": "test@example.com",
            "message": "Missing name field."
        })
        
        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "detail" in data
    
    def test_submit_contact_missing_email(self, client):
        """Test contact submission with missing email field"""
        response = client.post("/api/contact", json={
            "name": "Test User",
            "message": "Missing email field."
        })
        
        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "detail" in data
    
    def test_submit_contact_missing_message(self, client):
        """Test contact submission with missing message field"""
        response = client.post("/api/contact", json={
            "name": "Test User",
            "email": "test@example.com"
        })
        
        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "detail" in data
    
    def test_submit_contact_invalid_email(self, client):
        """Test contact submission with invalid email format"""
        response = client.post("/api/contact", json={
            "name": "Test User",
            "email": "invalid-email-format",
            "message": "Invalid email test."
        })
        
        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "detail" in data
    
    def test_submit_contact_empty_name(self, client, db_session):
        """Test contact submission with empty name (currently accepted by Pydantic)"""
        response = client.post("/api/contact", json={
            "name": "",
            "email": "empty.name@example.com",
            "message": "Empty name test."
        })
        
        # Note: Pydantic accepts empty strings for str fields without min_length constraint
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify empty name is stored
        submission = db_session.query(ContactSubmission).filter(
            ContactSubmission.email == "empty.name@example.com"
        ).first()
        assert submission.name == ""
    
    def test_submit_contact_empty_message(self, client, db_session):
        """Test contact submission with empty message (currently accepted by Pydantic)"""
        response = client.post("/api/contact", json={
            "name": "Test User",
            "email": "empty.message@example.com",
            "message": ""
        })
        
        # Note: Pydantic accepts empty strings for str fields without min_length constraint
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Verify empty message is stored
        submission = db_session.query(ContactSubmission).filter(
            ContactSubmission.email == "empty.message@example.com"
        ).first()
        assert submission.message == ""
    
    def test_submit_contact_multiple_submissions(self, client, db_session):
        """Test multiple contact submissions from same email"""
        # First submission
        response1 = client.post("/api/contact", json={
            "name": "Repeat User",
            "email": "repeat@example.com",
            "message": "First message."
        })
        assert response1.status_code == 200
        
        # Second submission from same email
        response2 = client.post("/api/contact", json={
            "name": "Repeat User",
            "email": "repeat@example.com",
            "message": "Second message."
        })
        assert response2.status_code == 200
        
        # Verify both submissions are in database
        submissions = db_session.query(ContactSubmission).filter(
            ContactSubmission.email == "repeat@example.com"
        ).all()
        
        assert len(submissions) == 2
        assert submissions[0].message == "First message."
        assert submissions[1].message == "Second message."

