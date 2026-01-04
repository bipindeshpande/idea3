"""Unit tests for UserService"""
import pytest
from app.services.user_service import UserService
from datetime import datetime, timezone
import json


@pytest.mark.unit
class TestUserService:
    """Test UserService methods"""
    
    def test_get_smart_recommendations_empty(self, db_session, test_user):
        """Test smart recommendations with no validations"""
        service = UserService(db_session)
        result = service.get_smart_recommendations(test_user.user_id)
        
        assert result["success"] is True
        assert result["insights"]["similar_ideas"] == []
    
    def test_get_smart_recommendations_with_validations(self, db_session, test_user, test_validation):
        """Test smart recommendations with high-scoring validations"""
        service = UserService(db_session)
        result = service.get_smart_recommendations(test_user.user_id)
        
        assert result["success"] is True
        assert len(result["insights"]["similar_ideas"]) > 0
        assert result["insights"]["similar_ideas"][0]["score"] >= 7.0
    
    def test_create_action(self, db_session, test_user):
        """Test creating an action"""
        service = UserService(db_session)
        result = service.create_action(
            user_id=test_user.user_id,
            idea_id="test_run::idea_1",
            action_text="Test action",
            status="pending"
        )
        
        assert result["success"] is True
        assert "action" in result
        assert result["action"]["action_text"] == "Test action"
        assert result["action"]["idea_id"] == "test_run::idea_1"
    
    def test_update_action(self, db_session, test_user, test_action):
        """Test updating an action"""
        service = UserService(db_session)
        result = service.update_action(
            user_id=test_user.user_id,
            action_id=test_action.id,
            status="completed"
        )
        
        assert result["success"] is True
        assert result["action"]["status"] == "completed"
    
    def test_delete_action(self, db_session, test_user, test_action):
        """Test deleting an action"""
        service = UserService(db_session)
        result = service.delete_action(
            user_id=test_user.user_id,
            action_id=test_action.id
        )
        
        assert result["success"] is True
        
        # Verify it's deleted
        from app.models.action import Action
        action = db_session.query(Action).filter(
            Action.id == test_action.id
        ).first()
        assert action is None
    
    def test_create_note(self, db_session, test_user):
        """Test creating a note"""
        service = UserService(db_session)
        result = service.create_note(
            user_id=test_user.user_id,
            idea_id="test_run::idea_1",
            content="Test note",
            tags=["tag1", "tag2"]
        )
        
        assert result["success"] is True
        assert "note" in result
        assert result["note"]["content"] == "Test note"
        assert result["note"]["tags"] == ["tag1", "tag2"]
    
    def test_update_note(self, db_session, test_user, test_note):
        """Test updating a note"""
        service = UserService(db_session)
        result = service.update_note(
            user_id=test_user.user_id,
            note_id=test_note.id,
            content="Updated note",
            tags=["updated"]
        )
        
        assert result["success"] is True
        assert result["note"]["content"] == "Updated note"
        assert result["note"]["tags"] == ["updated"]
    
    def test_delete_note(self, db_session, test_user, test_note):
        """Test deleting a note"""
        service = UserService(db_session)
        result = service.delete_note(
            user_id=test_user.user_id,
            note_id=test_note.id
        )
        
        assert result["success"] is True
        
        # Verify it's deleted
        from app.models.note import Note
        note = db_session.query(Note).filter(
            Note.id == test_note.id
        ).first()
        assert note is None

