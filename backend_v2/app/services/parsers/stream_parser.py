"""
Stream Parser - Single source of truth for streamed text parsing

Handles splitting streamed text into profile analysis and recommendations sections.
This consolidates the logic from splitProfileAndRecommendations.js and similar functions.

This parser handles:
1. Splitting streamed text into profile and recommendations sections
2. Handling multiple delimiter formats
3. Fallback strategies when delimiters are missing
"""

from typing import Dict, Optional
import re


class StreamParser:
    """
    Single source of truth for streamed text parsing.
    
    All stream parsing operations should use this class to ensure consistency.
    """
    
    # Profile/recommendation split tokens
    PROFILE_END_TOKEN = "\n\n---PROFILE_END---\n\n"
    PROFILE_END_TOKEN_ALT = "---PROFILE_END---"
    
    # Recommendation markers for fallback detection
    RECOMMENDATION_MARKERS = [
        "### IDEA_1",
        "### IDEA_",
        "\n\n## SECTION 1:",
        "\n\n## IDEA RESEARCH REPORT",
    ]
    
    @staticmethod
    def split_profile_and_recommendations(text: str) -> Dict[str, str]:
        """
        Split streamed text into profile and recommendations sections.
        
        Follows contract: profile ends with ---PROFILE_END---
        
        Tries multiple strategies:
        1. Primary split token: "\n\n---PROFILE_END---\n\n"
        2. Alternative split token: "---PROFILE_END---"
        3. Fallback: Find recommendation markers (### IDEA_1, etc.)
        4. Last resort: Treat all as profile (safer default)
        
        Args:
            text: The full streamed text
            
        Returns:
            Dict with keys:
            - profile_analysis: Profile analysis text (may be empty)
            - recommendations: Recommendations text (may be empty)
        """
        if not text:
            return {"profile_analysis": "", "recommendations": ""}
        
        # Strategy 1: Try primary split token
        if StreamParser.PROFILE_END_TOKEN in text:
            parts = text.split(StreamParser.PROFILE_END_TOKEN, 1)
            return {
                "profile_analysis": parts[0].strip() if parts else "",
                "recommendations": parts[1].strip() if len(parts) > 1 else ""
            }
        
        # Strategy 2: Try alternative split token (without newlines)
        if StreamParser.PROFILE_END_TOKEN_ALT in text:
            parts = text.split(StreamParser.PROFILE_END_TOKEN_ALT, 1)
            return {
                "profile_analysis": parts[0].strip() if parts else "",
                "recommendations": parts[1].strip() if len(parts) > 1 else ""
            }
        
        # Strategy 3: Fallback - try to find recommendation markers
        split_point = -1
        for marker in StreamParser.RECOMMENDATION_MARKERS:
            idx = text.find(marker)
            if idx > 0 and (split_point == -1 or idx < split_point):
                split_point = idx
        
        if split_point > 0:
            return {
                "profile_analysis": text[:split_point].strip(),
                "recommendations": text[split_point:].strip()
            }
        
        # Strategy 4: Last resort - treat all as profile (safer default)
        return {
            "profile_analysis": text.strip(),
            "recommendations": ""
        }
    
    @staticmethod
    def extract_profile_section(text: str) -> str:
        """
        Extract only the profile analysis section from streamed text.
        
        Args:
            text: The full streamed text
            
        Returns:
            Profile analysis text (may be empty)
        """
        result = StreamParser.split_profile_and_recommendations(text)
        return result.get("profile_analysis", "")
    
    @staticmethod
    def extract_recommendations_section(text: str) -> str:
        """
        Extract only the recommendations section from streamed text.
        
        Args:
            text: The full streamed text
            
        Returns:
            Recommendations text (may be empty)
        """
        result = StreamParser.split_profile_and_recommendations(text)
        return result.get("recommendations", "")
    
    @staticmethod
    def has_profile_markers(text: str) -> bool:
        """
        Check if text contains profile analysis markers.
        
        Args:
            text: Text to check
            
        Returns:
            True if profile markers are present
        """
        return (
            "---PROFILE_ANALYSIS_START---" in text or
            "---PROFILE_ANALYSIS_END---" in text or
            StreamParser.PROFILE_END_TOKEN in text or
            StreamParser.PROFILE_END_TOKEN_ALT in text
        )
    
    @staticmethod
    def has_recommendation_markers(text: str) -> bool:
        """
        Check if text contains recommendation markers.
        
        Args:
            text: Text to check
            
        Returns:
            True if recommendation markers are present
        """
        for marker in StreamParser.RECOMMENDATION_MARKERS:
            if marker in text:
                return True
        return False

