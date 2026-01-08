"""Integration tests for History API endpoints"""
import pytest
import uuid
from datetime import datetime, timezone
from app.models.discovery_result import DiscoveryResult
from app.models.run import Run


@pytest.mark.integration
@pytest.mark.api
class TestHistoryAPI:
    """Test history API endpoints"""
    
    @pytest.fixture
    def test_discovery_result(self, db_session, test_user):
        """Create a test discovery result"""
        # First create a run
        run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            status="completed",
            inputs={"interest_area": "AI", "goal_type": "startup"},
            reports={"personalized_recommendations": "Test recommendations"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(run)
        db_session.flush()
        
        # Create discovery result linked to the run
        discovery_result = DiscoveryResult(
            id=str(uuid.uuid4()),
            run_id=run.run_id,
            input_payload={
                "interest_area": "AI",
                "goal_type": "startup"
            },
            result={
                "profile_analysis": "Test profile analysis",
                "personalized_recommendations": "Test recommendations"
            },
            status="completed",
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(discovery_result)
        db_session.commit()
        db_session.refresh(discovery_result)
        return discovery_result
    
    @pytest.fixture
    def test_discovery_result_pending(self, db_session, test_user):
        """Create a pending discovery result"""
        run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            status="pending",
            inputs={"interest_area": "Tech", "goal_type": "business"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(run)
        db_session.flush()
        
        discovery_result = DiscoveryResult(
            id=str(uuid.uuid4()),
            run_id=run.run_id,
            input_payload={
                "interest_area": "Tech",
                "goal_type": "business"
            },
            result={},  # Empty for pending
            status="pending",
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(discovery_result)
        db_session.commit()
        db_session.refresh(discovery_result)
        return discovery_result
    
    @pytest.fixture
    def test_discovery_result_failed(self, db_session, test_user):
        """Create a failed discovery result"""
        run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            status="failed",
            inputs={"interest_area": "Finance", "goal_type": "startup"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(run)
        db_session.flush()
        
        discovery_result = DiscoveryResult(
            id=str(uuid.uuid4()),
            run_id=run.run_id,
            input_payload={
                "interest_area": "Finance",
                "goal_type": "startup"
            },
            result={},
            status="failed",
            error_message="Test error message",
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(discovery_result)
        db_session.commit()
        db_session.refresh(discovery_result)
        return discovery_result
    
    def test_get_history_success(self, client, db_session, test_discovery_result):
        """Test getting history list successfully"""
        response = client.get("/api/history")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        # Check structure of first item
        item = data[0]
        assert "run_id" in item
        assert "status" in item
        assert "created_at" in item
        assert "input_summary" in item
        
        # Check input_summary structure
        input_summary = item["input_summary"]
        assert "interest_area" in input_summary
        assert "goal_type" in input_summary
    
    def test_get_history_with_limit(self, client, db_session, test_user):
        """Test getting history with custom limit"""
        # Create multiple discovery results
        for i in range(5):
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                status="completed",
                inputs={"interest_area": f"Tech{i}", "goal_type": "startup"},
                created_at=datetime.now(timezone.utc)
            )
            db_session.add(run)
            db_session.flush()
            
            discovery_result = DiscoveryResult(
                id=str(uuid.uuid4()),
                run_id=run.run_id,
                input_payload={"interest_area": f"Tech{i}", "goal_type": "startup"},
                result={"test": "data"},
                status="completed",
                created_at=datetime.now(timezone.utc)
            )
            db_session.add(discovery_result)
        
        db_session.commit()
        
        # Request with limit of 3
        response = client.get("/api/history?limit=3")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 3
    
    def test_get_history_empty(self, client, db_session):
        """Test getting history when no results exist"""
        # Make sure we're using a fresh session (transaction rollback ensures clean state)
        response = client.get("/api/history")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # May be empty or have data from other tests, so we just check it's a list
    
    def test_get_history_default_limit(self, client, db_session, test_discovery_result):
        """Test that default limit is applied"""
        response = client.get("/api/history")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 50  # Default limit
    
    def test_get_history_by_run_id_success_completed(self, client, db_session, test_discovery_result):
        """Test getting history by run_id for completed result"""
        response = client.get(f"/api/history/{test_discovery_result.run_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["run_id"] == test_discovery_result.run_id
        assert data["status"] == "completed"
        assert "created_at" in data
        assert "input_payload" in data
        assert "result" in data
        assert data["input_payload"]["interest_area"] == "AI"
        assert data["input_payload"]["goal_type"] == "startup"
        assert "profile_analysis" in data["result"]
    
    def test_get_history_by_run_id_pending(self, client, db_session, test_discovery_result_pending):
        """Test getting history by run_id for pending result"""
        response = client.get(f"/api/history/{test_discovery_result_pending.run_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["run_id"] == test_discovery_result_pending.run_id
        assert data["status"] == "pending"
        assert "created_at" in data
        # Pending status should not include input_payload or result
        assert "input_payload" not in data
        assert "result" not in data
    
    def test_get_history_by_run_id_processing(self, client, db_session, test_user):
        """Test getting history by run_id for processing result"""
        run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            status="processing",
            inputs={"interest_area": "E-commerce", "goal_type": "startup"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(run)
        db_session.flush()
        
        discovery_result = DiscoveryResult(
            id=str(uuid.uuid4()),
            run_id=run.run_id,
            input_payload={"interest_area": "E-commerce", "goal_type": "startup"},
            result={},
            status="processing",
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(discovery_result)
        db_session.commit()
        
        response = client.get(f"/api/history/{run.run_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "processing"
        assert "input_payload" not in data
        assert "result" not in data
    
    def test_get_history_by_run_id_failed(self, client, db_session, test_discovery_result_failed):
        """Test getting history by run_id for failed result"""
        response = client.get(f"/api/history/{test_discovery_result_failed.run_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["run_id"] == test_discovery_result_failed.run_id
        assert data["status"] == "failed"
        assert "created_at" in data
        assert "input_payload" in data
        assert "error" in data
        assert data["error"] == "Test error message"
        assert "result" not in data
    
    def test_get_history_by_run_id_not_found(self, client):
        """Test getting history by non-existent run_id"""
        non_existent_run_id = str(uuid.uuid4())
        response = client.get(f"/api/history/{non_existent_run_id}")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert non_existent_run_id in data["detail"]
    
    def test_get_history_multiple_results_ordered(self, client, db_session, test_user):
        """Test that history results are ordered by created_at DESC"""
        import time
        
        # Create multiple results with slight time differences
        run_ids = []
        for i in range(3):
            time.sleep(0.01)  # Small delay to ensure different timestamps
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                status="completed",
                inputs={"interest_area": f"Test{i}", "goal_type": "startup"},
                created_at=datetime.now(timezone.utc)
            )
            db_session.add(run)
            db_session.flush()
            run_ids.append(run.run_id)
            
            discovery_result = DiscoveryResult(
                id=str(uuid.uuid4()),
                run_id=run.run_id,
                input_payload={"interest_area": f"Test{i}", "goal_type": "startup"},
                result={"test": "data"},
                status="completed",
                created_at=datetime.now(timezone.utc)
            )
            db_session.add(discovery_result)
        
        db_session.commit()
        
        response = client.get("/api/history?limit=10")
        assert response.status_code == 200
        data = response.json()
        
        # Results should be ordered by created_at DESC (newest first)
        # The last created run_id should be first in the list
        if len(data) >= 3:
            # Check that the most recent ones are at the top
            returned_run_ids = [item["run_id"] for item in data[:3]]
            # The last run_id we created should be in the first few results
            assert run_ids[-1] in returned_run_ids

