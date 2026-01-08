"""Admin configuration service for managing config files"""
import os
import json
from typing import Dict, Any, Optional
from app.services.base_service import BaseService


class AdminConfigService(BaseService):
    """Service for managing admin configuration files"""
    
    def __init__(self, db=None, redis_client=None):
        super().__init__(db, redis_client)
        # Storage paths for admin config
        admin_config_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 
            "admin_config"
        )
        self.config_dir = admin_config_dir
        self.validation_questions_file = os.path.join(admin_config_dir, "validation_questions.json")
        self.intake_fields_file = os.path.join(admin_config_dir, "intake_fields.json")
        self.admin_settings_file = os.path.join(admin_config_dir, "admin_settings.json")
        
        # Ensure config directory exists
        os.makedirs(self.config_dir, exist_ok=True)
    
    def save_validation_questions(self, questions: Dict[str, Any]) -> None:
        """Save validation questions to JSON file"""
        with open(self.validation_questions_file, 'w') as f:
            json.dump(questions, f, indent=2)
    
    def save_intake_fields(self, config: Dict[str, Any]) -> None:
        """Save intake fields configuration to JSON file"""
        with open(self.intake_fields_file, 'w') as f:
            json.dump(config, f, indent=2)
    
    def get_settings(self) -> Dict[str, Any]:
        """Get system settings from file"""
        settings_dict = {}
        if os.path.exists(self.admin_settings_file):
            try:
                with open(self.admin_settings_file, 'r') as f:
                    settings_dict = json.load(f)
            except Exception:
                pass
        return settings_dict
    
    def update_settings(self, settings_dict: Dict[str, Any]) -> None:
        """Update system settings file"""
        with open(self.admin_settings_file, 'w') as f:
            json.dump(settings_dict, f, indent=2)

