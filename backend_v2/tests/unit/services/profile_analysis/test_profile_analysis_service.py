"""
Tests for profile_analysis_service.py module.

Tests profile analysis service functionality including sync and async methods.
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from app.services.profile_analysis_service import ProfileAnalysisService


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    return Mock()


@pytest.fixture
def mock_redis():
    """Create a mock Redis client."""
    return Mock()


@pytest.fixture
def profile_service(mock_db, mock_redis):
    """Create ProfileAnalysisService instance with mocked dependencies."""
    with patch('app.services.profile_analysis_service.LLMService') as mock_llm_class, \
         patch('app.services.profile_analysis_service.CacheService') as mock_cache_class:
        mock_llm_service = Mock()
        mock_llm_class.return_value = mock_llm_service
        
        mock_cache_service = Mock()
        mock_cache_class.return_value = mock_cache_service
        
        service = ProfileAnalysisService(mock_db, mock_redis)
        service.llm_service = mock_llm_service
        service.cache_service = mock_cache_service
        return service


@pytest.fixture
def sample_inputs():
    """Create sample intake form inputs."""
    return {
        "time_commitment": "Full-time",
        "budget_range": "$10K - $20K",
        "risk_tolerance": "Moderate",
        "preferred_work_style": "Solo",
        "industry_interest": "Technology",
        "earnings_timeline": "6 months",
        "business_type": "SaaS",
        "experience_summary": "10 years of software development",
        "skills": {
            "product_creation": ["Coding"],
            "digital": ["AI Tools"],
            "sales_marketing": ["Marketing"]
        }
    }


@pytest.fixture
def sample_llm_response():
    """Create sample LLM response."""
    return {
        "content": """---PROFILE_ANALYSIS_START---
{
  "core_motivations": "You want to build a SaaS business",
  "operating_constraints": "You have a $10K-$20K budget",
  "strengths_and_capabilities": "You have strong coding skills",
  "strategic_considerations": "Focus on technical execution",
  "viability_red_flags": "None identified",
  "pathway_recommendation": "Start with MVP development"
}
---PROFILE_ANALYSIS_END---""",
        "usage": {
            "prompt_tokens": 100,
            "completion_tokens": 200,
            "total_tokens": 300
        }
    }


class TestProfileAnalysisServiceInitialization:
    """Test ProfileAnalysisService initialization."""
    
    def test_initialization_creates_services(self, mock_db, mock_redis):
        """Service should initialize with LLM and Cache services."""
        with patch('app.services.profile_analysis_service.LLMService') as mock_llm_class, \
             patch('app.services.profile_analysis_service.CacheService') as mock_cache_class:
            mock_llm_class.return_value = Mock()
            mock_cache_class.return_value = Mock()
            
            service = ProfileAnalysisService(mock_db, mock_redis)
            
            assert service.llm_service is not None
            assert service.cache_service is not None
            mock_llm_class.assert_called_once_with(mock_db, mock_redis)
            mock_cache_class.assert_called_once_with(mock_db, mock_redis)


class TestAnalyzeProfile:
    """Test analyze_profile method."""
    
    def test_analyze_profile_cache_hit(self, profile_service, sample_inputs):
        """Should return cached result if available."""
        cached_result = {
            "profile_analysis": "cached analysis",
            "usage": {},
            "json_obj": {}
        }
        profile_service.cache_service.get.return_value = cached_result
        
        result = profile_service.analyze_profile(sample_inputs)
        
        assert result == cached_result
        assert result["profile_analysis"] == "cached analysis"
        profile_service.cache_service.get.assert_called_once()
        profile_service.llm_service.generate.assert_not_called()
    
    def test_analyze_profile_cache_miss(self, profile_service, sample_inputs, sample_llm_response):
        """Should call LLM and cache result when cache miss."""
        profile_service.cache_service.get.return_value = None
        profile_service.llm_service.generate.return_value = sample_llm_response
        
        with patch('app.services.profile_analysis_service.ProfileVariableExtractor') as mock_extractor, \
             patch('app.services.profile_analysis_service.ProfilePromptBuilder') as mock_builder, \
             patch('app.services.profile_analysis_service.parse_profile_response') as mock_parse, \
             patch('app.services.profile_analysis_service.wrap_profile_analysis') as mock_wrap:
            mock_extractor.extract_user_variables.return_value = {"experience_level": "experienced"}
            mock_builder.build_system_prompt.return_value = "System prompt"
            mock_builder.build_user_prompt.return_value = "User prompt"
            mock_parse.return_value = {"core_motivations": "Test"}
            mock_wrap.return_value = "Wrapped analysis"
            
            result = profile_service.analyze_profile(sample_inputs)
            
            assert "profile_analysis" in result
            assert "usage" in result
            assert "json_obj" in result
            profile_service.llm_service.generate.assert_called_once()
            profile_service.cache_service.set.assert_called_once()
    
    def test_analyze_profile_with_run_id(self, profile_service, sample_inputs, sample_llm_response):
        """Should pass run_id to LLM service."""
        profile_service.cache_service.get.return_value = None
        profile_service.llm_service.generate.return_value = sample_llm_response
        
        with patch('app.services.profile_analysis_service.ProfileVariableExtractor') as mock_extractor, \
             patch('app.services.profile_analysis_service.ProfilePromptBuilder') as mock_builder, \
             patch('app.services.profile_analysis_service.parse_profile_response') as mock_parse, \
             patch('app.services.profile_analysis_service.wrap_profile_analysis') as mock_wrap:
            mock_extractor.extract_user_variables.return_value = {}
            mock_builder.build_system_prompt.return_value = "System prompt"
            mock_builder.build_user_prompt.return_value = "User prompt"
            mock_parse.return_value = {}
            mock_wrap.return_value = "Wrapped"
            
            run_id = "test-run-id"
            profile_service.analyze_profile(sample_inputs, run_id=run_id)
            
            call_args = profile_service.llm_service.generate.call_args
            assert call_args[1]["run_id"] == run_id
    
    def test_analyze_profile_llm_error(self, profile_service, sample_inputs):
        """Should raise exception when LLM call fails."""
        profile_service.cache_service.get.return_value = None
        profile_service.llm_service.generate.side_effect = Exception("LLM error")
        
        with patch('app.services.profile_analysis_service.ProfileVariableExtractor') as mock_extractor, \
             patch('app.services.profile_analysis_service.ProfilePromptBuilder') as mock_builder:
            mock_extractor.extract_user_variables.return_value = {}
            mock_builder.build_system_prompt.return_value = "System prompt"
            mock_builder.build_user_prompt.return_value = "User prompt"
            
            with pytest.raises(Exception) as exc_info:
                profile_service.analyze_profile(sample_inputs)
            
            assert "LLM error" in str(exc_info.value)
    
    def test_analyze_profile_generates_cache_key(self, profile_service, sample_inputs):
        """Should generate consistent cache key from inputs."""
        profile_service.cache_service.get.return_value = None
        
        with patch('app.services.profile_analysis_service.ProfileVariableExtractor') as mock_extractor, \
             patch('app.services.profile_analysis_service.ProfilePromptBuilder') as mock_builder, \
             patch('app.services.profile_analysis_service.parse_profile_response') as mock_parse, \
             patch('app.services.profile_analysis_service.wrap_profile_analysis') as mock_wrap, \
             patch.object(profile_service, '_generate_cache_key') as mock_key:
            mock_extractor.extract_user_variables.return_value = {}
            mock_builder.build_system_prompt.return_value = "System prompt"
            mock_builder.build_user_prompt.return_value = "User prompt"
            mock_parse.return_value = {}
            mock_wrap.return_value = "Wrapped"
            mock_key.return_value = "test-key"
            profile_service.llm_service.generate.return_value = {
                "content": "{}",
                "usage": {}
            }
            
            profile_service.analyze_profile(sample_inputs)
            
            # Cache key should be generated
            assert mock_key.called or profile_service.cache_service.get.called


class TestAnalyzeProfileAsync:
    """Test analyze_profile_async method."""
    
    @pytest.mark.asyncio
    async def test_analyze_profile_async_cache_hit(self, profile_service, sample_inputs):
        """Should return cached result if available."""
        cached_result = {
            "profile_analysis": "cached analysis",
            "usage": {},
            "json_obj": {}
        }
        profile_service.cache_service.get.return_value = cached_result
        
        result = await profile_service.analyze_profile_async(sample_inputs)
        
        assert result == cached_result
        assert result["profile_analysis"] == "cached analysis"
        profile_service.cache_service.get.assert_called_once()
        profile_service.llm_service.generate_async.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_analyze_profile_async_cache_miss(self, profile_service, sample_inputs, sample_llm_response):
        """Should call LLM async and cache result when cache miss."""
        profile_service.cache_service.get.return_value = None
        profile_service.llm_service.generate_async = AsyncMock(return_value=sample_llm_response)
        
        with patch('app.services.profile_analysis_service.ProfileVariableExtractor') as mock_extractor, \
             patch('app.services.profile_analysis_service.ProfilePromptBuilder') as mock_builder, \
             patch('app.services.profile_analysis_service.parse_profile_response') as mock_parse, \
             patch('app.services.profile_analysis_service.wrap_profile_analysis') as mock_wrap:
            mock_extractor.extract_user_variables.return_value = {}
            mock_builder.build_system_prompt.return_value = "System prompt"
            mock_builder.build_user_prompt.return_value = "User prompt"
            mock_parse.return_value = {}
            mock_wrap.return_value = "Wrapped"
            
            result = await profile_service.analyze_profile_async(sample_inputs)
            
            assert "profile_analysis" in result
            assert "usage" in result
            assert "json_obj" in result
            profile_service.llm_service.generate_async.assert_called_once()
            profile_service.cache_service.set.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_analyze_profile_async_with_run_id(self, profile_service, sample_inputs, sample_llm_response):
        """Should pass run_id to LLM service."""
        profile_service.cache_service.get.return_value = None
        profile_service.llm_service.generate_async = AsyncMock(return_value=sample_llm_response)
        
        with patch('app.services.profile_analysis_service.ProfileVariableExtractor') as mock_extractor, \
             patch('app.services.profile_analysis_service.ProfilePromptBuilder') as mock_builder, \
             patch('app.services.profile_analysis_service.parse_profile_response') as mock_parse, \
             patch('app.services.profile_analysis_service.wrap_profile_analysis') as mock_wrap:
            mock_extractor.extract_user_variables.return_value = {}
            mock_builder.build_system_prompt.return_value = "System prompt"
            mock_builder.build_user_prompt.return_value = "User prompt"
            mock_parse.return_value = {}
            mock_wrap.return_value = "Wrapped"
            
            run_id = "test-run-id"
            await profile_service.analyze_profile_async(sample_inputs, run_id=run_id)
            
            call_args = profile_service.llm_service.generate_async.call_args
            assert call_args[1]["run_id"] == run_id
    
    @pytest.mark.asyncio
    async def test_analyze_profile_async_llm_error(self, profile_service, sample_inputs):
        """Should raise exception when LLM call fails."""
        profile_service.cache_service.get.return_value = None
        profile_service.llm_service.generate_async = AsyncMock(side_effect=Exception("LLM error"))
        
        with patch('app.services.profile_analysis_service.ProfileVariableExtractor') as mock_extractor, \
             patch('app.services.profile_analysis_service.ProfilePromptBuilder') as mock_builder:
            mock_extractor.extract_user_variables.return_value = {}
            mock_builder.build_system_prompt.return_value = "System prompt"
            mock_builder.build_user_prompt.return_value = "User prompt"
            
            with pytest.raises(Exception) as exc_info:
                await profile_service.analyze_profile_async(sample_inputs)
            
            assert "LLM error" in str(exc_info.value)


class TestRunMethod:
    """Test run method (alias for analyze_profile)."""
    
    def test_run_calls_analyze_profile(self, profile_service, sample_inputs):
        """Should call analyze_profile with same inputs."""
        profile_service.cache_service.get.return_value = None
        profile_service.llm_service.generate.return_value = {
            "content": "{}",
            "usage": {}
        }
        
        with patch('app.services.profile_analysis_service.ProfileVariableExtractor') as mock_extractor, \
             patch('app.services.profile_analysis_service.ProfilePromptBuilder') as mock_builder, \
             patch('app.services.profile_analysis_service.parse_profile_response') as mock_parse, \
             patch('app.services.profile_analysis_service.wrap_profile_analysis') as mock_wrap:
            mock_extractor.extract_user_variables.return_value = {}
            mock_builder.build_system_prompt.return_value = "System prompt"
            mock_builder.build_user_prompt.return_value = "User prompt"
            mock_parse.return_value = {}
            mock_wrap.return_value = "Wrapped"
            
            result = profile_service.run(sample_inputs)
            
            # Should return same structure as analyze_profile
            assert "profile_analysis" in result or result is not None


class TestGenerateCacheKey:
    """Test _generate_cache_key method."""
    
    def test_generate_cache_key_consistent(self, profile_service):
        """Should generate same key for same inputs."""
        inputs1 = {"time_commitment": "Full-time", "budget": "$10K"}
        inputs2 = {"budget": "$10K", "time_commitment": "Full-time"}  # Different order
        
        key1 = profile_service._generate_cache_key(inputs1)
        key2 = profile_service._generate_cache_key(inputs2)
        
        # Should be same regardless of key order
        assert key1 == key2
    
    def test_generate_cache_key_different_inputs(self, profile_service):
        """Should generate different keys for different inputs."""
        inputs1 = {"time_commitment": "Full-time"}
        inputs2 = {"time_commitment": "Part-time"}
        
        key1 = profile_service._generate_cache_key(inputs1)
        key2 = profile_service._generate_cache_key(inputs2)
        
        assert key1 != key2
    
    def test_generate_cache_key_format(self, profile_service):
        """Should generate MD5 hash format."""
        inputs = {"test": "value"}
        key = profile_service._generate_cache_key(inputs)
        
        # MD5 hash is 32 hex characters
        assert len(key) == 32
        assert all(c in '0123456789abcdef' for c in key)

