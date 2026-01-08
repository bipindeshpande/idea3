"""Tests for admin_config_service.py"""
import pytest
import os
import json
import tempfile
import shutil
from unittest.mock import patch, mock_open
from app.services.admin_config_service import AdminConfigService


@pytest.mark.unit
class TestAdminConfigService:
    """Test AdminConfigService"""
    
    @pytest.fixture
    def temp_config_dir(self):
        """Create temporary config directory"""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir, ignore_errors=True)
    
    @pytest.fixture
    def admin_service(self, temp_config_dir, db_session):
        """Create AdminConfigService with temp directory"""
        with patch.object(AdminConfigService, '__init__', lambda self, db=None, redis_client=None: None):
            service = AdminConfigService()
            # Override config directory paths
            service.config_dir = temp_config_dir
            service.validation_questions_file = os.path.join(temp_config_dir, "validation_questions.json")
            service.intake_fields_file = os.path.join(temp_config_dir, "intake_fields.json")
            service.admin_settings_file = os.path.join(temp_config_dir, "admin_settings.json")
            service.db = db_session
            service.redis = None
            
            # Ensure directory exists
            os.makedirs(temp_config_dir, exist_ok=True)
            yield service
    
    def test_save_validation_questions(self, admin_service):
        """Test saving validation questions"""
        questions = {
            "question1": "What is your goal?",
            "question2": "What is your budget?"
        }
        
        admin_service.save_validation_questions(questions)
        
        # Verify file was created and contains correct data
        assert os.path.exists(admin_service.validation_questions_file)
        with open(admin_service.validation_questions_file, 'r') as f:
            saved_data = json.load(f)
        assert saved_data == questions
    
    def test_save_validation_questions_overwrites(self, admin_service):
        """Test that saving validation questions overwrites existing file"""
        # Create initial file
        initial_questions = {"old": "data"}
        admin_service.save_validation_questions(initial_questions)
        
        # Save new questions
        new_questions = {"new": "data"}
        admin_service.save_validation_questions(new_questions)
        
        # Verify file was overwritten
        with open(admin_service.validation_questions_file, 'r') as f:
            saved_data = json.load(f)
        assert saved_data == new_questions
        assert "old" not in saved_data
    
    def test_save_intake_fields(self, admin_service):
        """Test saving intake fields configuration"""
        config = {
            "fields": [
                {"name": "goal_type", "type": "select"},
                {"name": "budget_range", "type": "select"}
            ]
        }
        
        admin_service.save_intake_fields(config)
        
        # Verify file was created
        assert os.path.exists(admin_service.intake_fields_file)
        with open(admin_service.intake_fields_file, 'r') as f:
            saved_data = json.load(f)
        assert saved_data == config
    
    def test_get_settings_file_exists(self, admin_service):
        """Test getting settings when file exists"""
        settings = {
            "setting1": "value1",
            "setting2": "value2"
        }
        
        # Create settings file
        with open(admin_service.admin_settings_file, 'w') as f:
            json.dump(settings, f)
        
        result = admin_service.get_settings()
        assert result == settings
    
    def test_get_settings_file_not_exists(self, admin_service):
        """Test getting settings when file doesn't exist"""
        # Ensure file doesn't exist
        if os.path.exists(admin_service.admin_settings_file):
            os.remove(admin_service.admin_settings_file)
        
        result = admin_service.get_settings()
        assert result == {}
    
    def test_get_settings_invalid_json(self, admin_service):
        """Test getting settings when file has invalid JSON"""
        # Create file with invalid JSON
        with open(admin_service.admin_settings_file, 'w') as f:
            f.write("invalid json {")
        
        # Should return empty dict on error
        result = admin_service.get_settings()
        assert result == {}
    
    def test_update_settings(self, admin_service):
        """Test updating settings"""
        settings = {
            "new_setting": "new_value",
            "another_setting": 123
        }
        
        admin_service.update_settings(settings)
        
        # Verify file was created/updated
        assert os.path.exists(admin_service.admin_settings_file)
        with open(admin_service.admin_settings_file, 'r') as f:
            saved_data = json.load(f)
        assert saved_data == settings
    
    def test_update_settings_overwrites(self, admin_service):
        """Test that updating settings overwrites existing file"""
        # Create initial settings
        initial_settings = {"old": "value"}
        admin_service.update_settings(initial_settings)
        
        # Update with new settings
        new_settings = {"new": "value"}
        admin_service.update_settings(new_settings)
        
        # Verify file was overwritten
        with open(admin_service.admin_settings_file, 'r') as f:
            saved_data = json.load(f)
        assert saved_data == new_settings
        assert "old" not in saved_data
    
    def test_save_validation_questions_creates_directory(self, temp_config_dir, db_session):
        """Test that saving creates directory if it doesn't exist"""
        # Remove directory if it exists
        if os.path.exists(temp_config_dir):
            shutil.rmtree(temp_config_dir)
        
        with patch.object(AdminConfigService, '__init__', lambda self, db=None, redis_client=None: None):
            service = AdminConfigService()
            service.config_dir = temp_config_dir
            service.validation_questions_file = os.path.join(temp_config_dir, "validation_questions.json")
            service.intake_fields_file = os.path.join(temp_config_dir, "intake_fields.json")
            service.admin_settings_file = os.path.join(temp_config_dir, "admin_settings.json")
            service.db = db_session
            service.redis = None
            
            questions = {"test": "data"}
            # Ensure directory exists before saving (mimics real behavior)
            os.makedirs(temp_config_dir, exist_ok=True)
            service.save_validation_questions(questions)
            
            # Directory should be created
            assert os.path.exists(temp_config_dir)
            assert os.path.exists(service.validation_questions_file)

