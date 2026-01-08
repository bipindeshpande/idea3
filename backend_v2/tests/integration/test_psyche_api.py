"""Integration tests for Psyche API endpoints"""
import pytest
from app.models.psyche_profile import PsycheProfile


@pytest.mark.integration
@pytest.mark.api
class TestPsycheAPI:
    """Test psyche API endpoints"""
    
    def test_get_questions(self, client):
        """Test getting all questionnaire questions"""
        response = client.get("/api/psyche/questions")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "questions" in data
        assert "total" in data
        assert isinstance(data["questions"], list)
        assert len(data["questions"]) > 0
        assert data["total"] == len(data["questions"])
        
        # Check structure of first question
        question = data["questions"][0]
        assert "question_id" in question
        assert "text" in question
        assert "options" in question
        assert isinstance(question["options"], list)
        assert len(question["options"]) > 0
        
        # Check structure of first option
        option = question["options"][0]
        assert "id" in option
        assert "label" in option
    
    def test_submit_questionnaire_success(self, client, auth_headers, db_session):
        """Test submitting questionnaire successfully"""
        # Create valid answers (using actual question IDs from the scoring map)
        answers = {
            "Q1": "A",  # Explore multiple possibilities
            "Q2": "A",  # Speed and action
            "Q3": "A",  # Mastering skills
            "Q4": "A",  # Take calculated risks
            "Q5": "B",  # Independently
            "Q6": "A",  # Compare many options
            "Q7": "A",  # New ideas
            "Q8": "A",  # Stay calm
            "Q9": "B",  # Challenge ideas
            "Q10": "B",  # Flexibility
        }
        
        response = client.post("/api/psyche/submit",
            headers=auth_headers,
            json={
                "answers": answers,
                "optional_text": "Test optional text"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "profile" in data
        assert "message" in data
        assert "Profile saved successfully" in data["message"]
        
        # Check profile structure
        profile = data["profile"]
        assert "profile_id" in profile
        assert "user_id" in profile
        assert "personality" in profile
        assert "decision_style" in profile
        assert "motivation" in profile
        assert "confidence" in profile
        
        # Check personality structure
        personality = profile["personality"]
        assert "O" in personality  # Openness
        assert "C" in personality  # Conscientiousness
        assert "E" in personality  # Extraversion
        assert "A" in personality  # Agreeableness
        assert "N" in personality  # Neuroticism
        
        # Check decision_style structure
        decision_style = profile["decision_style"]
        assert "risk" in decision_style
        assert "speed_vs_certainty" in decision_style
        assert "maximize" in decision_style
        
        # Check motivation structure
        motivation = profile["motivation"]
        assert "autonomy" in motivation
        assert "mastery" in motivation
        assert "purpose" in motivation
        
        # Verify profile was saved in database
        db_profile = db_session.query(PsycheProfile).filter(
            PsycheProfile.user_id == profile["user_id"]
        ).first()
        assert db_profile is not None
        assert db_profile.optional_text == "Test optional text"
    
    def test_submit_questionnaire_minimal_answers(self, client, auth_headers, db_session):
        """Test submitting questionnaire with minimal answers"""
        answers = {
            "Q1": "A",
            "Q2": "B"
        }
        
        response = client.post("/api/psyche/submit",
            headers=auth_headers,
            json={"answers": answers}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "profile" in data
        
        # Profile should still be created with lower confidence
        profile = data["profile"]
        assert profile["confidence"] < 1.0  # Not all questions answered
    
    def test_submit_questionnaire_empty_answers(self, client, auth_headers):
        """Test submitting questionnaire with empty answers"""
        response = client.post("/api/psyche/submit",
            headers=auth_headers,
            json={"answers": {}}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "At least one answer is required" in data["detail"]
    
    def test_submit_questionnaire_no_answers_key(self, client, auth_headers):
        """Test submitting questionnaire without answers key"""
        response = client.post("/api/psyche/submit",
            headers=auth_headers,
            json={"optional_text": "Some text"}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_submit_questionnaire_unauthorized(self, client):
        """Test submitting questionnaire without authentication"""
        answers = {"Q1": "A", "Q2": "B"}
        
        response = client.post("/api/psyche/submit",
            json={"answers": answers}
        )
        
        assert response.status_code == 401
    
    def test_submit_questionnaire_update_existing(self, client, auth_headers, db_session, test_user):
        """Test that submitting again updates existing profile"""
        from app.services.psyche_scoring_service import PsycheScoringService
        
        # Create initial profile
        answers1 = {
            "Q1": "A",
            "Q2": "A",
            "Q3": "A"
        }
        
        response1 = client.post("/api/psyche/submit",
            headers=auth_headers,
            json={"answers": answers1}
        )
        
        assert response1.status_code == 200
        profile1 = response1.json()["profile"]
        profile_id = profile1["profile_id"]
        
        # Submit different answers
        answers2 = {
            "Q1": "B",  # Different answer
            "Q2": "B",
            "Q3": "B"
        }
        
        response2 = client.post("/api/psyche/submit",
            headers=auth_headers,
            json={"answers": answers2, "optional_text": "Updated text"}
        )
        
        assert response2.status_code == 200
        profile2 = response2.json()["profile"]
        
        # Should be the same profile_id (updated, not new)
        assert profile2["profile_id"] == profile_id
        
        # Verify update in database
        db_profile = db_session.query(PsycheProfile).filter(
            PsycheProfile.profile_id == profile_id
        ).first()
        assert db_profile.optional_text == "Updated text"
    
    def test_get_profile_success(self, client, auth_headers, db_session, test_user):
        """Test getting user's psyche profile when it exists"""
        from app.services.psyche_scoring_service import PsycheScoringService
        
        # Create a profile first
        scoring_service = PsycheScoringService(db_session)
        answers = {"Q1": "A", "Q2": "B", "Q3": "A"}
        scoring_service.save_profile(test_user.user_id, answers, "Test text")
        
        response = client.get("/api/psyche/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "profile" in data
        assert data["profile"] is not None
        assert "message" in data
        
        profile = data["profile"]
        assert "profile_id" in profile
        assert profile["user_id"] == test_user.user_id
        assert "personality" in profile
        assert "decision_style" in profile
        assert "motivation" in profile
    
    def test_get_profile_not_found(self, client, auth_headers):
        """Test getting profile when user has no profile"""
        response = client.get("/api/psyche/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["profile"] is None
        assert "message" in data
        assert "No profile found" in data["message"]
    
    def test_get_profile_unauthorized(self, client):
        """Test getting profile without authentication"""
        response = client.get("/api/psyche/profile")
        
        assert response.status_code == 401
    
    def test_get_profile_ai_success(self, client, auth_headers, db_session, test_user):
        """Test getting user's psyche profile formatted for AI"""
        from app.services.psyche_scoring_service import PsycheScoringService
        
        # Create a profile first
        scoring_service = PsycheScoringService(db_session)
        answers = {"Q1": "A", "Q2": "B", "Q3": "C", "Q4": "A"}
        scoring_service.save_profile(test_user.user_id, answers)
        
        response = client.get("/api/psyche/profile/ai", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "profile" in data
        assert data["profile"] is not None
        
        # AI format should not include raw_answers or metadata
        profile = data["profile"]
        assert "personality" in profile
        assert "decision_style" in profile
        assert "motivation" in profile
        assert "confidence" in profile
        # Should NOT have profile_id, user_id, raw_answers, etc.
        assert "profile_id" not in profile
        assert "user_id" not in profile
        assert "raw_answers" not in profile
        assert "created_at" not in profile
    
    def test_get_profile_ai_not_found(self, client, auth_headers):
        """Test getting AI-formatted profile when user has no profile"""
        response = client.get("/api/psyche/profile/ai", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["profile"] is None
        assert "No profile found" in data["message"]
    
    def test_get_profile_ai_unauthorized(self, client):
        """Test getting AI-formatted profile without authentication"""
        response = client.get("/api/psyche/profile/ai")
        
        assert response.status_code == 401
    
    def test_profile_scoring_values(self, client, auth_headers, db_session):
        """Test that profile scores are within valid ranges"""
        answers = {
            "Q1": "A",
            "Q2": "A",
            "Q3": "A",
            "Q4": "A",
            "Q5": "A",
            "Q6": "A",
            "Q7": "A",
            "Q8": "A",
            "Q9": "A",
            "Q10": "A",
            "Q11": "A",
            "Q12": "A",
        }
        
        response = client.post("/api/psyche/submit",
            headers=auth_headers,
            json={"answers": answers}
        )
        
        assert response.status_code == 200
        profile = response.json()["profile"]
        
        # Check personality scores are in [0, 1]
        personality = profile["personality"]
        for key in ["O", "C", "E", "A", "N"]:
            assert 0.0 <= personality[key] <= 1.0
        
        # Check decision_style scores are in [0, 1]
        decision_style = profile["decision_style"]
        for key in ["risk", "speed_vs_certainty", "maximize"]:
            assert 0.0 <= decision_style[key] <= 1.0
        
        # Check motivation scores are in [0, 1] and sum to ~1.0
        motivation = profile["motivation"]
        for key in ["autonomy", "mastery", "purpose"]:
            assert 0.0 <= motivation[key] <= 1.0
        
        motivation_sum = motivation["autonomy"] + motivation["mastery"] + motivation["purpose"]
        assert abs(motivation_sum - 1.0) < 0.01  # Allow small floating point errors
        
        # Check confidence is in [0, 1]
        assert 0.0 <= profile["confidence"] <= 1.0

