"""
Discovery API routes - Backward compatibility wrapper

This file maintains backward compatibility by re-exporting the modular router.
The actual implementation has been split into:
- discovery/runs.py - Run CRUD operations
- discovery/streaming.py - Streaming endpoints
- discovery/enrichment.py - Idea enrichment
- discovery/enhancement.py - Report enhancement
"""
# Import the modular router
from .discovery import router

# Re-export models and utilities for backward compatibility
from app.api.models.discovery_models import RunRequest, RunResponse
from app.utils.discovery.discovery_validators import ensure_defaults, validate_required_fields, normalize_skills
from app.utils.discovery.streaming_helpers import format_cached_result

__all__ = [
    "router",
    "RunRequest",
    "RunResponse",
    "ensure_defaults",
    "validate_required_fields",
    "normalize_skills",
    "format_cached_result"
]
