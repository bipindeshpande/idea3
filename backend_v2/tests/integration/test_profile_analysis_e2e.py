"""End-to-end integration test for profile analysis flow"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from typing import AsyncIterator
from datetime import datetime, timezone
import json


@pytest.mark.integration
@pytest.mark.api
class TestProfileAnalysisE2E:
    """End-to-end tests for profile analysis generation, saving, and retrieval"""
    
    @pytest.fixture
    def valid_discovery_inputs(self):
        """Valid discovery inputs for testing"""
        return {
            "startup_category": "tech",
            "time_commitment": "5-10 hours/week",
            "budget_range": "$1,000 - $5,000",
            "risk_tolerance": "Moderate",
            "preferred_work_style": "Solo",
            "startup_style": "Online-only business",
            "customer_interaction": "Somewhat comfortable",
            "location_context": "Urban",
            "business_region": "North America",
            "industry_interest": "Technology",
            "business_type": "Product",
            "earnings_timeline": "90 days",
            "founder_ambition": "Side income",
            "skills": {
                "technical": ["Python", "JavaScript"],
                "creative": [],
                "physical": [],
                "business": [],
                "soft": [],
                "other": ""
            }
        }
    
    async def mock_workflow_stream_with_profile(self, inputs, user_id=None, run_id=None) -> AsyncIterator[str]:
        """Mock workflow_stream that returns profile analysis with proper format"""
        # Profile analysis with markers
        profile_text = """---PROFILE_ANALYSIS_START---
{
  "core_motivations": ["Build something meaningful", "Financial independence"],
  "risk_tolerance": "Moderate",
  "work_style": "Solo",
  "strengths": ["Technical skills", "Problem solving"],
  "constraints": {
    "budget": "$1,000 - $5,000",
    "time": "5-10 hours/week"
  }
}
---PROFILE_ANALYSIS_END---"""
        
        yield profile_text
        yield "\n\n---PROFILE_END---\n\n"
        # Recommendations chunk
        yield "### IDEA_1\n"
        yield "title: Test Idea 1\n"
        yield "summary: This is a test idea\n\n"
        yield "### IDEA_2\n"
        yield "title: Test Idea 2\n"
        yield "summary: Another test idea\n\n"
    
    @patch('app.api.routes.discovery.streaming.DiscoveryService')
    def test_profile_analysis_saved_to_database(self, mock_discovery_service_class, client, valid_discovery_inputs, db_session, test_user, auth_headers):
        """Test that profile analysis is properly saved to database after streaming"""
        from app.models.run import Run
        
        # Mock the discovery service instance
        mock_service = MagicMock()
        mock_service.workflow_stream = AsyncMock(side_effect=self.mock_workflow_stream_with_profile)
        mock_service.cache_service.build_discovery_cache_key = MagicMock(return_value="test_cache_key")
        mock_service.cache_service.get_json = MagicMock(return_value=None)  # No cache
        mock_service._log = MagicMock()
        mock_discovery_service_class.return_value = mock_service
        
        # Make discovery request
        response = client.post(
            "/api/discovery?format=sse",
            json=valid_discovery_inputs,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert "X-Run-Id" in response.headers
        
        # Get run_id from response
        run_id = response.headers.get("X-Run-Id")
        assert run_id is not None
        
        # Wait a bit for async save to complete (in real scenario, this happens in background)
        # The save happens after streaming completes, so we need to wait
        import time
        max_wait = 3.0
        waited = 0.0
        run = None
        while waited < max_wait:
            time.sleep(0.3)
            waited += 0.3
            run = db_session.query(Run).filter(Run.run_id == run_id).first()
            if run and run.status == "completed" and run.profile_analysis:
                break
        
        # Verify run was saved to database
        assert run is not None, f"Run {run_id} not found in database"
        # Verify profile_analysis was saved (this is the key test)
        assert run.profile_analysis is not None, "profile_analysis was not saved"
        assert len(run.profile_analysis) > 0, "profile_analysis is empty"
        
        # Verify profile_analysis was saved
        assert run.profile_analysis is not None
        assert len(run.profile_analysis) > 0
        assert "PROFILE_ANALYSIS_START" in run.profile_analysis
        assert "PROFILE_ANALYSIS_END" in run.profile_analysis
        
        # Verify reports contains profile_analysis
        assert run.reports is not None
        if isinstance(run.reports, dict):
            assert "profile_analysis" in run.reports
            assert len(run.reports["profile_analysis"]) > 0
    
    @patch('app.api.routes.discovery.streaming.DiscoveryService')
    def test_profile_analysis_retrieved_via_api(self, mock_discovery_service_class, client, valid_discovery_inputs, db_session, test_user, auth_headers):
        """Test that profile analysis can be retrieved via API endpoint"""
        from app.models.run import Run
        
        # Mock the discovery service instance
        mock_service = MagicMock()
        mock_service.workflow_stream = AsyncMock(side_effect=self.mock_workflow_stream_with_profile)
        mock_service.cache_service.build_discovery_cache_key = MagicMock(return_value="test_cache_key")
        mock_service.cache_service.get_json = MagicMock(return_value=None)  # No cache
        mock_service._log = MagicMock()
        mock_discovery_service_class.return_value = mock_service
        
        # Make discovery request
        response = client.post(
            "/api/discovery?format=sse",
            json=valid_discovery_inputs,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        run_id = response.headers.get("X-Run-Id")
        assert run_id is not None
        
        # Wait for save to complete
        import time
        max_wait = 3.0
        waited = 0.0
        run = None
        while waited < max_wait:
            time.sleep(0.3)
            waited += 0.3
            run = db_session.query(Run).filter(Run.run_id == run_id).first()
            if run and run.status == "completed" and run.profile_analysis:
                break
        
        # Retrieve run via API
        response = client.get(f"/api/user/run/{run_id}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "run" in data
        
        run_data = data["run"]
        
        # Verify profile_analysis is in response
        assert "profile_analysis" in run_data
        assert run_data["profile_analysis"] is not None
        assert len(run_data["profile_analysis"]) > 0
        
        # Verify reports also contains profile_analysis
        assert "reports" in run_data
        if isinstance(run_data["reports"], dict):
            assert "profile_analysis" in run_data["reports"]
            assert len(run_data["reports"]["profile_analysis"]) > 0
    
    def test_profile_analysis_in_runs_list(self, client, auth_headers, db_session, test_user):
        """Test that profile_analysis is included when listing runs"""
        from app.models.run import Run
        import uuid
        
        # Create a run with profile_analysis
        test_profile = "---PROFILE_ANALYSIS_START---\n{\"test\": \"data\"}\n---PROFILE_ANALYSIS_END---"
        test_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            status="completed",
            inputs={"test": "data"},
            profile_analysis=test_profile,
            personalized_recommendations="Test recommendations",
            reports={
                "profile_analysis": test_profile,
                "personalized_recommendations": "Test recommendations"
            },
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(test_run)
        db_session.commit()
        
        # Get runs list
        response = client.get("/api/runs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "runs" in data
        
        # Find our test run
        found_run = None
        for run in data["runs"]:
            if run["run_id"] == test_run.run_id:
                found_run = run
                break
        
        assert found_run is not None
        
        # Verify profile_analysis is in the response
        assert "profile_analysis" in found_run
        assert found_run["profile_analysis"] == test_profile
        
        # Verify reports also contains it
        assert "reports" in found_run
        if isinstance(found_run["reports"], dict):
            assert "profile_analysis" in found_run["reports"]
            assert found_run["reports"]["profile_analysis"] == test_profile

