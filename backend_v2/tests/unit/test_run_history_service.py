"""
Unit tests for RunHistoryService
"""
import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timezone
from fastapi import HTTPException
import json
import uuid

from app.services.run_history_service import RunHistoryService
from app.models.run import Run


@pytest.mark.unit
class TestRunHistoryService:
    """Test RunHistoryService operations"""
    
    @pytest.fixture
    def run_history_service(self, db_session):
        """Create RunHistoryService instance"""
        return RunHistoryService(db_session)
    
    @pytest.fixture
    def sample_run(self, test_user, db_session):
        """Create a sample run"""
        run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={"startup_category": "tech"},
            reports={"recommendations_structured": [{"title": "Test Idea", "summary": "Test summary"}]},
            status="completed"
        )
        db_session.add(run)
        db_session.commit()
        return run
    
    def test_format_run_for_history_string_reports(self, run_history_service, sample_run):
        """Test formatting run when reports is a string"""
        # Update run to have string reports
        sample_run.reports = json.dumps({"recommendations_structured": [{"title": "String Idea", "summary": "String summary"}]})
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["id"] == sample_run.run_id
        assert "idea_title" in result
    
    def test_format_run_for_history_invalid_json(self, run_history_service, sample_run):
        """Test formatting run when reports string is invalid JSON"""
        sample_run.reports = "invalid json{"
        
        result = run_history_service.normalize_run(sample_run)
        
        # Should handle gracefully and return empty parsed_output
        assert result["id"] == sample_run.run_id
    
    def test_format_run_for_history_validation_type(self, run_history_service, sample_run):
        """Test detecting validation run type"""
        sample_run.reports = {"validation_id": "test-id", "overall_score": 8.0}
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["run_type"] == "validation"
    
    def test_format_run_for_history_validation_type_with_score(self, run_history_service, sample_run):
        """Test detecting validation run type by overall_score"""
        sample_run.reports = {"overall_score": 0}  # Even 0 should be detected
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["run_type"] == "validation"
    
    def test_format_run_for_history_discovery_type(self, run_history_service, sample_run):
        """Test detecting discovery run type"""
        sample_run.inputs = {"business_type": "SaaS"}
        sample_run.reports = {}
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["run_type"] == "discovery"
    
    def test_format_run_for_history_extract_from_structured(self, run_history_service, sample_run):
        """Test extracting idea title from recommendations_structured"""
        sample_run.reports = {
            "recommendations_structured": [
                {"title": "First Idea", "summary": "First summary"},
                {"title": "Second Idea", "summary": "Second summary"}
            ]
        }
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["idea_title"] == "First Idea"
        assert result["summary"] == "First summary"
    
    def test_format_run_for_history_extract_from_personalized(self, run_history_service, sample_run):
        """Test extracting idea title from personalized_recommendations markdown"""
        sample_run.reports = {
            "personalized_recommendations": "### IDEA_Test Idea Title\n\nSome content"
        }
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["idea_title"] == "Test Idea Title"
    
    def test_format_run_for_history_extract_from_personalized_alt_format(self, run_history_service, sample_run):
        """Test extracting idea title from personalized_recommendations with ## format"""
        sample_run.reports = {
            "personalized_recommendations": "## Another Idea Title\n\nSome content"
        }
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["idea_title"] == "Another Idea Title"
    
    def test_format_run_for_history_no_idea_title(self, run_history_service, sample_run):
        """Test formatting when no idea title can be extracted"""
        sample_run.reports = {}
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["idea_title"] == ""
        assert result["summary"] == ""
    
    def test_get_runs_pagination(self, run_history_service, test_user, db_session):
        """Test getting paginated runs"""
        # Create multiple runs
        for i in range(5):
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                inputs={"startup_category": "tech"},
                status="completed"
            )
            db_session.add(run)
            db_session.flush()  # Flush after each to avoid UUID issues
        db_session.commit()
        
        result = run_history_service.get_runs(page=1, page_size=2, user_id=test_user.user_id)
        
        assert len(result["runs"]) == 2
        assert result["pagination"]["page"] == 1
        assert result["pagination"]["page_size"] == 2
        assert result["pagination"]["total_count"] >= 5
        assert result["pagination"]["has_next"] is True
    
    def test_get_runs_status_filter(self, run_history_service, test_user, db_session):
        """Test filtering runs by status"""
        # Create runs with different statuses
        run1 = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={},
            status="completed"
        )
        run2 = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={},
            status="pending"
        )
        db_session.add(run1)
        db_session.flush()
        db_session.add(run2)
        db_session.flush()
        db_session.commit()
        
        result = run_history_service.get_runs(status_filter="completed", user_id=test_user.user_id)
        
        assert all(run["status"] == "completed" for run in result["runs"])
    
    def test_get_runs_sorting(self, run_history_service, test_user, db_session):
        """Test sorting runs"""
        # Create runs
        for i in range(3):
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                inputs={},
                status="completed"
            )
            db_session.add(run)
            db_session.flush()  # Flush after each
        db_session.commit()
        
        result_asc = run_history_service.get_runs(sort_by="created_at", sort_order="asc", user_id=test_user.user_id)
        result_desc = run_history_service.get_runs(sort_by="created_at", sort_order="desc", user_id=test_user.user_id)
        
        assert len(result_asc["runs"]) > 0
        assert len(result_desc["runs"]) > 0
    
    def test_get_runs_invalid_page(self, run_history_service, test_user):
        """Test that invalid page numbers are corrected"""
        result = run_history_service.get_runs(page=0, user_id=test_user.user_id)
        assert result["pagination"]["page"] == 1
        
        result = run_history_service.get_runs(page=-1, user_id=test_user.user_id)
        assert result["pagination"]["page"] == 1
    
    def test_get_runs_invalid_page_size(self, run_history_service, test_user):
        """Test that invalid page sizes are corrected"""
        result = run_history_service.get_runs(page_size=0, user_id=test_user.user_id)
        assert result["pagination"]["page_size"] == 20
        
        result = run_history_service.get_runs(page_size=200, user_id=test_user.user_id)
        assert result["pagination"]["page_size"] == 20
    
    def test_get_runs_excludes_deleted(self, run_history_service, test_user, db_session):
        """Test that deleted runs are excluded"""
        from datetime import datetime, timezone
        
        normal_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={},
            status="completed"
        )
        deleted_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={},
            status="completed",
            deleted_at=datetime.now(timezone.utc)
        )
        db_session.add(normal_run)
        db_session.flush()
        db_session.add(deleted_run)
        db_session.flush()
        db_session.commit()
        
        result = run_history_service.get_runs(user_id=test_user.user_id)
        
        run_ids = [run["id"] for run in result["runs"]]
        assert normal_run.run_id in run_ids
        assert deleted_run.run_id not in run_ids
    
    def test_get_run_by_id_success(self, run_history_service, sample_run):
        """Test getting run by ID"""
        result = run_history_service.get_run_by_id(sample_run.run_id, sample_run.user_id)
        
        assert result["id"] == sample_run.run_id
        assert result["run_id"] == sample_run.run_id
    
    def test_get_run_by_id_not_found(self, run_history_service):
        """Test getting non-existent run raises 404"""
        fake_id = str(uuid.uuid4())
        
        with pytest.raises(HTTPException) as exc_info:
            run_history_service.get_run_by_id(fake_id)
        
        assert exc_info.value.status_code == 404
    
    def test_get_run_by_id_wrong_user(self, run_history_service, sample_run, test_user_pro):
        """Test that users can only get their own runs"""
        with pytest.raises(HTTPException) as exc_info:
            run_history_service.get_run_by_id(sample_run.run_id, test_user_pro.user_id)
        
        assert exc_info.value.status_code == 404
    
    def test_get_run_by_id_excludes_deleted(self, run_history_service, test_user, db_session):
        """Test that deleted runs are not returned"""
        from datetime import datetime, timezone
        
        deleted_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={},
            status="completed",
            deleted_at=datetime.now(timezone.utc)
        )
        db_session.add(deleted_run)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            run_history_service.get_run_by_id(deleted_run.run_id, test_user.user_id)
        
        assert exc_info.value.status_code == 404
    
    def test_soft_delete_run_success(self, run_history_service, sample_run):
        """Test soft deleting a run"""
        result = run_history_service.soft_delete_run(sample_run.run_id, sample_run.user_id)
        
        assert result is True
        # Verify run is marked as deleted
        assert sample_run.deleted_at is not None
        assert sample_run.status == "deleted"
    
    def test_soft_delete_run_not_found(self, run_history_service):
        """Test deleting non-existent run raises 404"""
        fake_id = str(uuid.uuid4())
        
        with pytest.raises(HTTPException) as exc_info:
            run_history_service.soft_delete_run(fake_id)
        
        assert exc_info.value.status_code == 404
    
    def test_soft_delete_run_wrong_user(self, run_history_service, sample_run, test_user_pro):
        """Test that users can only delete their own runs"""
        with pytest.raises(HTTPException) as exc_info:
            run_history_service.soft_delete_run(sample_run.run_id, test_user_pro.user_id)
        
        assert exc_info.value.status_code == 404
    
    def test_soft_delete_run_already_deleted(self, run_history_service, test_user, db_session):
        """Test that already deleted runs cannot be deleted again"""
        from datetime import datetime, timezone
        
        deleted_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={},
            status="deleted",
            deleted_at=datetime.now(timezone.utc)
        )
        db_session.add(deleted_run)
        db_session.commit()
        
        with pytest.raises(HTTPException) as exc_info:
            run_history_service.soft_delete_run(deleted_run.run_id, test_user.user_id)
        
        assert exc_info.value.status_code == 404
    
    def test_normalize_run_startup_category_default(self, run_history_service, test_user, db_session):
        """Test that startup_category defaults to 'both' if missing"""
        # Create a run with inputs dict that doesn't have startup_category
        run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={"some_other_key": "value"},  # Has inputs but no startup_category
            reports={},
            status="completed"
        )
        db_session.add(run)
        db_session.commit()
        
        result = run_history_service.normalize_run(run)
        
        # Should have startup_category set to "both"
        assert "startup_category" in result["inputs"]
        assert result["inputs"]["startup_category"] == "both"
    
    def test_normalize_run_startup_category_empty_string(self, run_history_service, test_user, db_session):
        """Test that empty startup_category is set to 'both'"""
        run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            inputs={"startup_category": ""},  # Empty string
            reports={},
            status="completed"
        )
        db_session.add(run)
        db_session.commit()
        
        result = run_history_service.normalize_run(run)
        
        # Should have startup_category set to "both"
        assert result["inputs"]["startup_category"] == "both"
    
    def test_normalize_run_startup_category_empty(self, run_history_service, sample_run):
        """Test that empty startup_category is set to 'both'"""
        sample_run.inputs = {"startup_category": ""}
        
        result = run_history_service.normalize_run(sample_run)
        
        assert result["inputs"]["startup_category"] == "both"

