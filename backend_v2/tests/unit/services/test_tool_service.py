"""
Tests for tool_service.py module.

Tests idea enrichment functionality including streaming and non-streaming modes.
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from app.services.tool_service import ToolService


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    return Mock()


@pytest.fixture
def mock_redis():
    """Create a mock Redis client."""
    return Mock()


@pytest.fixture
def tool_service(mock_db, mock_redis):
    """Create ToolService instance with mocked dependencies."""
    with patch('app.services.tool_service.LLMService') as mock_llm_class, \
         patch('app.services.tool_service.PsycheScoringService') as mock_psyche_class, \
         patch('app.services.tool_service.write_to_log'), \
         patch('app.services.tool_service.write_section_to_log'):
        mock_llm_service = Mock()
        mock_llm_class.return_value = mock_llm_service
        
        mock_psyche_service = Mock()
        mock_psyche_class.return_value = mock_psyche_service
        
        service = ToolService(mock_db, mock_redis)
        service.llm_service = mock_llm_service
        service.psyche_scoring_service = mock_psyche_service
        return service


@pytest.fixture
def sample_idea():
    """Create a sample idea dictionary."""
    return {
        "title": "AI-Powered Task Manager",
        "summary": "An intelligent task management system that learns from user behavior",
        "target_market": "Small businesses and freelancers",
        "revenue_model": "Subscription-based SaaS"
    }


@pytest.fixture
def sample_profile():
    """Create a sample profile analysis dictionary."""
    return {
        "core_motivations": "Build a scalable tech business",
        "operating_constraints": "Limited budget, part-time availability",
        "strengths_and_capabilities": "Strong technical skills, experience with APIs",
        "strategic_considerations": "Focus on automation and scalability",
        "viability_red_flags": "None identified"
    }


class TestToolServiceInitialization:
    """Test ToolService initialization."""
    
    def test_initialization_creates_services(self, mock_db, mock_redis):
        """Service should initialize with LLM and Psyche services."""
        with patch('app.services.tool_service.LLMService') as mock_llm_class, \
             patch('app.services.tool_service.PsycheScoringService') as mock_psyche_class, \
             patch('app.services.tool_service.write_to_log'):
            mock_llm_class.return_value = Mock()
            mock_psyche_class.return_value = Mock()
            
            service = ToolService(mock_db, mock_redis)
            
            assert service.llm_service is not None
            assert service.psyche_scoring_service is not None
            mock_llm_class.assert_called_once_with(mock_db, mock_redis)
            mock_psyche_class.assert_called_once_with(mock_db, mock_redis)


class TestEnrichIdeaStream:
    """Test enrich_idea_stream method."""
    
    @pytest.mark.asyncio
    async def test_enrich_idea_stream_success(self, tool_service, sample_idea, sample_profile):
        """Should successfully stream enrichment for valid idea."""
        # Mock streaming response
        async def mock_stream():
            yield "data: chunk1\n\n"
            yield "data: chunk2\n\n"
            yield "data: [DONE]\n\n"
        
        tool_service.llm_service.generate_stream = AsyncMock(return_value=mock_stream())
        
        chunks = []
        async for chunk in tool_service.enrich_idea_stream(
            idea=sample_idea,
            industry="AI",
            profile_analysis=sample_profile,
            run_id="test_run_123"
        ):
            chunks.append(chunk)
        
        assert len(chunks) > 0
        tool_service.llm_service.generate_stream.assert_called_once()
        call_kwargs = tool_service.llm_service.generate_stream.call_args[1]
        assert call_kwargs["temperature"] == 0.4
        assert call_kwargs["max_tokens"] == 4000
        assert call_kwargs["run_id"] == "test_run_123"
    
    @pytest.mark.asyncio
    async def test_enrich_idea_stream_missing_title(self, tool_service, sample_idea, sample_profile):
        """Should return error when title is missing."""
        idea_no_title = sample_idea.copy()
        del idea_no_title["title"]
        
        chunks = []
        async for chunk in tool_service.enrich_idea_stream(
            idea=idea_no_title,
            industry="AI",
            profile_analysis=sample_profile
        ):
            chunks.append(chunk)
        
        assert len(chunks) == 1
        assert "[ERROR]" in chunks[0]
        assert "title" in chunks[0].lower()
        tool_service.llm_service.generate_stream.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_enrich_idea_stream_missing_summary(self, tool_service, sample_idea, sample_profile):
        """Should return error when summary is missing."""
        idea_no_summary = sample_idea.copy()
        del idea_no_summary["summary"]
        
        chunks = []
        async for chunk in tool_service.enrich_idea_stream(
            idea=idea_no_summary,
            industry="AI",
            profile_analysis=sample_profile
        ):
            chunks.append(chunk)
        
        assert len(chunks) == 1
        assert "[ERROR]" in chunks[0]
        assert "summary" in chunks[0].lower()
        tool_service.llm_service.generate_stream.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_enrich_idea_stream_empty_title(self, tool_service, sample_idea, sample_profile):
        """Should return error when title is empty."""
        idea_empty_title = sample_idea.copy()
        idea_empty_title["title"] = ""
        
        chunks = []
        async for chunk in tool_service.enrich_idea_stream(
            idea=idea_empty_title,
            industry="AI",
            profile_analysis=sample_profile
        ):
            chunks.append(chunk)
        
        assert len(chunks) == 1
        assert "[ERROR]" in chunks[0]
    
    @pytest.mark.asyncio
    async def test_enrich_idea_stream_llm_error(self, tool_service, sample_idea, sample_profile):
        """Should handle LLM service errors gracefully."""
        tool_service.llm_service.generate_stream = AsyncMock(side_effect=Exception("LLM error"))
        
        chunks = []
        async for chunk in tool_service.enrich_idea_stream(
            idea=sample_idea,
            industry="AI",
            profile_analysis=sample_profile
        ):
            chunks.append(chunk)
        
        assert len(chunks) == 1
        assert "[ERROR]" in chunks[0]
        assert "Enrichment failed" in chunks[0]


class TestEnrichIdea:
    """Test enrich_idea method."""
    
    def test_enrich_idea_success(self, tool_service, sample_idea, sample_profile):
        """Should successfully enrich valid idea."""
        mock_response = {
            "content": """### Intro
Introduction text

### Why this Idea Fits You
Fits because...

### Financial Snapshot
Financial details"""
        }
        
        tool_service.llm_service.generate = Mock(return_value=mock_response)
        
        result = tool_service.enrich_idea(
            idea=sample_idea,
            industry="AI",
            profile_analysis=sample_profile,
            run_id="test_run_123"
        )
        
        assert "parsed" in result
        assert "raw_content" in result
        assert result["parsed"]["intro"] != ""
        tool_service.llm_service.generate.assert_called_once()
        call_kwargs = tool_service.llm_service.generate.call_args[1]
        assert call_kwargs["temperature"] == 0.4
        assert call_kwargs["max_tokens"] == 4000
    
    def test_enrich_idea_missing_title(self, tool_service, sample_idea, sample_profile):
        """Should return empty result when title is missing."""
        idea_no_title = sample_idea.copy()
        del idea_no_title["title"]
        
        result = tool_service.enrich_idea(
            idea=idea_no_title,
            industry="AI",
            profile_analysis=sample_profile
        )
        
        # When title/summary missing, enrich_idea returns _get_empty_enrichment_output() directly
        # which is just the dict of empty fields, not wrapped
        assert isinstance(result, dict)
        # All fields should be empty strings
        assert all(v == "" for v in result.values())
        # Should have all expected fields
        expected_fields = [
            "intro", "why_fits", "financial_snapshot", "execution_path",
            "customer_persona", "market_opportunity", "key_risks",
            "validation_questions", "immediate_experiments", "immediate_next_steps",
            "timeline_effort", "decision_checklist", "additional_insights"
        ]
        for field in expected_fields:
            assert field in result
        tool_service.llm_service.generate.assert_not_called()
    
    def test_enrich_idea_missing_summary(self, tool_service, sample_idea, sample_profile):
        """Should return empty result when summary is missing."""
        idea_no_summary = sample_idea.copy()
        del idea_no_summary["summary"]
        
        result = tool_service.enrich_idea(
            idea=idea_no_summary,
            industry="AI",
            profile_analysis=sample_profile
        )
        
        # When title/summary missing, enrich_idea returns _get_empty_enrichment_output() directly
        assert isinstance(result, dict)
        assert all(v == "" for v in result.values())
        tool_service.llm_service.generate.assert_not_called()
    
    def test_enrich_idea_llm_error(self, tool_service, sample_idea, sample_profile):
        """Should handle LLM service errors gracefully."""
        tool_service.llm_service.generate = Mock(side_effect=Exception("LLM error"))
        
        result = tool_service.enrich_idea(
            idea=sample_idea,
            industry="AI",
            profile_analysis=sample_profile
        )
        
        assert "parsed" in result
        assert "raw_content" in result
        assert all(v == "" for v in result["parsed"].values())
        assert result["raw_content"] == ""


class TestBuildEnrichmentPrompt:
    """Test _build_enrichment_prompt method."""
    
    def test_build_prompt_with_full_profile(self, tool_service, sample_idea, sample_profile):
        """Should build prompt with all profile fields."""
        prompt = tool_service._build_enrichment_prompt(
            idea=sample_idea,
            industry="AI",
            profile=sample_profile
        )
        
        assert sample_idea["title"] in prompt
        assert sample_idea["summary"] in prompt
        assert "AI" in prompt
        assert sample_profile["core_motivations"] in prompt
        assert sample_profile["operating_constraints"] in prompt
        assert sample_profile["strengths_and_capabilities"] in prompt
    
    def test_build_prompt_with_string_profile(self, tool_service, sample_idea):
        """Should handle string profile gracefully."""
        prompt = tool_service._build_enrichment_prompt(
            idea=sample_idea,
            industry="AI",
            profile="This is a string profile"
        )
        
        assert sample_idea["title"] in prompt
        assert "AI" in prompt
    
    def test_build_prompt_with_none_profile(self, tool_service, sample_idea):
        """Should handle None profile gracefully."""
        prompt = tool_service._build_enrichment_prompt(
            idea=sample_idea,
            industry="AI",
            profile=None
        )
        
        assert sample_idea["title"] in prompt
        assert "AI" in prompt
    
    def test_build_prompt_with_user_id_and_psyche(self, tool_service, sample_idea, sample_profile):
        """Should include psyche profile when user_id is provided."""
        mock_psyche_profile = {
            "personality": {
                "O": 0.8,  # High openness
                "C": 0.7,  # High conscientiousness
                "E": 0.3,  # Low extraversion
                "A": 0.6,  # Medium agreeableness
                "N": 0.4   # Low neuroticism
            },
            "decision_style": {
                "risk": 0.3,
                "speed_vs_certainty": 0.7,
                "maximize": 0.6
            },
            "motivation": {
                "mastery": 0.5,
                "autonomy": 0.3,
                "purpose": 0.2
            }
        }
        
        tool_service.psyche_scoring_service.get_profile_for_ai = Mock(return_value=mock_psyche_profile)
        
        prompt = tool_service._build_enrichment_prompt(
            idea=sample_idea,
            industry="AI",
            profile=sample_profile,
            user_id="test_user_123"
        )
        
        assert "USER WORK PREFERENCES" in prompt
        assert "How User Prefers to Work" in prompt
        assert "Decision-Making Approach" in prompt
        assert "What Drives the User" in prompt
        tool_service.psyche_scoring_service.get_profile_for_ai.assert_called_once_with("test_user_123")
    
    def test_build_prompt_without_psyche_profile(self, tool_service, sample_idea, sample_profile):
        """Should work without psyche profile."""
        tool_service.psyche_scoring_service.get_profile_for_ai = Mock(return_value=None)
        
        prompt = tool_service._build_enrichment_prompt(
            idea=sample_idea,
            industry="AI",
            profile=sample_profile,
            user_id="test_user_123"
        )
        
        assert sample_idea["title"] in prompt
        assert "USER WORK PREFERENCES" not in prompt


class TestBuildEnrichmentSystemPrompt:
    """Test _build_enrichment_system_prompt method."""
    
    def test_system_prompt_contains_required_sections(self, tool_service):
        """System prompt should contain all required section headings."""
        prompt = tool_service._build_enrichment_system_prompt()
        
        required_sections = [
            "### Intro",
            "### Why this Idea Fits You",
            "### Financial Snapshot",
            "### Execution Path",
            "### Customer Persona",
            "### Market Opportunity",
            "### Key Risks & Mitigations",
            "### Validation Questions",
            "### Immediate Experiments",
            "### Immediate Next Steps",
            "### Timeline & Effort",
            "### Decision Checklist",
            "### Additional Insights"
        ]
        
        for section in required_sections:
            assert section in prompt, f"Missing section: {section}"
    
    def test_system_prompt_contains_instructions(self, tool_service):
        """System prompt should contain formatting instructions."""
        prompt = tool_service._build_enrichment_system_prompt()
        
        assert "markdown format" in prompt.lower()
        assert "exactly" in prompt.lower() or "exact" in prompt.lower()
        assert "heading" in prompt.lower()


class TestParseEnrichmentResponse:
    """Test _parse_enrichment_response method."""
    
    def test_parse_complete_response(self, tool_service):
        """Should parse complete markdown response with all sections."""
        content = """### Intro
This is the introduction.

### Why this Idea Fits You
This fits because...

### Financial Snapshot
Financial details here.

### Execution Path
Execution steps.

### Customer Persona
Customer description.

### Market Opportunity
Market analysis.

### Key Risks & Mitigations
Risks and mitigations.

### Validation Questions
Question 1?
Question 2?

### Immediate Experiments
Experiment 1
Experiment 2

### Immediate Next Steps
Step 1
Step 2

### Timeline & Effort
Timeline details.

### Decision Checklist
Checklist items.

### Additional Insights
Additional information."""
        
        result = tool_service._parse_enrichment_response(content)
        
        assert result["intro"] != ""
        assert result["why_fits"] != ""
        assert result["financial_snapshot"] != ""
        assert result["execution_path"] != ""
        assert result["customer_persona"] != ""
        assert result["market_opportunity"] != ""
        assert result["key_risks"] != ""
        assert result["validation_questions"] != ""
        assert result["immediate_experiments"] != ""
        assert result["immediate_next_steps"] != ""
        assert result["timeline_effort"] != ""
        assert result["decision_checklist"] != ""
        assert result["additional_insights"] != ""
    
    def test_parse_partial_response(self, tool_service):
        """Should parse partial response with only some sections."""
        content = """### Intro
Introduction text.

### Financial Snapshot
Financial info."""
        
        result = tool_service._parse_enrichment_response(content)
        
        assert result["intro"] != ""
        assert result["financial_snapshot"] != ""
        # Other fields should be empty
        assert result["why_fits"] == ""
        assert result["execution_path"] == ""
    
    def test_parse_empty_response(self, tool_service):
        """Should return empty structure for empty response."""
        result = tool_service._parse_enrichment_response("")
        
        assert all(v == "" for v in result.values())
    
    def test_parse_response_with_whitespace(self, tool_service):
        """Should handle whitespace in response."""
        content = """### Intro
   Introduction with spaces.
   
### Financial Snapshot
   Financial details."""
        
        result = tool_service._parse_enrichment_response(content)
        
        assert result["intro"] != ""
        assert result["financial_snapshot"] != ""
    
    def test_parse_response_with_variations(self, tool_service):
        """Should handle heading variations."""
        content = """### Intro
Introduction.

### Key Risks & Mitigations
Risks here.

### Timeline & Effort
Timeline here."""
        
        result = tool_service._parse_enrichment_response(content)
        
        assert result["intro"] != ""
        assert result["key_risks"] != ""
        assert result["timeline_effort"] != ""


class TestGetEmptyEnrichmentOutput:
    """Test _get_empty_enrichment_output method."""
    
    def test_returns_all_fields(self, tool_service):
        """Should return structure with all required fields."""
        result = tool_service._get_empty_enrichment_output()
        
        expected_fields = [
            "intro", "why_fits", "financial_snapshot", "execution_path",
            "customer_persona", "market_opportunity", "key_risks",
            "validation_questions", "immediate_experiments", "immediate_next_steps",
            "timeline_effort", "decision_checklist", "additional_insights"
        ]
        
        for field in expected_fields:
            assert field in result
            assert result[field] == ""

