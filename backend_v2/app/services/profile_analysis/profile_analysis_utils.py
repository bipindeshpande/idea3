"""Utility functions for profile analysis JSON cleaning and validation"""
import json
import re
from typing import Dict, Any


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


def clean_profile_analysis(text: str) -> str:
    """
    Extract JSON from delimited block and clean profile analysis.
    
    Steps:
    1. Extract JSON from ---PROFILE_ANALYSIS_START--- ... ---PROFILE_ANALYSIS_END---
    2. Validate JSON structure
    3. Remove any content outside delimiters
    4. Return the JSON with delimiters preserved (for frontend parsing)
    """
    if not text:
        return text
    
    # Step 1: Extract JSON from delimited block
    start_idx = text.find(PROFILE_START_MARKER)
    end_idx = text.find(PROFILE_END_MARKER)
    
    if start_idx >= 0 and end_idx > start_idx:
        # Extract JSON block
        json_start = start_idx + len(PROFILE_START_MARKER)
        json_text = text[json_start:end_idx].strip()
        
        # Try to parse and validate JSON
        try:
            parsed = json.loads(json_text)
            validated_json = _validate_and_fix_profile_json(parsed)
            return f"{PROFILE_START_MARKER}\n{json.dumps(validated_json, indent=2)}\n{PROFILE_END_MARKER}"
        except json.JSONDecodeError:
            # If JSON parsing fails, try to clean and retry
            json_text = re.sub(r'^[^\{]*', '', json_text)  # Remove text before first {
            json_text = re.sub(r'[^\}]*$', '', json_text)  # Remove text after last }
            try:
                parsed = json.loads(json_text)
                validated_json = _validate_and_fix_profile_json(parsed)
                return f"{PROFILE_START_MARKER}\n{json.dumps(validated_json, indent=2)}\n{PROFILE_END_MARKER}"
            except:
                # If still fails, return empty JSON structure with delimiters
                return _get_empty_profile_json()
    else:
        # No delimiters found - try to find JSON in the text
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(0))
                validated_json = _validate_and_fix_profile_json(parsed)
                return f"{PROFILE_START_MARKER}\n{json.dumps(validated_json, indent=2)}\n{PROFILE_END_MARKER}"
            except:
                pass
        
        # Fallback: return empty JSON structure with delimiters
        return _get_empty_profile_json()


def _validate_and_fix_profile_json(parsed: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and fix profile JSON structure by ensuring all required keys exist"""
    for key in REQUIRED_PROFILE_KEYS:
        if key not in parsed:
            parsed[key] = ""  # Add missing keys with empty string
    return parsed


def _get_empty_profile_json() -> str:
    """Get empty profile JSON structure with delimiters"""
    empty_json = json.dumps({
        key: "" for key in REQUIRED_PROFILE_KEYS
    }, indent=2)
    return f"{PROFILE_START_MARKER}\n{empty_json}\n{PROFILE_END_MARKER}"


def parse_profile_response(raw_response: str) -> Dict[str, Any]:
    """
    Parse and validate LLM response for profile analysis.
    
    Args:
        raw_response: Raw response text from LLM
        
    Returns:
        Parsed JSON object with all required keys
        
    Raises:
        Exception: If JSON cannot be parsed or found
    """
    # Clean code fences
    raw = raw_response.replace("```json", "").replace("```", "").strip()
    
    # Find JSON object
    first = raw.find("{")
    last = raw.rfind("}")
    
    if first == -1 or last == -1:
        raise Exception(f"ProfileAnalysis: No JSON found. Raw={raw[:200]}")
    
    json_text = raw[first:last+1]
    
    # Parse JSON safely
    try:
        json_obj = json.loads(json_text)
    except Exception as e:
        raise Exception(
            f"ProfileAnalysis: Invalid JSON.\nError={e}\nJSON={json_text[:300]}"
        )
    
    # Ensure all required keys exist
    json_obj = _validate_and_fix_profile_json(json_obj)
    
    return json_obj


def wrap_profile_analysis(json_obj: Dict[str, Any]) -> str:
    """
    Wrap profile analysis JSON in delimiters.
    
    Args:
        json_obj: Validated profile analysis JSON object
        
    Returns:
        Wrapped string with delimiters
    """
    return (
        f"{PROFILE_START_MARKER}\n"
        + json.dumps(json_obj, indent=2)
        + f"\n{PROFILE_END_MARKER}"
    )

