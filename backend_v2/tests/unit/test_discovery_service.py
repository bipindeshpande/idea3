"""Unit tests for DiscoveryService"""
import pytest
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from datetime import datetime, timezone
import uuid
import asyncio

from app.services.discovery_service import DiscoveryService
from app.models.run import Run
from app.models.discovery_result import DiscoveryResult


@pytest.mark.unit
class TestDiscoveryService:
    """Test discovery service operations"""
    
    @pytest.fixture
    def discovery_service(self, db_session):
        """Create discovery service with mocked dependencies"""
        service = DiscoveryService(db_session)
        
        # Mock all dependencies
        service.profile_service = Mock()
        service.psyche_scoring_service = Mock()
        service.cache_service = Mock()
        service.error_log_service = Mock()
        service.stage2_service = Mock()
        service.profile_formatter = Mock()
        service.final_recommendation_service = Mock()
        service.result_assembler = Mock()
        
        return service
    
    @pytest.fixture
    def test_inputs(self):
        """Sample discovery inputs"""
        return {
            "startup_category": "tech",
            "time_commitment": "5-10 hours/week",
            "budget_range": "$1,000 - $5,000",
            "industry_interest": "Technology",
            "business_type": "Product",
            "earnings_timeline": "90 days",
            "founder_ambition": "Side income"
        }
    
    # Use test_user fixture from conftest instead
    
    def test_run_discovery_cache_hit(self, discovery_service, test_inputs, test_user):
        """Test discovery with cache hit"""
        cached_outputs = {
            "profile_analysis": "Cached profile",
            "personalized_recommendations": "Cached recommendations"
        }
        
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=cached_outputs)
        
        result = discovery_service.run_discovery(test_inputs, user_id=test_user.user_id)
        
        assert result["success"] is True
        assert result["cached"] is True
        assert result["cache_hit"] is True
        assert result["outputs"] == cached_outputs
        # Should not call profile service when cached
        discovery_service.profile_service.run.assert_not_called()
    
    def test_run_discovery_no_cache(self, discovery_service, test_inputs, test_user):
        """Test discovery without cache"""
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        
        # Mock profile analysis - must return dict with profile_analysis key
        discovery_service.profile_service.run = Mock(return_value={
            "profile_analysis": "Test profile analysis",
            "recommendations": "Test recommendations"
        })
        
        # Mock stage2 recommendations
        discovery_service.stage2_service.generate_recommendations = Mock(return_value={
            "recommendations": "Test recommendations"
        })
        
        # Mock result assembler
        discovery_service.result_assembler.assemble = Mock(return_value={
            "profile_analysis": "Test profile analysis",
            "personalized_recommendations": "Test recommendations"
        })
        
        # Mock conflict detector
        with patch('app.services.discovery_service.ConflictDetector') as mock_conflict:
            mock_conflict.detect_conflicts = Mock(return_value=[])
            mock_conflict.build_user_message = Mock(return_value=None)
            
            # Mock determine_realism_level
            with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
                result = discovery_service.run_discovery(test_inputs, user_id=test_user.user_id)
        
        assert result["success"] is True
        assert result["cached"] is False
        assert result["cache_hit"] is False
        assert "run_id" in result
        discovery_service.profile_service.run.assert_called_once()
    
    def test_run_discovery_creates_run(self, discovery_service, test_inputs, test_user, db_session):
        """Test that discovery creates run record"""
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        discovery_service.profile_service.run = Mock(return_value={"profile_analysis": "Test", "recommendations": "Test"})
        discovery_service.stage2_service.generate_recommendations = Mock(return_value={"recommendations": "Test"})
        discovery_service.result_assembler.assemble = Mock(return_value={
            "profile_analysis": "Test",
            "personalized_recommendations": "Test"
        })
        
        with patch('app.services.discovery_service.ConflictDetector') as mock_conflict:
            mock_conflict.detect_conflicts = Mock(return_value=[])
            mock_conflict.build_user_message = Mock(return_value=None)
            with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
                result = discovery_service.run_discovery(test_inputs, user_id=test_user.user_id)
        
        # Verify run was created
        run = db_session.query(Run).filter(Run.run_id == result["run_id"]).first()
        assert run is not None
        assert run.user_id == test_user.user_id
        assert run.status == "completed"
    
    def test_run_discovery_with_existing_run_id(self, discovery_service, test_inputs, test_user, db_session):
        """Test discovery with existing run_id"""
        run_id = str(uuid.uuid4())
        existing_run = Run(
            run_id=run_id,
            user_id=test_user.user_id,
            inputs=test_inputs,
            status="pending",
            created_at=datetime.now(timezone.utc)
        )
        db_session.add(existing_run)
        db_session.commit()
        
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        discovery_service.profile_service.run = Mock(return_value={"profile_analysis": "Test", "recommendations": "Test"})
        discovery_service.stage2_service.generate_recommendations = Mock(return_value={"recommendations": "Test"})
        discovery_service.result_assembler.assemble = Mock(return_value={
            "profile_analysis": "Test",
            "personalized_recommendations": "Test"
        })
        
        with patch('app.services.discovery_service.ConflictDetector') as mock_conflict:
            mock_conflict.detect_conflicts = Mock(return_value=[])
            mock_conflict.build_user_message = Mock(return_value=None)
            with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
                result = discovery_service.run_discovery(test_inputs, user_id=test_user.user_id, run_id=run_id)
        
        assert result["run_id"] == run_id
        db_session.refresh(existing_run)
        assert existing_run.status == "completed"
    
    def test_run_discovery_error_handling(self, discovery_service, test_inputs, test_user):
        """Test error handling in discovery"""
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        discovery_service.profile_service.run = Mock(side_effect=Exception("Profile analysis failed"))
        discovery_service.error_log_service.log_error = Mock()
        
        with pytest.raises(Exception):
            discovery_service.run_discovery(test_inputs, user_id=test_user.user_id)
        
        # Verify run was marked as failed
        run = discovery_service.db.query(Run).filter(Run.user_id == test_user.user_id).first()
        assert run is not None
        assert run.status == "failed"
        assert run.error_message is not None
    
    def test_run_discovery_caches_result(self, discovery_service, test_inputs, test_user):
        """Test that successful discovery is cached"""
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        discovery_service.profile_service.run = Mock(return_value={"profile_analysis": "Test", "recommendations": "Test"})
        discovery_service.stage2_service.generate_recommendations = Mock(return_value={"recommendations": "Test"})
        discovery_service.result_assembler.assemble = Mock(return_value={
            "profile_analysis": "Test",
            "personalized_recommendations": "Test"
        })
        discovery_service.cache_service.set_json = Mock()
        
        with patch('app.services.discovery_service.ConflictDetector') as mock_conflict:
            mock_conflict.detect_conflicts = Mock(return_value=[])
            mock_conflict.build_user_message = Mock(return_value=None)
            with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
                discovery_service.run_discovery(test_inputs, user_id=test_user.user_id)
        
        # Verify result was cached
        discovery_service.cache_service.set_json.assert_called_once()
        call_args = discovery_service.cache_service.set_json.call_args
        assert call_args[0][0] == "cache_key"
        assert call_args[1]["ttl_seconds"] == 60 * 60 * 24 * 7  # 7 days
    
    def test_run_discovery_creates_discovery_result(self, discovery_service, test_inputs, test_user, db_session):
        """Test that discovery result is created"""
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        discovery_service.profile_service.run = Mock(return_value={"profile_analysis": "Test", "recommendations": "Test"})
        discovery_service.stage2_service.generate_recommendations = Mock(return_value={"recommendations": "Test"})
        discovery_service.result_assembler.assemble = Mock(return_value={
            "profile_analysis": "Test",
            "personalized_recommendations": "Test"
        })
        
        with patch('app.services.discovery_service.ConflictDetector') as mock_conflict:
            mock_conflict.detect_conflicts = Mock(return_value=[])
            mock_conflict.build_user_message = Mock(return_value=None)
            with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
                result = discovery_service.run_discovery(test_inputs, user_id=test_user.user_id)
        
        # Verify discovery result was created
        discovery_result = db_session.query(DiscoveryResult).filter(
            DiscoveryResult.run_id == result["run_id"]
        ).first()
        assert discovery_result is not None
        assert discovery_result.status == "completed"
    
    @pytest.mark.asyncio
    async def test_workflow_stream_success(self, discovery_service, test_inputs, test_user):
        """Test workflow streaming"""
        # Mock profile analysis
        # workflow_stream uses analyze_profile directly, not run()
        discovery_service.profile_service.analyze_profile = Mock(return_value={
            "profile_analysis": "Test profile analysis\n\n---PROFILE_END---\n\n"
        })
        
        # Mock profile formatter
        discovery_service.profile_formatter.format_profile_for_recommendations = Mock(
            return_value="Formatted profile"
        )
        
        # Mock LLM stream - workflow_stream calls llm_service.generate_stream directly
        async def mock_llm_stream(*args, **kwargs):
            yield "### IDEA_1\n"
            yield "title: Test Idea\n"
            yield "summary: Test summary\n\n"
        
        discovery_service.stage2_service.llm_service.generate_stream = mock_llm_stream
        
        # Mock determine_realism_level and static engine
        with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
            with patch('app.services.discovery_service.normalize_industry_name', return_value="technology"):
                with patch('app.static_engine.loader.load_industry_data', return_value=None):
                    chunks = []
                    async for chunk in discovery_service.workflow_stream(test_inputs, user_id=test_user.user_id):
                        chunks.append(chunk)
        
        # Verify profile was yielded
        content = "".join(chunks)
        assert "Test profile analysis" in content
        assert "---PROFILE_END---" in content
        assert "IDEA_1" in content
    
    @pytest.mark.asyncio
    async def test_workflow_stream_profile_error(self, discovery_service, test_inputs, test_user):
        """Test workflow stream handles profile analysis errors"""
        # workflow_stream uses analyze_profile directly
        discovery_service.profile_service.analyze_profile = Mock(
            side_effect=Exception("Profile analysis failed")
        )
        
        with pytest.raises(Exception):
            chunks = []
            async for chunk in discovery_service.workflow_stream(test_inputs, user_id=test_user.user_id):
                chunks.append(chunk)
    
    def test_run_discovery_with_conflicts(self, discovery_service, test_inputs, test_user):
        """Test discovery with conflict detection"""
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        discovery_service.profile_service.run = Mock(return_value={"profile_analysis": "Test", "recommendations": "Test"})
        discovery_service.stage2_service.generate_recommendations = Mock(return_value={"recommendations": "Test"})
        discovery_service.result_assembler.assemble = Mock(return_value={
            "profile_analysis": "Test",
            "personalized_recommendations": "Test"
        })
        
        conflicts = [{"type": "time_budget", "message": "Time and budget conflict"}]
        conflict_message = "Your time commitment and budget may conflict"
        
        with patch('app.services.discovery_service.ConflictDetector') as mock_conflict:
            mock_conflict.detect_conflicts = Mock(return_value=conflicts)
            mock_conflict.build_user_message = Mock(return_value=conflict_message)
            with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
                result = discovery_service.run_discovery(test_inputs, user_id=test_user.user_id)
        
        assert result["success"] is True
        assert "conflict_adjustment" in result["outputs"]
        assert result["outputs"]["conflict_adjustment"] == conflict_message
    
    def test_run_discovery_with_final_recommendation(self, discovery_service, test_inputs, test_user):
        """Test discovery generates final recommendation"""
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        discovery_service.profile_service.run = Mock(return_value={"profile_analysis": "Test", "recommendations": "Test"})
        discovery_service.stage2_service.generate_recommendations = Mock(return_value={"recommendations": "Test"})
        
        final_outputs = {
            "profile_analysis": "Test",
            "personalized_recommendations": "Test",
            "structured_recommendations": [{"title": "Idea 1"}]
        }
        discovery_service.result_assembler.assemble = Mock(return_value=final_outputs)
        
        discovery_service.final_recommendation_service.generate_final_recommendation = Mock(
            return_value="Final recommendation summary"
        )
        
        with patch('app.services.discovery_service.ConflictDetector') as mock_conflict:
            mock_conflict.detect_conflicts = Mock(return_value=[])
            mock_conflict.build_user_message = Mock(return_value=None)
            with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
                result = discovery_service.run_discovery(test_inputs, user_id=test_user.user_id)
        
        assert result["success"] is True
        assert "final_recommendation" in result["outputs"]
        assert result["outputs"]["final_recommendation"] == "Final recommendation summary"
    
    def test_run_discovery_no_user_id(self, discovery_service, test_inputs):
        """Test discovery without user_id"""
        discovery_service.cache_service.build_discovery_cache_key = Mock(return_value="cache_key")
        discovery_service.cache_service.get_json = Mock(return_value=None)
        discovery_service.profile_service.run = Mock(return_value={"profile_analysis": "Test", "recommendations": "Test"})
        discovery_service.stage2_service.generate_recommendations = Mock(return_value={"recommendations": "Test"})
        discovery_service.result_assembler.assemble = Mock(return_value={
            "profile_analysis": "Test",
            "personalized_recommendations": "Test"
        })
        
        with patch('app.services.discovery_service.ConflictDetector') as mock_conflict:
            mock_conflict.detect_conflicts = Mock(return_value=[])
            mock_conflict.build_user_message = Mock(return_value=None)
            with patch('app.services.discovery_service.determine_realism_level', return_value="realistic"):
                result = discovery_service.run_discovery(test_inputs, user_id=None)
        
        assert result["success"] is True
        # Run should have null user_id
        run = discovery_service.db.query(Run).filter(Run.run_id == result["run_id"]).first()
        assert run.user_id is None

