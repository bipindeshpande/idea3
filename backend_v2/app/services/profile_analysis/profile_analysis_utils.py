"""Utility functions for profile analysis JSON cleaning and validation

DEPRECATED: This module is maintained for backward compatibility.
New code should use app.services.parsers.ProfileParser directly.
"""
from typing import Dict, Any

# Import from shared parser library (single source of truth)
from app.services.parsers.profile_parser import (
    ProfileParser,
    REQUIRED_PROFILE_KEYS,
    PROFILE_START_MARKER,
    PROFILE_END_MARKER
)


def clean_profile_analysis(text: str) -> str:
    """
    Extract JSON from delimited block and clean profile analysis.
    
    DEPRECATED: Use ProfileParser.clean_and_wrap() instead.
    This function is maintained for backward compatibility.
    """
    return ProfileParser.clean_and_wrap(text)


def parse_profile_response(raw_response: str) -> Dict[str, Any]:
    """
    Parse and validate LLM response for profile analysis.
    
    DEPRECATED: Use ProfileParser.parse_response() instead.
    This function is maintained for backward compatibility.
    
    Args:
        raw_response: Raw response text from LLM
        
    Returns:
        Parsed JSON object with all required keys
        
    Raises:
        Exception: If JSON cannot be parsed or found
    """
    return ProfileParser.parse_response(raw_response)


def wrap_profile_analysis(json_obj: Dict[str, Any]) -> str:
    """
    Wrap profile analysis JSON in delimiters.
    
    DEPRECATED: Use ProfileParser.wrap() instead.
    This function is maintained for backward compatibility.
    
    Args:
        json_obj: Validated profile analysis JSON object
        
    Returns:
        Wrapped string with delimiters
    """
    return ProfileParser.wrap(json_obj)

