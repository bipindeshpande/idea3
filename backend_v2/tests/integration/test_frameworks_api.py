"""Integration tests for Frameworks API endpoints"""
import pytest
import uuid
from datetime import datetime, timezone


@pytest.mark.integration
@pytest.mark.api
class TestFrameworksAPI:
    """Test frameworks API endpoints"""
    
    # ==================== Create Framework ====================
    
    def test_create_framework_success(self, client, auth_headers):
        """Test creating a framework successfully"""
        response = client.post("/api/frameworks",
            headers=auth_headers,
            json={
                "framework_template_id": 1,
                "title": "My Business Plan",
                "customized_content": "# Business Plan\n\n## Overview\nTest content"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "framework" in data
        assert data["framework"]["title"] == "My Business Plan"
        assert data["framework"]["framework_template_id"] == 1
        assert data["framework"]["status"] in ["draft", "in_progress"]
    
    def test_create_framework_with_metadata(self, client, auth_headers):
        """Test creating framework with metadata"""
        response = client.post("/api/frameworks",
            headers=auth_headers,
            json={
                "framework_template_id": 2,
                "title": "Test Framework",
                "customized_content": "Test content",
                "metadata": {
                    "tags": ["startup", "planning"],
                    "priority": "high"
                }
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "metadata" in data["framework"]
        assert data["framework"]["metadata"]["tags"] == ["startup", "planning"]
    
    def test_create_framework_with_linked_idea(self, client, auth_headers, test_run):
        """Test creating framework with linked idea_id"""
        response = client.post("/api/frameworks",
            headers=auth_headers,
            json={
                "framework_template_id": 1,
                "title": "Linked Framework",
                "customized_content": "Content",
                "linked_idea_id": f"{test_run.run_id}::idea_1"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["framework"]["linked_idea_id"] == f"{test_run.run_id}::idea_1"
    
    def test_create_framework_with_linked_validation(self, client, auth_headers, test_validation):
        """Test creating framework with linked validation_id"""
        response = client.post("/api/frameworks",
            headers=auth_headers,
            json={
                "framework_template_id": 1,
                "title": "Validation Framework",
                "customized_content": "Content",
                "linked_validation_id": test_validation.validation_id
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["framework"]["linked_validation_id"] == test_validation.validation_id
    
    def test_create_framework_without_auth(self, client):
        """Test creating framework without authentication"""
        response = client.post("/api/frameworks",
            json={
                "framework_template_id": 1,
                "title": "Test",
                "customized_content": "Content"
            }
        )
        
        assert response.status_code == 401
    
    def test_create_framework_missing_required_fields(self, client, auth_headers):
        """Test creating framework with missing required fields"""
        # Missing title
        response = client.post("/api/frameworks",
            headers=auth_headers,
            json={
                "framework_template_id": 1,
                "customized_content": "Content"
            }
        )
        
        assert response.status_code == 422  # Validation error
        
        # Missing customized_content
        response = client.post("/api/frameworks",
            headers=auth_headers,
            json={
                "framework_template_id": 1,
                "title": "Test"
            }
        )
        
        assert response.status_code == 422
    
    def test_create_framework_invalid_template_id(self, client, auth_headers):
        """Test creating framework with invalid template_id (should still work, just uses the ID)"""
        # The service doesn't validate template_id exists, so this should work
        response = client.post("/api/frameworks",
            headers=auth_headers,
            json={
                "framework_template_id": 99999,
                "title": "Test",
                "customized_content": "Content"
            }
        )
        
        # Should succeed (service doesn't validate template existence)
        assert response.status_code == 201
    
    # ==================== List Frameworks ====================
    
    def test_list_frameworks_empty(self, client, auth_headers):
        """Test listing frameworks when none exist"""
        response = client.get("/api/frameworks", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["frameworks"] == []
    
    def test_list_frameworks_after_create(self, client, auth_headers):
        """Test listing frameworks after creating one"""
        # Create a framework
        create_response = client.post("/api/frameworks",
            headers=auth_headers,
            json={
                "framework_template_id": 1,
                "title": "Test Framework",
                "customized_content": "Content"
            }
        )
        assert create_response.status_code == 201
        
        # List frameworks
        response = client.get("/api/frameworks", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["frameworks"]) > 0
        assert any(f["title"] == "Test Framework" for f in data["frameworks"])
    
    def test_list_frameworks_filter_by_status(self, client, auth_headers, db_session, test_user):
        """Test filtering frameworks by status"""
        from app.models.saved_framework import SavedFramework
        
        # Create frameworks with different statuses
        framework1 = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Draft Framework",
            customized_content="",
            status="draft"
        )
        db_session.add(framework1)
        db_session.flush()
        
        framework2 = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Completed Framework",
            customized_content="Complete",
            status="completed",
            progress_percentage=100
        )
        db_session.add(framework2)
        db_session.flush()
        db_session.commit()
        
        # Filter by draft
        response = client.get("/api/frameworks?status=draft", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        draft_frameworks = [f for f in data["frameworks"] if f["status"] == "draft"]
        assert len(draft_frameworks) > 0
    
    def test_list_frameworks_filter_by_template_id(self, client, auth_headers, db_session, test_user):
        """Test filtering frameworks by template_id"""
        from app.models.saved_framework import SavedFramework
        
        # Create frameworks with different template IDs
        framework1 = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Template 1 Framework",
            customized_content="Content"
        )
        db_session.add(framework1)
        db_session.flush()
        
        framework2 = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=2,
            title="Template 2 Framework",
            customized_content="Content"
        )
        db_session.add(framework2)
        db_session.flush()
        db_session.commit()
        
        # Filter by template_id=1
        response = client.get("/api/frameworks?framework_template_id=1", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        template1_frameworks = [f for f in data["frameworks"] if f["framework_template_id"] == 1]
        assert len(template1_frameworks) > 0
    
    def test_list_frameworks_filter_by_linked_idea(self, client, auth_headers, db_session, test_user, test_run):
        """Test filtering frameworks by linked_idea_id"""
        from app.models.saved_framework import SavedFramework
        
        idea_id = f"{test_run.run_id}::idea_1"
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Linked Framework",
            customized_content="Content",
            linked_idea_id=idea_id
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        # Filter by linked_idea_id
        response = client.get(f"/api/frameworks?linked_idea_id={idea_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        linked_frameworks = [f for f in data["frameworks"] if f.get("linked_idea_id") == idea_id]
        assert len(linked_frameworks) > 0
    
    def test_list_frameworks_filter_by_linked_validation(self, client, auth_headers, db_session, test_user, test_validation):
        """Test filtering frameworks by linked_validation_id"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Validation Framework",
            customized_content="Content",
            linked_validation_id=test_validation.validation_id
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        # Filter by linked_validation_id
        response = client.get(f"/api/frameworks?linked_validation_id={test_validation.validation_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        linked_frameworks = [f for f in data["frameworks"] if f.get("linked_validation_id") == test_validation.validation_id]
        assert len(linked_frameworks) > 0
    
    def test_list_frameworks_without_auth(self, client):
        """Test listing frameworks without authentication"""
        response = client.get("/api/frameworks")
        
        assert response.status_code == 401
    
    # ==================== Get Framework ====================
    
    def test_get_framework_success(self, client, auth_headers, db_session, test_user):
        """Test getting a framework by ID"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Test Framework",
            customized_content="Test content"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        response = client.get(f"/api/frameworks/{framework.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["framework"]["id"] == framework.id
        assert data["framework"]["title"] == "Test Framework"
    
    def test_get_framework_not_found(self, client, auth_headers):
        """Test getting non-existent framework"""
        fake_id = str(uuid.uuid4())
        response = client.get(f"/api/frameworks/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_get_framework_unauthorized(self, client, auth_headers, db_session, test_user_pro):
        """Test getting framework from different user"""
        from app.models.saved_framework import SavedFramework
        
        # Create framework for different user
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            framework_template_id=1,
            title="Other User's Framework",
            customized_content="Content"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        # Try to access with different user's auth
        response = client.get(f"/api/frameworks/{framework.id}", headers=auth_headers)
        
        assert response.status_code == 404  # Not found (user can't see other user's frameworks)
    
    def test_get_framework_without_auth(self, client):
        """Test getting framework without authentication"""
        fake_id = str(uuid.uuid4())
        response = client.get(f"/api/frameworks/{fake_id}")
        
        assert response.status_code == 401
    
    # ==================== Update Framework ====================
    
    def test_update_framework_success(self, client, auth_headers, db_session, test_user):
        """Test updating a framework"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Original Title",
            customized_content="Original content"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        response = client.put(f"/api/frameworks/{framework.id}",
            headers=auth_headers,
            json={
                "title": "Updated Title",
                "customized_content": "Updated content"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["framework"]["title"] == "Updated Title"
        assert data["framework"]["customized_content"] == "Updated content"
    
    def test_update_framework_partial(self, client, auth_headers, db_session, test_user):
        """Test partial update of framework"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Original Title",
            customized_content="Original content"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        # Update only title
        response = client.put(f"/api/frameworks/{framework.id}",
            headers=auth_headers,
            json={
                "title": "Updated Title Only"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["framework"]["title"] == "Updated Title Only"
        assert data["framework"]["customized_content"] == "Original content"  # Unchanged
    
    def test_update_framework_status(self, client, auth_headers, db_session, test_user):
        """Test updating framework status"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Test Framework",
            customized_content="Content",
            status="draft"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        response = client.put(f"/api/frameworks/{framework.id}",
            headers=auth_headers,
            json={
                "status": "completed"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["framework"]["status"] == "completed"
    
    def test_update_framework_not_found(self, client, auth_headers):
        """Test updating non-existent framework"""
        fake_id = str(uuid.uuid4())
        response = client.put(f"/api/frameworks/{fake_id}",
            headers=auth_headers,
            json={
                "title": "Updated"
            }
        )
        
        assert response.status_code == 404
    
    def test_update_framework_unauthorized(self, client, auth_headers, db_session, test_user_pro):
        """Test updating framework from different user"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            framework_template_id=1,
            title="Other User's Framework",
            customized_content="Content"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        response = client.put(f"/api/frameworks/{framework.id}",
            headers=auth_headers,
            json={
                "title": "Hacked Title"
            }
        )
        
        assert response.status_code == 404  # Not found (unauthorized)
    
    def test_update_framework_without_auth(self, client):
        """Test updating framework without authentication"""
        fake_id = str(uuid.uuid4())
        response = client.put(f"/api/frameworks/{fake_id}",
            json={
                "title": "Updated"
            }
        )
        
        assert response.status_code == 401
    
    # ==================== Delete Framework ====================
    
    def test_delete_framework_success(self, client, auth_headers, db_session, test_user):
        """Test deleting a framework"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="To Delete",
            customized_content="Content"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        response = client.delete(f"/api/frameworks/{framework.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "deleted successfully" in data["message"].lower()
        
        # Verify soft delete (framework should not appear in list)
        list_response = client.get("/api/frameworks", headers=auth_headers)
        list_data = list_response.json()
        assert framework.id not in [f["id"] for f in list_data["frameworks"]]
    
    def test_delete_framework_not_found(self, client, auth_headers):
        """Test deleting non-existent framework"""
        fake_id = str(uuid.uuid4())
        response = client.delete(f"/api/frameworks/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_delete_framework_unauthorized(self, client, auth_headers, db_session, test_user_pro):
        """Test deleting framework from different user"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            framework_template_id=1,
            title="Other User's Framework",
            customized_content="Content"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        response = client.delete(f"/api/frameworks/{framework.id}", headers=auth_headers)
        
        assert response.status_code == 404  # Not found (unauthorized)
    
    def test_delete_framework_without_auth(self, client):
        """Test deleting framework without authentication"""
        fake_id = str(uuid.uuid4())
        response = client.delete(f"/api/frameworks/{fake_id}")
        
        assert response.status_code == 401
    
    # ==================== Export Framework ====================
    
    def test_export_framework_success(self, client, auth_headers, db_session, test_user):
        """Test exporting a framework"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            framework_template_id=1,
            title="Export Test Framework",
            customized_content="# Framework\n\n## Section 1\nContent here"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        response = client.post(f"/api/frameworks/{framework.id}/export", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "content" in data
        assert "filename" in data
        assert data["filename"].endswith(".md")
        assert "export-test-framework" in data["filename"].lower()
    
    def test_export_framework_not_found(self, client, auth_headers):
        """Test exporting non-existent framework"""
        fake_id = str(uuid.uuid4())
        response = client.post(f"/api/frameworks/{fake_id}/export", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_export_framework_unauthorized(self, client, auth_headers, db_session, test_user_pro):
        """Test exporting framework from different user"""
        from app.models.saved_framework import SavedFramework
        
        framework = SavedFramework(
            id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            framework_template_id=1,
            title="Other User's Framework",
            customized_content="Content"
        )
        db_session.add(framework)
        db_session.flush()
        db_session.commit()
        
        response = client.post(f"/api/frameworks/{framework.id}/export", headers=auth_headers)
        
        assert response.status_code == 404  # Not found (unauthorized)
    
    def test_export_framework_without_auth(self, client):
        """Test exporting framework without authentication"""
        fake_id = str(uuid.uuid4())
        response = client.post(f"/api/frameworks/{fake_id}/export")
        
        assert response.status_code == 401
    
    # ==================== Populate Template ====================
    
    def test_populate_template_success(self, client, auth_headers):
        """Test populating template variables"""
        response = client.post("/api/frameworks/populate-template",
            headers=auth_headers,
            json={
                "template_content": "Hello {{user.name}}, your email is {{user.email}}"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "content" in data
        # Content should have variables replaced (or at least be returned)
        assert isinstance(data["content"], str)
    
    def test_populate_template_with_validation_id(self, client, auth_headers, test_validation):
        """Test populating template with validation_id"""
        response = client.post("/api/frameworks/populate-template",
            headers=auth_headers,
            json={
                "template_content": "Validation idea: {{validation.idea}}, score: {{validation.overall_score}}",
                "validation_id": test_validation.validation_id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "content" in data
        assert isinstance(data["content"], str)
    
    def test_populate_template_with_idea_id(self, client, auth_headers, test_run):
        """Test populating template with idea_id"""
        idea_id = f"{test_run.run_id}::idea_1"
        response = client.post("/api/frameworks/populate-template",
            headers=auth_headers,
            json={
                "template_content": "Idea: {{idea.title}}",
                "idea_id": idea_id
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "content" in data
        assert isinstance(data["content"], str)
    
    def test_populate_template_missing_content(self, client, auth_headers):
        """Test populating template without template_content"""
        response = client.post("/api/frameworks/populate-template",
            headers=auth_headers,
            json={}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_populate_template_without_auth(self, client):
        """Test populating template without authentication"""
        response = client.post("/api/frameworks/populate-template",
            json={
                "template_content": "Test"
            }
        )
        
        assert response.status_code == 401

