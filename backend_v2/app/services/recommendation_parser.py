"""
Recommendation Parser – Parses structured recommendation format from LLM output.

DEPRECATED: This module is maintained for backward compatibility.
New code should use app.services.parsers.RecommendationParser directly.
All parsing logic has been moved to the shared parser library.

This module now re-exports from app.services.parsers.RecommendationParser
to maintain backward compatibility.
"""

# Import from shared parser library (single source of truth)
from app.services.parsers.recommendation_parser import RecommendationParser as _RecommendationParser

# Re-export for backward compatibility
RecommendationParser = _RecommendationParser

# Re-export logger for compatibility
import logging
logger = logging.getLogger(__name__)

