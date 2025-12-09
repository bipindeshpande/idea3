# app/services/tool_service.py
from typing import Dict, Any, List
from pathlib import Path
import json
import asyncio

from app.services.base_service import BaseService


class ToolService(BaseService):
    """
    Handles loading static blocks, executing dynamic tools (if needed),
    merging + filtering results, and producing a clean dictionary
    ready for PromptBuilder.
    """

    # These are the ONLY fields Stage 2 should receive.
    ALLOWED_STATIC_FIELDS = {
        "market_trends",
        "competitors",
        "market_size",
        "risks",
        "opportunity_space",
        "idea_patterns",
    }

    STATIC_DIR = Path(__file__).parent.parent / "tools" / "static_blocks"

    # ------------------------------------------------------------------
    # PUBLIC API (called by DiscoveryService)
    # ------------------------------------------------------------------
    def load_or_execute(self, interest_area: str, sub_interest_area: str = "") -> Dict[str, Any]:
        """
        Main entry point.
        Loads static blocks for a given interest area.
        Falls back to dynamic tools only if static blocks missing.
        Always returns a CLEAN dictionary for Stage 2.
        """

        static_data = self._load_static_for_interest_area(interest_area)

        if static_data:
            return self._clean_static_output(static_data)

        # Fall back to dynamic tool execution (rare)
        dynamic_results = self._execute_dynamic_tools(interest_area, sub_interest_area)
        return self._clean_dynamic_output(dynamic_results)

    # ------------------------------------------------------------------
    # INTERNAL — Static Blocks
    # ------------------------------------------------------------------
    def _load_static_for_interest_area(self, interest_area: str) -> Dict[str, Any]:
        """
        Loads a static JSON file based on normalized interest area.
        Returns {} if file not found.
        """

        filename = self._normalize_interest_area(interest_area)
        if not filename:
            return {}

        file_path = self.STATIC_DIR / f"{filename}.json"
        if not file_path.exists():
            return {}

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except:
            return {}

        # Ensure values are strings
        return {k: str(v) for k, v in data.items()}

    def _normalize_interest_area(self, area: str) -> str:
        """
        Converts user-friendly area names into canonical file names.
        """
        if not area:
            return ""

        area = area.lower().strip()

        MAP = {
            "ai / automation": "ai",
            "ai automation": "ai",
            "artificial intelligence": "ai",
            "fintech": "fintech",
            "health & wellness": "healthtech",
            "healthtech": "healthtech",
            "health tech": "healthtech",
            "e-commerce": "ecommerce",
            "ecommerce": "ecommerce",
            "edtech": "edtech",
            "education technology": "edtech",
            "creator": "creator",
            "creator economy": "creator",
            "sustainability": "sustainability",
            "green tech": "sustainability",
        }

        if area in MAP:
            return MAP[area]

        # fallback normalization
        cleaned = "".join(c for c in area if c.isalnum())
        return cleaned

    # ------------------------------------------------------------------
    # INTERNAL — Dynamic Tools (fallback only)
    # ------------------------------------------------------------------
    def _execute_dynamic_tools(self, interest_area: str, sub: str) -> Dict[str, Any]:
        """
        Runs slow dynamic tools ONLY if no static data exists.
        """

        # Real implementation would call dynamic crew tools
        # This placeholder keeps your architecture clean
        return {
            "market_trends": f"Dynamic trends for {interest_area}",
            "competitors": f"Dynamic competitor analysis for {interest_area}",
            "market_size": f"Dynamic market size for {interest_area}",
            "risks": f"Dynamic risks for {interest_area}",
            "opportunity_space": f"Dynamic opportunities for {interest_area}",
            "idea_patterns": f"Dynamic idea patterns for {interest_area}",
        }

    # ------------------------------------------------------------------
    # INTERNAL — Output Shaping
    # ------------------------------------------------------------------
    def _clean_static_output(self, static_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Filters + reshapes static blocks into a final dictionary for Stage 2.
        """

        return {
            key: static_data.get(key, "")
            for key in self.ALLOWED_STATIC_FIELDS
        }

    def _clean_dynamic_output(self, dyn: Dict[str, Any]) -> Dict[str, Any]:
        """
        Same filtering but for dynamic tool output.
        """
        return {
            key: dyn.get(key, "")
            for key in self.ALLOWED_STATIC_FIELDS
        }
    
    async def load_or_execute_async(self, interest_area: str, sub_interest_area: str = "") -> Dict[str, Any]:
        """
        Async version of load_or_execute.
        Uses asyncio.to_thread for file I/O operations.
        """
        # Run file I/O in thread pool to avoid blocking
        static_data = await asyncio.to_thread(
            self._load_static_for_interest_area,
            interest_area
        )
        
        if static_data:
            return self._clean_static_output(static_data)
        
        # Fall back to dynamic tool execution (rare)
        dynamic_results = await asyncio.to_thread(
            self._execute_dynamic_tools,
            interest_area,
            sub_interest_area
        )
        return self._clean_dynamic_output(dynamic_results)
