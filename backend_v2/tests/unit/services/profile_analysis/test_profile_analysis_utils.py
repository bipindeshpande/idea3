"""
Tests for profile_analysis_utils.py module.

Tests JSON cleaning, parsing, validation, and wrapping functions.
"""
import pytest
import json
from app.services.profile_analysis.profile_analysis_utils import (
    clean_profile_analysis,
    parse_profile_response,
    wrap_profile_analysis,
    PROFILE_START_MARKER,
    PROFILE_END_MARKER,
    REQUIRED_PROFILE_KEYS
)


class TestCleanProfileAnalysis:
    """Tests for clean_profile_analysis function"""
    
    def test_clean_with_delimiters_valid_json(self):
        """Test cleaning profile analysis with valid JSON in delimiters"""
        json_content = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints",
            "strengths_and_capabilities": "Test strengths",
            "strategic_considerations": "Test considerations",
            "viability_red_flags": "Test flags",
            "pathway_recommendation": "Test pathway"
        }
        text = f"{PROFILE_START_MARKER}\n{json.dumps(json_content)}\n{PROFILE_END_MARKER}"
        
        result = clean_profile_analysis(text)
        
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
        assert "Test motivation" in result
        parsed = json.loads(result.split(PROFILE_START_MARKER)[1].split(PROFILE_END_MARKER)[0].strip())
        assert parsed["core_motivations"] == "Test motivation"
    
    def test_clean_with_delimiters_missing_keys(self):
        """Test cleaning profile analysis with missing required keys"""
        json_content = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints"
            # Missing other keys
        }
        text = f"{PROFILE_START_MARKER}\n{json.dumps(json_content)}\n{PROFILE_END_MARKER}"
        
        result = clean_profile_analysis(text)
        
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
        parsed = json.loads(result.split(PROFILE_START_MARKER)[1].split(PROFILE_END_MARKER)[0].strip())
        # All required keys should be present
        for key in REQUIRED_PROFILE_KEYS:
            assert key in parsed
    
    def test_clean_with_delimiters_invalid_json(self):
        """Test cleaning profile analysis with invalid JSON in delimiters"""
        text = f"{PROFILE_START_MARKER}\n{{invalid json}}\n{PROFILE_END_MARKER}"
        
        result = clean_profile_analysis(text)
        
        # Should return empty JSON structure with delimiters
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
        parsed = json.loads(result.split(PROFILE_START_MARKER)[1].split(PROFILE_END_MARKER)[0].strip())
        for key in REQUIRED_PROFILE_KEYS:
            assert key in parsed
            assert parsed[key] == ""
    
    def test_clean_without_delimiters_valid_json(self):
        """Test cleaning profile analysis without delimiters but with valid JSON"""
        json_content = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints",
            "strengths_and_capabilities": "Test strengths",
            "strategic_considerations": "Test considerations",
            "viability_red_flags": "Test flags",
            "pathway_recommendation": "Test pathway"
        }
        text = f"Some text before\n{json.dumps(json_content)}\nSome text after"
        
        result = clean_profile_analysis(text)
        
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
        parsed = json.loads(result.split(PROFILE_START_MARKER)[1].split(PROFILE_END_MARKER)[0].strip())
        assert parsed["core_motivations"] == "Test motivation"
    
    def test_clean_without_delimiters_no_json(self):
        """Test cleaning profile analysis with no JSON found"""
        text = "Just some text without any JSON"
        
        result = clean_profile_analysis(text)
        
        # Should return empty JSON structure with delimiters
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
        parsed = json.loads(result.split(PROFILE_START_MARKER)[1].split(PROFILE_END_MARKER)[0].strip())
        for key in REQUIRED_PROFILE_KEYS:
            assert key in parsed
            assert parsed[key] == ""
    
    def test_clean_empty_string(self):
        """Test cleaning empty string"""
        result = clean_profile_analysis("")
        assert result == ""
    
    def test_clean_none(self):
        """Test cleaning None (should handle gracefully)"""
        result = clean_profile_analysis(None)
        assert result is None
    
    def test_clean_with_code_fences(self):
        """Test cleaning profile analysis with markdown code fences"""
        json_content = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints",
            "strengths_and_capabilities": "Test strengths",
            "strategic_considerations": "Test considerations",
            "viability_red_flags": "Test flags",
            "pathway_recommendation": "Test pathway"
        }
        text = f"```json\n{json.dumps(json_content)}\n```"
        
        result = clean_profile_analysis(text)
        
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
    
    def test_clean_with_delimiters_invalid_json_retry_success(self):
        """Test cleaning with invalid JSON that can be fixed by regex cleaning"""
        # JSON with extra text that can be cleaned
        text = f"{PROFILE_START_MARKER}\nSome text {{'core_motivations': 'test'}} more text\n{PROFILE_END_MARKER}"
        
        result = clean_profile_analysis(text)
        
        # Should attempt to clean and return empty structure if still fails
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
    
    def test_clean_without_delimiters_json_parse_fails(self):
        """Test cleaning when JSON match found but parsing fails"""
        # Text with JSON-like structure that fails to parse
        text = "Some text {invalid json structure} more text"
        
        result = clean_profile_analysis(text)
        
        # Should return empty JSON structure with delimiters
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
        parsed = json.loads(result.split(PROFILE_START_MARKER)[1].split(PROFILE_END_MARKER)[0].strip())
        for key in REQUIRED_PROFILE_KEYS:
            assert key in parsed


class TestParseProfileResponse:
    """Tests for parse_profile_response function"""
    
    def test_parse_valid_json(self):
        """Test parsing valid JSON response"""
        json_content = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints",
            "strengths_and_capabilities": "Test strengths",
            "strategic_considerations": "Test considerations",
            "viability_red_flags": "Test flags",
            "pathway_recommendation": "Test pathway"
        }
        raw_response = json.dumps(json_content)
        
        result = parse_profile_response(raw_response)
        
        assert result["core_motivations"] == "Test motivation"
        assert result["operating_constraints"] == "Test constraints"
        for key in REQUIRED_PROFILE_KEYS:
            assert key in result
    
    def test_parse_with_code_fences(self):
        """Test parsing response with markdown code fences"""
        json_content = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints",
            "strengths_and_capabilities": "Test strengths",
            "strategic_considerations": "Test considerations",
            "viability_red_flags": "Test flags",
            "pathway_recommendation": "Test pathway"
        }
        raw_response = f"```json\n{json.dumps(json_content)}\n```"
        
        result = parse_profile_response(raw_response)
        
        assert result["core_motivations"] == "Test motivation"
        for key in REQUIRED_PROFILE_KEYS:
            assert key in result
    
    def test_parse_with_extra_text(self):
        """Test parsing response with extra text before/after JSON"""
        json_content = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints",
            "strengths_and_capabilities": "Test strengths",
            "strategic_considerations": "Test considerations",
            "viability_red_flags": "Test flags",
            "pathway_recommendation": "Test pathway"
        }
        raw_response = f"Here is the analysis:\n{json.dumps(json_content)}\nThat's the end."
        
        result = parse_profile_response(raw_response)
        
        assert result["core_motivations"] == "Test motivation"
        for key in REQUIRED_PROFILE_KEYS:
            assert key in result
    
    def test_parse_missing_keys(self):
        """Test parsing response with missing required keys"""
        json_content = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints"
            # Missing other keys
        }
        raw_response = json.dumps(json_content)
        
        result = parse_profile_response(raw_response)
        
        # All required keys should be present (missing ones set to empty string)
        for key in REQUIRED_PROFILE_KEYS:
            assert key in result
        assert result["core_motivations"] == "Test motivation"
        assert result["strengths_and_capabilities"] == ""
    
    def test_parse_no_json_raises_exception(self):
        """Test parsing response with no JSON raises exception"""
        raw_response = "Just some text without JSON"
        
        with pytest.raises(Exception) as exc_info:
            parse_profile_response(raw_response)
        
        assert "No JSON found" in str(exc_info.value)
    
    def test_parse_invalid_json_raises_exception(self):
        """Test parsing invalid JSON raises exception"""
        raw_response = "{invalid json}"
        
        with pytest.raises(Exception) as exc_info:
            parse_profile_response(raw_response)
        
        assert "Invalid JSON" in str(exc_info.value)


class TestWrapProfileAnalysis:
    """Tests for wrap_profile_analysis function"""
    
    def test_wrap_valid_json(self):
        """Test wrapping valid profile analysis JSON"""
        json_obj = {
            "core_motivations": "Test motivation",
            "operating_constraints": "Test constraints",
            "strengths_and_capabilities": "Test strengths",
            "strategic_considerations": "Test considerations",
            "viability_red_flags": "Test flags",
            "pathway_recommendation": "Test pathway"
        }
        
        result = wrap_profile_analysis(json_obj)
        
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
        assert "Test motivation" in result
        # Verify JSON is valid
        json_text = result.split(PROFILE_START_MARKER)[1].split(PROFILE_END_MARKER)[0].strip()
        parsed = json.loads(json_text)
        assert parsed == json_obj
    
    def test_wrap_empty_values(self):
        """Test wrapping JSON with empty string values"""
        json_obj = {
            "core_motivations": "",
            "operating_constraints": "",
            "strengths_and_capabilities": "",
            "strategic_considerations": "",
            "viability_red_flags": "",
            "pathway_recommendation": ""
        }
        
        result = wrap_profile_analysis(json_obj)
        
        assert PROFILE_START_MARKER in result
        assert PROFILE_END_MARKER in result
        json_text = result.split(PROFILE_START_MARKER)[1].split(PROFILE_END_MARKER)[0].strip()
        parsed = json.loads(json_text)
        assert parsed == json_obj
    
    def test_wrap_format(self):
        """Test that wrapped output has correct format"""
        json_obj = {
            "core_motivations": "Test",
            "operating_constraints": "Test",
            "strengths_and_capabilities": "Test",
            "strategic_considerations": "Test",
            "viability_red_flags": "Test",
            "pathway_recommendation": "Test"
        }
        
        result = wrap_profile_analysis(json_obj)
        
        # Should start with start marker
        assert result.startswith(PROFILE_START_MARKER)
        # Should end with end marker
        assert result.endswith(PROFILE_END_MARKER)
        # Should have newlines
        assert "\n" in result

