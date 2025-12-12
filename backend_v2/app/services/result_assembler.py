"""
ResultAssembler – Extracts structured sections from LLM output.

This class parses the full Stage 2 response into:
- profile_analysis   (already provided from Stage 1)
- startup_ideas_research
- personalized_recommendations
- structured_recommendations (if available from static engine)

It also applies fallback protections so that the API always returns
valid JSON to the frontend even if the LLM formatting is imperfect.
"""

from typing import Dict, Any, List, Optional
import json


class ResultAssembler:
    """
    Extracts structured sections from the raw LLM output text.
    """

    # ------------------------------------------------------------------
    # PUBLIC API
    # ------------------------------------------------------------------
    @staticmethod
    def assemble(profile_analysis: str, stage2_output: str, realism_level: int = 3) -> Dict[str, Any]:
        """
        Main entry point.
        Accepts:
            - profile_analysis (Stage 1 JSON string)
            - stage2_output (raw full text from Stage 2 LLM)
            - realism_level (integer 1-5, default 3)

        Returns a dict with all required fields:
            profile_analysis
            startup_ideas_research
            personalized_recommendations
            realism_level
        """

        # Extract structured ideas first (if present, so we can remove them from recommendations)
        structured_recommendations = ResultAssembler._extract_structured_ideas(stage2_output)
        
        # Extract recommendations section (markdown with IDEA blocks)
        # For static engine: recommendations are the markdown report
        # For LLM fallback: recommendations are the formatted IDEA blocks
        # Remove structured ideas markers if present in the text
        recommendations = stage2_output
        
        # Clean recommendations - remove structured ideas marker if present
        if "---STRUCTURED_IDEAS_START---" in recommendations:
            recommendations = recommendations.split("---STRUCTURED_IDEAS_START---")[0].strip()
        if "---STRUCTURED_IDEAS_END---" in recommendations:
            recommendations = recommendations.split("---STRUCTURED_IDEAS_END---")[0].strip()
        
        # Extract ideas research section (empty for seed-only output)
        # This was previously used for tool-enriched research, now empty
        ideas = ""

        # Ensure fallbacks (never return None)
        result = {
            "profile_analysis": profile_analysis or "",
            "startup_ideas_research": ideas or "",
            "personalized_recommendations": recommendations or "",
            "realism_level": realism_level,
        }
        
        # Add structured recommendations if available
        if structured_recommendations:
            result["structured_recommendations"] = structured_recommendations
        
        return result

    # ------------------------------------------------------------------
    # INTERNAL HELPERS
    # ------------------------------------------------------------------
    @staticmethod
    def _extract_section(text: str, start_marker: str, end_marker: str = None) -> str:
        """
        Extract the substring between start_marker and end_marker.
        If end_marker is None, extract until end of text.

        Returns "" instead of None for safety.
        """

        if not text:
            return ""

        start_index = text.find(start_marker)
        if start_index == -1:
            return ""

        # Move cursor to after the heading itself
        start_index += len(start_marker)

        if end_marker:
            end_index = text.find(end_marker, start_index)
            if end_index == -1:
                # End marker missing → return rest of text
                return text[start_index:].strip()
            return text[start_index:end_index].strip()

        # No end marker → return to end of text
        return text[start_index:].strip()
    
    @staticmethod
    def _extract_structured_ideas(text: str) -> Optional[List[Dict[str, Any]]]:
        """
        Extract structured ideas JSON from stage2_output if present.
        
        Static engine embeds structured ideas between markers:
        ---STRUCTURED_IDEAS_START---
        {JSON}
        ---STRUCTURED_IDEAS_END---
        
        Returns list of structured idea dicts, or None if not found.
        """
        if not text:
            return None
        
        start_marker = "---STRUCTURED_IDEAS_START---"
        end_marker = "---STRUCTURED_IDEAS_END---"
        
        start_idx = text.find(start_marker)
        if start_idx == -1:
            return None
        
        end_idx = text.find(end_marker, start_idx)
        if end_idx == -1:
            return None
        
        # Extract JSON content
        json_start = start_idx + len(start_marker)
        json_text = text[json_start:end_idx].strip()
        
        try:
            structured_ideas = json.loads(json_text)
            if isinstance(structured_ideas, list):
                return structured_ideas
        except (json.JSONDecodeError, ValueError):
            pass
        
        return None
