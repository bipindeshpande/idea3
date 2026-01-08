"""Integration tests for Public API endpoints"""
import pytest


@pytest.mark.integration
@pytest.mark.api
class TestPublicAPI:
    """Test public API endpoints"""
    
    def test_usage_stats(self, client, test_user, test_validation):
        """Test getting public usage stats"""
        response = client.get("/api/public/usage-stats")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "stats" in data
        
        stats = data["stats"]
        assert "total_users" in stats
        assert "validations_this_month" in stats
        assert "total_validations" in stats
        assert "average_score" in stats
        
        # Should have at least 1 user
        assert stats["total_users"] >= 1

