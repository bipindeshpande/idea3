"""
Profile Parser - Single source of truth for profile analysis parsing

Consolidates all profile analysis parsing logic:
- extract_profile_json (from text_cleaner.py)
- parse_profile_response (from profile_analysis_utils.py)
- clean_profile_analysis (from profile_analysis_utils.py)
- wrap_profile_analysis (from profile_analysis_utils.py)

This parser handles:
1. Extracting JSON from delimited text (---PROFILE_ANALYSIS_START--- ... ---PROFILE_ANALYSIS_END---)
2. Parsing and validating profile JSON structure
3. Cleaning and normalizing profile data
4. Wrapping profile data in delimiters for output
"""

import json
import re
from typing import Dict, Any, Optional

# Required keys for profile analysis JSON
REQUIRED_PROFILE_KEYS = [
    "core_motivations",
    "operating_constraints",
    "strengths_and_capabilities",
    "strategic_considerations",
    "viability_red_flags",
    "pathway_recommendation"
]

# Profile analysis delimiters
PROFILE_START_MARKER = "---PROFILE_ANALYSIS_START---"
PROFILE_END_MARKER = "---PROFILE_ANALYSIS_END---"


class ProfileParser:
    """
    Single source of truth for profile analysis parsing.
    
    All profile parsing operations should use this class to ensure consistency.
    """
    
    @staticmethod
    def extract_json(text: str) -> Optional[Dict[str, Any]]:
        """
        Extract profile JSON from delimited text.
        
        Handles multiple formats:
        - Delimited: ---PROFILE_ANALYSIS_START--- ... JSON ... ---PROFILE_ANALYSIS_END---
        - Raw JSON: Direct JSON object
        - With code fences: JSON in ```json ... ``` blocks
        
        Args:
            text: Raw text containing profile JSON
            
        Returns:
            Parsed profile JSON dict, or None if not found/invalid
        """
        if not text:
            return None
        
        # Step 1: Try extracting from delimited block
        start_idx = text.find(PROFILE_START_MARKER)
        end_idx = text.find(PROFILE_END_MARKER)
        
        if start_idx >= 0 and end_idx > start_idx:
            # Extract JSON block between delimiters
            json_start = start_idx + len(PROFILE_START_MARKER)
            json_text = text[json_start:end_idx].strip()
            
            # Use balanced brace matching to extract complete JSON object
            parsed = ProfileParser._extract_json_from_text(json_text)
            if parsed:
                return ProfileParser._validate_and_fix(parsed)
        
        # Step 2: Try finding JSON directly in text (for raw JSON responses)
        parsed = ProfileParser._extract_json_from_text(text)
        if parsed:
            return ProfileParser._validate_and_fix(parsed)
        
        return None
    
    @staticmethod
    def _extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
        """
        Extract JSON object from text using balanced brace matching.
        
        Handles:
        - JSON with code fences: ```json ... ``` or ``` ... ```
        - Raw JSON: Direct JSON object
        - JSON with extra text: Finds first complete JSON object
        """
        if not text:
            return None
        
        # Remove code fences if present
        text = text.replace("```json", "").replace("```", "").strip()
        
        # Use balanced brace matching to find complete JSON object
        brace_count = 0
        json_start = -1
        json_end = -1
        
        for i, char in enumerate(text):
            if char == '{':
                if brace_count == 0:
                    json_start = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and json_start >= 0:
                    json_end = i
                    break
        
        if json_start >= 0 and json_end > json_start:
            json_text = text[json_start:json_end + 1]
        else:
            # Fallback: try first/last brace approach
            first_brace = text.find('{')
            last_brace = text.rfind('}')
            if first_brace >= 0 and last_brace > first_brace:
                json_text = text[first_brace:last_brace + 1]
            else:
                return None
        
        # Parse JSON
        try:
            return json.loads(json_text)
        except (json.JSONDecodeError, ValueError) as e:
            # Try cleaning whitespace and retrying
            json_text_clean = re.sub(r'\s+', ' ', json_text.strip())
            try:
                return json.loads(json_text_clean)
            except (json.JSONDecodeError, ValueError):
                return None
    
    @staticmethod
    def parse_response(raw_response: str) -> Dict[str, Any]:
        """
        Parse and validate LLM response for profile analysis.
        
        This is the primary method for parsing LLM responses during profile generation.
        Ensures all required fields are present.
        
        Args:
            raw_response: Raw response text from LLM
            
        Returns:
            Parsed JSON object with all required keys (filled with empty strings if missing)
            
        Raises:
            ValueError: If JSON cannot be parsed or found
        """
        parsed = ProfileParser.extract_json(raw_response)
        
        if parsed is None:
            raise ValueError(f"ProfileParser: No valid JSON found in response. Raw={raw_response[:200]}")
        
        return ProfileParser._validate_and_fix(parsed)
    
    @staticmethod
    def clean_and_wrap(text: str) -> str:
        """
        Extract JSON from delimited block, clean it, and wrap with delimiters.
        
        This method is used when cleaning up LLM responses before saving to database.
        It ensures consistent format with delimiters preserved.
        
        Args:
            text: Raw text containing profile analysis
            
        Returns:
            Cleaned profile JSON wrapped in delimiters, or empty structure if parsing fails
        """
        parsed = ProfileParser.extract_json(text)
        
        if parsed is None:
            # Return empty JSON structure with delimiters as fallback
            return ProfileParser._get_empty_json()
        
        validated = ProfileParser._validate_and_fix(parsed)
        return ProfileParser.wrap(validated)
    
    @staticmethod
    def wrap(json_obj: Dict[str, Any]) -> str:
        """
        Wrap profile JSON in delimiters for output/streaming.
        
        Args:
            json_obj: Validated profile JSON object
            
        Returns:
            Wrapped string with delimiters
        """
        json_str = json.dumps(json_obj, indent=2)
        return f"{PROFILE_START_MARKER}\n{json_str}\n{PROFILE_END_MARKER}"
    
    @staticmethod
    def _validate_and_fix(parsed: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and fix profile JSON structure by ensuring all required keys exist.
        
        Args:
            parsed: Parsed JSON dict
            
        Returns:
            Validated dict with all required keys (filled with empty strings if missing)
        """
        # Ensure all required keys exist
        for key in REQUIRED_PROFILE_KEYS:
            if key not in parsed:
                parsed[key] = ""
        
        return parsed
    
    @staticmethod
    def _get_empty_json() -> str:
        """
        Get empty profile JSON structure with delimiters.
        
        Returns:
            Empty JSON wrapped in delimiters
        """
        empty_json = {key: "" for key in REQUIRED_PROFILE_KEYS}
        return ProfileParser.wrap(empty_json)
    
    @staticmethod
    def extract_json_string(text: str) -> str:
        """
        Extract JSON string (not parsed) from delimited text.
        
        This is a lightweight version that returns the JSON string without parsing.
        Useful for simple extraction without validation.
        
        Args:
            text: Raw text containing profile JSON
            
        Returns:
            JSON string, or empty string if not found
        """
        if not text:
            return ""
        
        start_idx = text.find(PROFILE_START_MARKER)
        end_idx = text.find(PROFILE_END_MARKER)
        
        if start_idx >= 0 and end_idx > start_idx:
            json_start = start_idx + len(PROFILE_START_MARKER)
            json_text = text[json_start:end_idx].strip()
            
            # Clean whitespace (convert to single-line)
            json_text = json_text.replace("\n", " ").replace("\t", " ")
            json_text = re.sub(r"\s+", " ", json_text)
            
            # Extract JSON object
            match = re.search(r"\{.*\}", json_text, re.DOTALL)
            if match:
                return match.group(0).strip()
        
        return ""

