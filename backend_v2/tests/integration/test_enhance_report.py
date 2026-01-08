"""Integration tests for enhance-report endpoint"""
import pytest


@pytest.mark.integration
@pytest.mark.api
@pytest.mark.slow
class TestEnhanceReport:
    """Test report enhancement endpoint"""
    
    def test_enhance_report_basic(self, client, auth_headers, test_run):
        """Test basic report enhancement"""
        response = client.post("/api/enhance-report",
            headers=auth_headers,
            json={"run_id": test_run.run_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "enhancements" in data
        
        enhancements = data["enhancements"]
        assert "similar_ideas" in enhancements
        assert "market_insights" in enhancements
        assert "validation_suggestions" in enhancements
        
        # All should be lists
        assert isinstance(enhancements["similar_ideas"], list)
        assert isinstance(enhancements["market_insights"], list)
        assert isinstance(enhancements["validation_suggestions"], list)
    
    def test_enhance_report_with_validations(self, client, auth_headers, test_run, test_validation):
        """Test enhancement with existing validations"""
        response = client.post("/api/enhance-report",
            headers=auth_headers,
            json={"run_id": test_run.run_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        
        # Should have similar ideas if validation score >= 7
        if test_validation.validation_result.get("overall_score", 0) >= 7.0:
            assert len(data["enhancements"]["similar_ideas"]) > 0
    
    def test_enhance_report_missing_run_id(self, client, auth_headers):
        """Test enhancement without run_id"""
        response = client.post("/api/enhance-report",
            headers=auth_headers,
            json={}
        )
        
        assert response.status_code == 400
    
    def test_enhance_report_invalid_run_id(self, client, auth_headers):
        """Test enhancement with invalid run_id format"""
        response = client.post("/api/enhance-report",
            headers=auth_headers,
            json={"run_id": "invalid-run-id"}
        )
        
        # Invalid UUID format should return 400, not 404
        assert response.status_code == 400

