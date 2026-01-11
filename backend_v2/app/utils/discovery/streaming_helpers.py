"""Streaming helper utilities for discovery endpoints"""
from typing import Dict, Any
import json


def format_cached_result(cached_result: Dict[str, Any]) -> str:
    """Format cached result as plain text"""
    lines = []
    
    if cached_result.get("profile_analysis"):
        lines.append("### PROFILE ANALYSIS\n\n")
        lines.append(cached_result["profile_analysis"])
        lines.append("\n\n")
    
    if cached_result.get("startup_ideas_research"):
        lines.append("### IDEA RESEARCH\n\n")
        lines.append(cached_result["startup_ideas_research"])
        lines.append("\n\n")
    
    if cached_result.get("personalized_recommendations"):
        lines.append("### FINAL RECOMMENDATION\n\n")
        lines.append(cached_result["personalized_recommendations"])
    
    return "".join(lines)


def create_cached_sse_response(cached_result: Dict[str, Any]) -> str:
    """Create SSE-formatted response for cached results"""
    cached_text = format_cached_result(cached_result)
    events = []
    events.append(f"event: cached\n")
    events.append(f"data: {json.dumps({'run_id': None, 'cached': True})}\n\n")
    # Send cached text as chunk (split by lines for SSE format)
    for line in cached_text.split("\n"):
        events.append(f"data: {line}\n")
    events.append(f"\n")  # End of chunk event (empty line)
    events.append(f"event: end\n")
    events.append(f"data: {json.dumps({'run_id': None, 'status': 'completed'})}\n\n")
    return "".join(events)

