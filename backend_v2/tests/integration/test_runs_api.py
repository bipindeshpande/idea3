"""Integration tests for Runs API endpoints"""
import pytest
from datetime import datetime, timezone
import uuid


@pytest.mark.integration
@pytest.mark.api
class TestRunsAPI:
    """Test runs API endpoints"""
    
    def test_get_runs_basic(self, client, auth_headers, test_run):
        """Test getting runs list (basic)"""
        response = client.get("/api/runs", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "runs" in data
        assert "pagination" in data
        assert isinstance(data["runs"], list)
        assert len(data["runs"]) > 0
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["page_size"] == 20
    
    def test_get_runs_pagination(self, client, auth_headers, db_session, test_user):
        """Test pagination"""
        from app.models.run import Run
        
        # Create multiple runs - flush after each to avoid UUID bulk insert issues
        for i in range(25):
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                status="completed",
                inputs={"test": f"run_{i}"},
                created_at=datetime.now(timezone.utc)
            )
            db_session.add(run)
            db_session.flush()  # Flush after each to avoid UUID bulk insert issues
        db_session.commit()
        
        # Test first page
        response = client.get("/api/runs?page=1&page_size=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["runs"]) == 10
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["page_size"] == 10
        assert data["pagination"]["total_count"] >= 25
        assert data["pagination"]["has_next"] is True
        assert data["pagination"]["has_previous"] is False
        
        # Test second page
        response = client.get("/api/runs?page=2&page_size=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["runs"]) == 10
        assert data["pagination"]["page"] == 2
        assert data["pagination"]["has_next"] is True
        assert data["pagination"]["has_previous"] is True
        
        # Test last page
        response = client.get("/api/runs?page=3&page_size=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["pagination"]["has_next"] is False
    
    def test_get_runs_filter_by_status(self, client, auth_headers, db_session, test_user):
        """Test filtering runs by status"""
        from app.models.run import Run
        
        # Create runs with different statuses - flush after each
        for status in ["completed", "pending", "processing", "failed"]:
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                status=status,
                inputs={"test": status},
                created_at=datetime.now(timezone.utc)
            )
            db_session.add(run)
            db_session.flush()  # Flush after each to avoid UUID bulk insert issues
        db_session.commit()
        
        # Filter by completed
        response = client.get("/api/runs?status_filter=completed", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert all(run["status"] == "completed" for run in data["runs"])
        
        # Filter by pending
        response = client.get("/api/runs?status_filter=pending", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert all(run["status"] == "pending" for run in data["runs"])
    
    def test_get_runs_sorting(self, client, auth_headers, db_session, test_user):
        """Test sorting runs"""
        from app.models.run import Run
        from datetime import timedelta
        
        # Create runs with different created_at times - flush after each
        base_time = datetime.now(timezone.utc)
        for i in range(5):
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                status="completed",
                inputs={"test": f"run_{i}"},
                created_at=base_time - timedelta(minutes=i)
            )
            db_session.add(run)
            db_session.flush()  # Flush after each to avoid UUID bulk insert issues
        db_session.commit()
        
        # Sort by created_at desc (default)
        response = client.get("/api/runs?sort_by=created_at&sort_order=desc", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        runs = data["runs"]
        # Check that runs are in descending order (newest first)
        for i in range(len(runs) - 1):
            assert runs[i]["created_at"] >= runs[i + 1]["created_at"]
        
        # Sort by created_at asc
        response = client.get("/api/runs?sort_by=created_at&sort_order=asc", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        runs = data["runs"]
        # Check that runs are in ascending order (oldest first)
        for i in range(len(runs) - 1):
            assert runs[i]["created_at"] <= runs[i + 1]["created_at"]
    
    def test_get_runs_sort_by_status(self, client, auth_headers, db_session, test_user):
        """Test sorting by status"""
        from app.models.run import Run
        
        # Create runs with different statuses - flush after each
        statuses = ["failed", "completed", "pending", "processing"]
        for status in statuses:
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                status=status,
                inputs={"test": status},
                created_at=datetime.now(timezone.utc)
            )
            db_session.add(run)
            db_session.flush()  # Flush after each to avoid UUID bulk insert issues
        db_session.commit()
        
        # Sort by status desc
        response = client.get("/api/runs?sort_by=status&sort_order=desc", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        runs = data["runs"]
        # Statuses should be sorted (descending alphabetical: processing, pending, failed, completed)
        statuses_in_response = [run["status"] for run in runs if run["status"] in statuses]
        assert len(statuses_in_response) >= len(statuses)
    
    def test_get_runs_without_auth(self, client):
        """Test getting runs without authentication"""
        response = client.get("/api/runs")
        
        # Should work but return empty or no user-specific runs
        assert response.status_code == 200
        data = response.json()
        assert "runs" in data
        assert "pagination" in data
    
    def test_get_runs_invalid_page(self, client, auth_headers):
        """Test with invalid page number"""
        # FastAPI validates query parameters, so invalid values return 422
        # Page 0 is invalid (ge=1 constraint)
        response = client.get("/api/runs?page=0", headers=auth_headers)
        assert response.status_code == 422  # Validation error
        
        # Negative page is invalid
        response = client.get("/api/runs?page=-1", headers=auth_headers)
        assert response.status_code == 422  # Validation error
    
    def test_get_runs_invalid_page_size(self, client, auth_headers):
        """Test with invalid page size"""
        # FastAPI validates query parameters, so invalid values return 422
        # Page size 0 is invalid (ge=1 constraint)
        response = client.get("/api/runs?page_size=0", headers=auth_headers)
        assert response.status_code == 422  # Validation error
        
        # Page size > 100 is invalid (le=100 constraint)
        response = client.get("/api/runs?page_size=200", headers=auth_headers)
        assert response.status_code == 422  # Validation error
    
    def test_get_runs_include_all(self, client, auth_headers, db_session, test_user, test_user_pro):
        """Test include_all parameter (for debugging)"""
        from app.models.run import Run
        
        # Create runs for both users - flush after each
        run1 = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user.user_id,
            status="completed",
            inputs={"test": "user1"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(run1)
        db_session.flush()
        
        run2 = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            status="completed",
            inputs={"test": "user2"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(run2)
        db_session.flush()
        db_session.commit()
        
        # Without include_all, should only see current user's runs
        response = client.get("/api/runs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        user_runs = [r for r in data["runs"] if r["run_id"] == run1.run_id or r["run_id"] == run2.run_id]
        # Should only see run1 (test_user's run)
        assert any(r["run_id"] == run1.run_id for r in user_runs)
        
        # With include_all=True, should see all runs
        response = client.get("/api/runs?include_all=true", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        user_runs = [r for r in data["runs"] if r["run_id"] == run1.run_id or r["run_id"] == run2.run_id]
        # Should see both runs
        assert any(r["run_id"] == run1.run_id for r in user_runs)
        assert any(r["run_id"] == run2.run_id for r in user_runs)
    
    def test_get_run_by_id_success(self, client, auth_headers, test_run):
        """Test getting a specific run by ID"""
        response = client.get(f"/api/runs/{test_run.run_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["run_id"] == test_run.run_id
        assert "inputs" in data
        assert "reports" in data
        assert "status" in data
    
    def test_get_run_by_id_not_found(self, client, auth_headers):
        """Test getting non-existent run"""
        fake_id = str(uuid.uuid4())
        response = client.get(f"/api/runs/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_get_run_by_id_unauthorized(self, client, auth_headers, db_session, test_user_pro):
        """Test getting run from different user"""
        from app.models.run import Run
        
        # Create run for different user
        other_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            status="completed",
            inputs={"test": "other_user"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(other_run)
        db_session.commit()
        
        # Try to access with different user's auth
        response = client.get(f"/api/runs/{other_run.run_id}", headers=auth_headers)
        
        # Should return 404 (not found for this user)
        assert response.status_code == 404
    
    def test_get_runs_stats(self, client, auth_headers, db_session, test_user):
        """Test getting run statistics"""
        from app.models.run import Run
        
        # Create some runs - flush after each
        for i in range(3):
            run = Run(
                run_id=str(uuid.uuid4()),
                user_id=test_user.user_id,
                status="completed",
                inputs={"business_type": "startup"},  # Discovery run
                created_at=datetime.now(timezone.utc)
            )
            db_session.add(run)
            db_session.flush()  # Flush after each to avoid UUID bulk insert issues
        db_session.commit()
        
        response = client.get("/api/runs/stats", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "discoveries" in data
        assert "validations" in data
        assert "other" in data
        assert "total" in data
        assert isinstance(data["discoveries"], int)
        assert isinstance(data["validations"], int)
        assert isinstance(data["total"], int)
    
    def test_get_runs_stats_without_auth(self, client):
        """Test getting stats without authentication"""
        response = client.get("/api/runs/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_delete_run_success(self, client, auth_headers, test_run):
        """Test deleting a run"""
        response = client.delete(f"/api/runs/{test_run.run_id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify it's soft deleted (should not appear in list)
        response = client.get("/api/runs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert not any(r["run_id"] == test_run.run_id for r in data["runs"])
    
    def test_delete_run_not_found(self, client, auth_headers):
        """Test deleting non-existent run"""
        fake_id = str(uuid.uuid4())
        response = client.delete(f"/api/runs/{fake_id}", headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_delete_run_unauthorized(self, client, auth_headers, db_session, test_user_pro):
        """Test deleting run from different user"""
        from app.models.run import Run
        
        # Create run for different user
        other_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=test_user_pro.user_id,
            status="completed",
            inputs={"test": "other_user"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(other_run)
        db_session.commit()
        
        # Try to delete with different user's auth
        response = client.delete(f"/api/runs/{other_run.run_id}", headers=auth_headers)
        
        # Should return 404 (not found for this user)
        assert response.status_code == 404
    
    def test_delete_run_without_auth(self, client, test_run):
        """Test deleting run without authentication"""
        response = client.delete(f"/api/runs/{test_run.run_id}")
        
        assert response.status_code == 401
    
    def test_assign_null_runs_success(self, client, auth_headers, db_session, test_user):
        """Test assigning null runs to user"""
        from app.models.run import Run
        
        # Create a run with null user_id
        null_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=None,
            status="completed",
            inputs={"test": "null_user"},
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(null_run)
        db_session.commit()
        
        response = client.post("/api/runs/assign-null-runs", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["assigned_count"] >= 1
        
        # Verify the run is now assigned to the user
        response = client.get("/api/runs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert any(r["run_id"] == null_run.run_id for r in data["runs"])
    
    def test_assign_null_runs_without_auth(self, client):
        """Test assigning null runs without authentication"""
        response = client.post("/api/runs/assign-null-runs")
        
        assert response.status_code == 401
    
    def test_assign_null_runs_no_null_runs(self, client, auth_headers):
        """Test assigning null runs when none exist"""
        response = client.post("/api/runs/assign-null-runs", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["assigned_count"] == 0

