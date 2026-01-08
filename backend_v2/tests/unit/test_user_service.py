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
    
    def test_get_dashboard_data_empty(self, db_session, test_user):
        """Test getting dashboard data with no runs"""
        service = UserService(db_session)
        result = service.get_dashboard_data(test_user.user_id)
        
        assert result["success"] is True
        assert "dashboard" in result
        assert result["dashboard"]["total_runs"] == 0
        assert result["dashboard"]["completed_runs"] == 0
        assert result["dashboard"]["recent_runs"] == 0
    
    def test_get_dashboard_data_with_runs(self, db_session, test_user, test_run):
        """Test getting dashboard data with runs"""
        service = UserService(db_session)
        result = service.get_dashboard_data(test_user.user_id)
        
        assert result["success"] is True
        assert "dashboard" in result
        assert result["dashboard"]["total_runs"] >= 1
        assert result["dashboard"]["completed_runs"] >= 0
    
    def test_get_user_activity_empty(self, db_session, test_user):
        """Test getting user activity with no activities"""
        service = UserService(db_session)
        result = service.get_user_activity(test_user.user_id)
        
        assert result["success"] is True
        assert "activity" in result
        assert "runs" in result["activity"]
        assert "validations" in result["activity"]
        assert isinstance(result["activity"]["runs"], list)
        assert len(result["activity"]["runs"]) == 0
    
    def test_get_user_activity_with_runs(self, db_session, test_user, test_run):
        """Test getting user activity with runs"""
        service = UserService(db_session)
        result = service.get_user_activity(test_user.user_id)
        
        assert result["success"] is True
        assert "activity" in result
        assert "runs" in result["activity"]
        assert len(result["activity"]["runs"]) > 0
    
    def test_get_user_activity_with_limit(self, db_session, test_user, test_run):
        """Test getting user activity with custom limit"""
        service = UserService(db_session)
        result = service.get_user_activity(test_user.user_id, limit=1)
        
        assert result["success"] is True
        assert "activity" in result
        assert len(result["activity"]["runs"]) <= 1
    
    def test_compare_sessions_success(self, db_session, test_user, test_run):
        """Test comparing multiple sessions"""
        service = UserService(db_session)
        result = service.compare_sessions(
            user_id=test_user.user_id,
            run_ids=[test_run.run_id],
            validation_ids=[]
        )
        
        assert result["success"] is True
        assert "comparison" in result
        assert "runs" in result["comparison"]
        assert len(result["comparison"]["runs"]) == 1
        assert result["comparison"]["runs"][0]["run_id"] == test_run.run_id
    
    def test_compare_sessions_empty_run_ids(self, db_session, test_user):
        """Test comparing sessions with empty run_ids"""
        service = UserService(db_session)
        result = service.compare_sessions(
            user_id=test_user.user_id,
            run_ids=[],
            validation_ids=[]
        )
        
        assert result["success"] is True
        assert "comparison" in result
        assert len(result["comparison"]["runs"]) == 0
    
    def test_compare_sessions_invalid_run_id(self, db_session, test_user):
        """Test comparing sessions with invalid run_id"""
        import uuid
        service = UserService(db_session)
        result = service.compare_sessions(
            user_id=test_user.user_id,
            run_ids=[str(uuid.uuid4())],  # Valid UUID format but non-existent
            validation_ids=[]
        )
        
        assert result["success"] is True
        assert "comparison" in result
        # Should return empty runs list for invalid IDs
        assert len(result["comparison"]["runs"]) == 0
    
    def test_compare_sessions_multiple_runs(self, db_session, test_user, test_run):
        """Test comparing multiple runs"""
        from app.models.run import Run
        import uuid
        from datetime import datetime, timezone
        
        # Use existing test_run and create one additional run
        run2_id = str(uuid.uuid4())
        
        run2 = Run(
            run_id=run2_id,
            user_id=test_user.user_id,
            status="completed",
            inputs={"test": "data2"},
            reports={"test": "report2"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(run2)
        db_session.flush()  # Flush to get ID
        
        # Query using both test_run and the new run
        service = UserService(db_session)
        result = service.compare_sessions(
            user_id=test_user.user_id,
            run_ids=[test_run.run_id, run2_id],  # Use existing test_run and new run
            validation_ids=[]
        )
        
        assert result["success"] is True
        # Should find at least one run (test_run should exist)
        assert len(result["comparison"]["runs"]) >= 1
    
    def test_get_subscription_status_free_user(self, db_session, test_user):
        """Test getting subscription status for free user"""
        service = UserService(db_session)
        result = service.get_subscription_status(test_user.user_id)
        
        assert result["success"] is True
        assert "subscription" in result
        assert result["subscription"]["type"] == "free"
        assert result["subscription"]["is_active"] is False
    
    def test_get_subscription_status_pro_user(self, db_session, test_user_pro):
        """Test getting subscription status for pro user"""
        service = UserService(db_session)
        result = service.get_subscription_status(test_user_pro.user_id)
        
        assert result["success"] is True
        assert "subscription" in result
        assert result["subscription"]["type"] == "pro"
        assert result["subscription"]["is_active"] is True
    
    def test_get_subscription_status_user_not_found(self, db_session):
        """Test getting subscription status for non-existent user"""
        import uuid
        service = UserService(db_session)
        # Use valid UUID format
        fake_user_id = str(uuid.uuid4())
        result = service.get_subscription_status(fake_user_id)
        
        assert result["success"] is False
        assert "error" in result
    
    def test_activate_dev_subscription_success(self, db_session, test_user):
        """Test activating dev subscription"""
        service = UserService(db_session)
        result = service.activate_dev_subscription(
            user_id=test_user.user_id,
            subscription_type="starter"
        )
        
        assert result["success"] is True
        assert "subscription" in result
        assert result["subscription"]["type"] == "starter"
        assert result["subscription"]["is_active"] is True
    
    def test_activate_dev_subscription_invalid_type(self, db_session, test_user):
        """Test activating dev subscription with invalid type"""
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.activate_dev_subscription(
                user_id=test_user.user_id,
                subscription_type="invalid_type"
            )
        
        assert "Invalid subscription type" in str(exc_info.value)
    
    def test_activate_dev_subscription_user_not_found(self, db_session):
        """Test activating dev subscription for non-existent user"""
        import uuid
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.activate_dev_subscription(
                user_id=str(uuid.uuid4()),  # Valid UUID format but non-existent
                subscription_type="starter"
            )
        
        assert "User not found" in str(exc_info.value)
    
    def test_cancel_subscription_success(self, db_session, test_user_pro):
        """Test cancelling subscription"""
        service = UserService(db_session)
        result = service.cancel_subscription(test_user_pro.user_id)
        
        assert result["success"] is True
        assert "subscription" in result
        assert result["subscription"]["cancel_at_period_end"] is True
    
    def test_cancel_subscription_no_active_subscription(self, db_session, test_user):
        """Test cancelling subscription when user has no active subscription"""
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.cancel_subscription(test_user.user_id)
        
        assert "No active subscription" in str(exc_info.value)
    
    def test_cancel_subscription_user_not_found(self, db_session):
        """Test cancelling subscription for non-existent user"""
        import uuid
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.cancel_subscription(str(uuid.uuid4()))  # Valid UUID format but non-existent
        
        assert "User not found" in str(exc_info.value)
    
    def test_create_action_invalid_idea_id_format(self, db_session, test_user):
        """Test creating action with invalid idea_id format"""
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.create_action(
                user_id=test_user.user_id,
                idea_id="invalid-format",  # Missing ::idea_
                action_text="Test action"
            )
        
        assert "Invalid idea_id format" in str(exc_info.value)
    
    def test_create_action_empty_idea_id(self, db_session, test_user):
        """Test creating action with empty idea_id"""
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.create_action(
                user_id=test_user.user_id,
                idea_id="",  # Empty
                action_text="Test action"
            )
        
        assert "idea_id is required" in str(exc_info.value)
    
    def test_create_note_invalid_idea_id_format(self, db_session, test_user):
        """Test creating note with invalid idea_id format"""
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.create_note(
                user_id=test_user.user_id,
                idea_id="invalid-format",  # Missing ::idea_
                content="Test note"
            )
        
        assert "Invalid idea_id format" in str(exc_info.value)
    
    def test_get_user_notes_filtered_by_idea_id(self, db_session, test_user, test_note):
        """Test getting notes filtered by idea_id"""
        service = UserService(db_session)
        result = service.get_user_notes(
            user_id=test_user.user_id,
            idea_id=test_note.idea_id
        )
        
        assert result["success"] is True
        assert "notes" in result
        assert len(result["notes"]) > 0
        assert all(note["idea_id"] == test_note.idea_id for note in result["notes"])
    
    def test_get_user_notes_invalid_idea_id_format(self, db_session, test_user):
        """Test getting notes with invalid idea_id format"""
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.get_user_notes(
                user_id=test_user.user_id,
                idea_id="invalid-format"
            )
        
        assert "Invalid idea_id format" in str(exc_info.value)
    
    def test_update_action_not_found(self, db_session, test_user):
        """Test updating non-existent action"""
        import uuid
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.update_action(
                user_id=test_user.user_id,
                action_id=str(uuid.uuid4()),  # Valid UUID format but non-existent
                status="completed"
            )
        
        assert "Action not found" in str(exc_info.value)
    
    def test_delete_action_not_found(self, db_session, test_user):
        """Test deleting non-existent action"""
        import uuid
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.delete_action(
                user_id=test_user.user_id,
                action_id=str(uuid.uuid4())  # Valid UUID format but non-existent
            )
        
        assert "Action not found" in str(exc_info.value)
    
    def test_update_note_not_found(self, db_session, test_user):
        """Test updating non-existent note"""
        import uuid
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.update_note(
                user_id=test_user.user_id,
                note_id=str(uuid.uuid4()),  # Valid UUID format but non-existent
                content="Updated"
            )
        
        assert "Note not found" in str(exc_info.value)
    
    def test_delete_note_not_found(self, db_session, test_user):
        """Test deleting non-existent note"""
        import uuid
        service = UserService(db_session)
        
        with pytest.raises(ValueError) as exc_info:
            service.delete_note(
                user_id=test_user.user_id,
                note_id=str(uuid.uuid4())  # Valid UUID format but non-existent
            )
        
        assert "Note not found" in str(exc_info.value)

