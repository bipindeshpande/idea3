"""
Text cleaning utilities

DEPRECATED: extract_profile_json is maintained for backward compatibility.
New code should use app.services.parsers.ProfileParser directly.
"""

from app.services.parsers.profile_parser import ProfileParser


def extract_profile_json(text: str) -> str:
    """
    Extracts the JSON block between the profile delimiters.
    Cleans markdown, bullets, whitespace, and ensures single-line JSON.
    
    DEPRECATED: Use ProfileParser.extract_json_string() instead.
    This function is maintained for backward compatibility.
    """
    return ProfileParser.extract_json_string(text)
