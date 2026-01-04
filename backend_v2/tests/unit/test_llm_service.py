"""Unit tests for LLMService"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import json

from app.services.llm_service import LLMService


@pytest.mark.unit
class TestLLMService:
    """Test LLM service operations"""
    
    @pytest.fixture
    def mock_openai_client(self):
        """Mock OpenAI client"""
        client = Mock()
        response = Mock()
        response.choices = [Mock()]
        response.choices[0].message = Mock()
        response.choices[0].message.content = "Test response"
        response.usage = Mock()
        response.usage.prompt_tokens = 10
        response.usage.completion_tokens = 20
        response.usage.total_tokens = 30
        response.model = "gpt-4o-mini"
        client.chat.completions.create = Mock(return_value=response)
        return client
    
    @pytest.fixture
    def mock_anthropic_client(self):
        """Mock Anthropic client"""
        client = Mock()
        response = Mock()
        response.content = [Mock()]
        response.content[0].text = "Test response"
        response.usage = Mock()
        response.usage.input_tokens = 10
        response.usage.output_tokens = 20
        response.model = "claude-3-haiku"
        client.messages.create = Mock(return_value=response)
        return client
    
    @pytest.fixture
    def llm_service_openai(self, db_session, mock_openai_client):
        """Create LLM service with OpenAI"""
        with patch('app.services.llm_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "test_key"
            mock_settings.ANTHROPIC_API_KEY = None
            mock_settings.DEFAULT_LLM_PROVIDER = "openai"
            mock_settings.DEFAULT_MODEL = "gpt-4o-mini"
            
            service = LLMService(db_session)
            service.openai_client = mock_openai_client
            return service
    
    @pytest.fixture
    def llm_service_anthropic(self, db_session, mock_anthropic_client):
        """Create LLM service with Anthropic"""
        with patch('app.services.llm_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = None
            mock_settings.ANTHROPIC_API_KEY = "test_key"
            mock_settings.DEFAULT_LLM_PROVIDER = "anthropic"
            mock_settings.DEFAULT_MODEL = "claude-3-haiku"
            
            service = LLMService(db_session)
            service.anthropic_client = mock_anthropic_client
            return service
    
    def test_generate_openai_success(self, llm_service_openai, mock_openai_client):
        """Test successful OpenAI generation"""
        result = llm_service_openai.generate(
            prompt="Test prompt",
            system_prompt="System prompt",
            provider="openai",
            model="gpt-4o-mini"
        )
        
        assert result["content"] == "Test response"
        assert result["provider"] == "openai"
        assert result["model"] == "gpt-4o-mini"
        assert "usage" in result
        assert result["usage"]["prompt_tokens"] == 10
        assert result["usage"]["completion_tokens"] == 20
        mock_openai_client.chat.completions.create.assert_called_once()
    
    def test_generate_anthropic_success(self, llm_service_anthropic, mock_anthropic_client):
        """Test successful Anthropic generation"""
        result = llm_service_anthropic.generate(
            prompt="Test prompt",
            system_prompt="System prompt",
            provider="anthropic",
            model="claude-3-haiku"
        )
        
        assert result["content"] == "Test response"
        assert result["provider"] == "anthropic"
        assert result["model"] == "claude-3-haiku"
        assert "usage" in result
        mock_anthropic_client.messages.create.assert_called_once()
    
    def test_generate_openai_no_system_prompt(self, llm_service_openai, mock_openai_client):
        """Test OpenAI generation without system prompt"""
        result = llm_service_openai.generate(
            prompt="Test prompt",
            provider="openai"
        )
        
        assert result["content"] == "Test response"
        call_args = mock_openai_client.chat.completions.create.call_args
        messages = call_args[1]["messages"]
        # Should only have user message, no system message
        assert len(messages) == 1
        assert messages[0]["role"] == "user"
    
    def test_generate_anthropic_no_system_prompt(self, llm_service_anthropic, mock_anthropic_client):
        """Test Anthropic generation without system prompt"""
        result = llm_service_anthropic.generate(
            prompt="Test prompt",
            provider="anthropic"
        )
        
        assert result["content"] == "Test response"
        call_args = mock_anthropic_client.messages.create.call_args
        # Should not have system in kwargs
        assert "system" not in call_args[1]
    
    def test_generate_openai_no_client(self, db_session):
        """Test OpenAI generation when client not initialized"""
        with patch('app.services.llm_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = None
            mock_settings.ANTHROPIC_API_KEY = None
            
            service = LLMService(db_session)
            service.openai_client = None
        
        with pytest.raises(ValueError, match="OpenAI API key not configured"):
            service.generate(prompt="Test", provider="openai")
    
    def test_generate_anthropic_no_client(self, db_session):
        """Test Anthropic generation when client not initialized"""
        with patch('app.services.llm_service.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = None
            mock_settings.ANTHROPIC_API_KEY = None
            
            service = LLMService(db_session)
            service.anthropic_client = None
        
        with pytest.raises(ValueError, match="Anthropic API key not configured"):
            service.generate(prompt="Test", provider="anthropic")
    
    def test_generate_unknown_provider(self, llm_service_openai):
        """Test generation with unknown provider"""
        with pytest.raises(ValueError, match="Unknown provider"):
            llm_service_openai.generate(prompt="Test", provider="unknown")
    
    def test_generate_uses_default_provider(self, llm_service_openai, mock_openai_client):
        """Test that default provider is used when not specified"""
        with patch('app.services.llm_service.settings') as mock_settings:
            mock_settings.DEFAULT_LLM_PROVIDER = "openai"
            mock_settings.DEFAULT_MODEL = "gpt-4o-mini"
            
            result = llm_service_openai.generate(prompt="Test")
            
            assert result["provider"] == "openai"
            assert result["model"] == "gpt-4o-mini"
    
    def test_validate_max_tokens(self, llm_service_openai):
        """Test max_tokens validation"""
        # Test with model limit
        result = llm_service_openai._validate_max_tokens("gpt-4o-mini", 20000)
        assert result == 16384  # Should be capped to model limit
        
        # Test within limit
        result = llm_service_openai._validate_max_tokens("gpt-4o-mini", 1000)
        assert result == 1000
        
        # Test with unknown model (defaults to 4096)
        result = llm_service_openai._validate_max_tokens("unknown-model", 10000)
        assert result == 4096
    
    def test_generate_structured_openai(self, llm_service_openai, mock_openai_client):
        """Test structured generation with OpenAI"""
        # Mock JSON response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message = Mock()
        mock_response.choices[0].message.content = '{"key": "value"}'
        mock_response.usage = Mock()
        mock_response.usage.prompt_tokens = 10
        mock_response.usage.completion_tokens = 20
        mock_response.usage.total_tokens = 30
        mock_response.model = "gpt-4o-mini"
        mock_openai_client.chat.completions.create.return_value = mock_response
        
        schema = {
            "type": "object",
            "properties": {"key": {"type": "string"}}
        }
        
        result = llm_service_openai.generate_structured(
            prompt="Test prompt",
            schema=schema,
            provider="openai"
        )
        
        assert isinstance(result, dict)
        assert result["key"] == "value"
        # Verify response_format was set
        call_args = mock_openai_client.chat.completions.create.call_args
        assert call_args[1]["response_format"] == {"type": "json_object"}
    
    def test_generate_structured_anthropic(self, llm_service_anthropic, mock_anthropic_client):
        """Test structured generation with Anthropic"""
        # Mock JSON response
        mock_response = Mock()
        mock_response.content = [Mock()]
        mock_response.content[0].text = '{"key": "value"}'
        mock_response.usage = Mock()
        mock_response.usage.input_tokens = 10
        mock_response.usage.output_tokens = 20
        mock_response.model = "claude-3-haiku"
        mock_anthropic_client.messages.create.return_value = mock_response
        
        schema = {
            "type": "object",
            "properties": {"key": {"type": "string"}}
        }
        
        result = llm_service_anthropic.generate_structured(
            prompt="Test prompt",
            schema=schema,
            provider="anthropic"
        )
        
        assert isinstance(result, dict)
        assert result["key"] == "value"
        # Verify schema was added to prompt
        call_args = mock_anthropic_client.messages.create.call_args
        assert "schema" in call_args[1]["messages"][0]["content"].lower()
    
    def test_generate_structured_invalid_json(self, llm_service_openai, mock_openai_client):
        """Test structured generation with invalid JSON"""
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message = Mock()
        mock_response.choices[0].message.content = "Not valid JSON"
        mock_response.usage = Mock()
        mock_response.usage.prompt_tokens = 10
        mock_response.usage.completion_tokens = 20
        mock_response.usage.total_tokens = 30
        mock_response.model = "gpt-4o-mini"
        mock_openai_client.chat.completions.create.return_value = mock_response
        
        with pytest.raises((ValueError, json.JSONDecodeError)):
            llm_service_openai.generate_structured(
                prompt="Test prompt",
                schema={"type": "object"}
            )
    
    def test_calculate_cost_openai(self, llm_service_openai):
        """Test cost calculation for OpenAI"""
        cost = llm_service_openai._calculate_cost("gpt-4o-mini", 1000, 2000)
        
        # Should calculate based on pricing
        assert isinstance(cost, float)
        assert cost >= 0
    
    def test_calculate_cost_anthropic(self, llm_service_anthropic):
        """Test cost calculation for Anthropic"""
        cost = llm_service_anthropic._calculate_cost("claude-3-haiku", 1000, 2000)
        
        # Currently returns 0 for Anthropic (placeholder)
        assert isinstance(cost, float)
        assert cost >= 0
    
    def test_log_usage(self, llm_service_openai, db_session):
        """Test that usage is logged to database"""
        from app.models.llm_usage import LLMUsage
        import uuid
        
        run_id = str(uuid.uuid4())
        llm_service_openai._log_usage(
            run_id=run_id,
            model="gpt-4o-mini",
            usage={"prompt_tokens": 100, "completion_tokens": 200, "total_tokens": 300},
            cost_usd=0.01
        )
        
        # Verify usage was logged
        usage = db_session.query(LLMUsage).filter(
            LLMUsage.run_id == run_id
        ).first()
        assert usage is not None
        assert usage.model == "gpt-4o-mini"
        assert usage.prompt_tokens == 100
        assert usage.completion_tokens == 200
    
    def test_generate_with_custom_temperature(self, llm_service_openai, mock_openai_client):
        """Test generation with custom temperature"""
        result = llm_service_openai.generate(
            prompt="Test",
            temperature=0.9
        )
        
        call_args = mock_openai_client.chat.completions.create.call_args
        assert call_args[1]["temperature"] == 0.9
    
    def test_generate_with_custom_max_tokens(self, llm_service_openai, mock_openai_client):
        """Test generation with custom max_tokens"""
        result = llm_service_openai.generate(
            prompt="Test",
            max_tokens=5000
        )
        
        call_args = mock_openai_client.chat.completions.create.call_args
        # Should be capped to model limit
        assert call_args[1]["max_tokens"] <= 16384  # gpt-4o-mini limit
    
    def test_generate_with_run_id(self, llm_service_openai, db_session):
        """Test that run_id is passed to usage logging"""
        from app.models.llm_usage import LLMUsage
        import uuid
        
        run_id = str(uuid.uuid4())
        llm_service_openai.generate(
            prompt="Test",
            run_id=run_id
        )
        
        # Verify usage was logged with run_id
        usage = db_session.query(LLMUsage).filter(
            LLMUsage.run_id == run_id
        ).first()
        assert usage is not None

