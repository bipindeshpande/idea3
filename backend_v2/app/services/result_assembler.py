"""
ResultAssembler – Extracts structured sections from LLM output.

This class parses the full Stage 2 response into:
- profile_analysis   (already provided from Stage 1)
- startup_ideas_research
- personalized_recommendations

It also applies fallback protections so that the API always returns
valid JSON to the frontend even if the LLM formatting is imperfect.
"""

from typing import Dict, Any


class ResultAssembler:
    """
    Extracts structured sections from the raw LLM output text.
    """

    # ------------------------------------------------------------------
    # PUBLIC API
    # ------------------------------------------------------------------
    @staticmethod
    def assemble(profile_analysis: str, stage2_output: str) -> Dict[str, str]:
        """
        Main entry point.
        Accepts:
            - profile_analysis (Stage 1 JSON string)
            - stage2_output (raw full text from Stage 2 LLM)

        Returns a dict with all required fields:
            profile_analysis
            startup_ideas_research
            personalized_recommendations
        """

        ideas = ResultAssembler._extract_section(
            text=stage2_output,
            start_marker="### Idea Research Report",
            end_marker="### Comprehensive Recommendation Report"
        )

        recommendations = ResultAssembler._extract_section(
            text=stage2_output,
            start_marker="### Comprehensive Recommendation Report",
            end_marker=None
        )

        # Ensure fallbacks (never return None)
        return {
            "profile_analysis": profile_analysis or "",
            "startup_ideas_research": ideas or "",
            "personalized_recommendations": recommendations or "",
        }

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
