"""
Utility functions for filtering ideas based on startup_category (tech vs non-tech).
"""

import re
from typing import Dict, Any, List


# Keywords that indicate TECH ideas
TECH_KEYWORDS = [
    "software", "app", "platform", "saas", "api", "ai", "artificial intelligence",
    "machine learning", "algorithm", "digital", "online", "web", "mobile app",
    "automation", "chatbot", "software tool", "digital product", "tech",
    "coding", "developer", "programming", "cloud", "saas", "software service",
    "web application", "mobile application", "digital platform", "online tool",
    "software solution", "tech startup", "digital service", "automated",
    "algorithm", "data analytics", "software development", "tech product"
]

# Keywords that indicate NON-TECH ideas
NON_TECH_KEYWORDS = [
    "restaurant", "cafe", "physical", "brick and mortar", "in-person",
    "service", "consulting", "coaching", "training", "cleaning", "handyman",
    "landscaping", "catering", "meal prep", "food delivery", "retail store",
    "physical product", "manufacturing", "craft", "handmade", "local service",
    "offline", "in-store", "face-to-face", "on-site", "physical location",
    "brick-and-mortar", "physical space", "storefront", "workshop", "studio"
]


def is_tech_idea(idea: Dict[str, Any]) -> bool:
    """
    Determine if an idea is tech-based by analyzing its title, summary, and other fields.
    
    Args:
        idea: Dictionary containing idea fields (title, summary, target_market, revenue_model, etc.)
        
    Returns:
        True if the idea appears to be tech-based, False otherwise
    """
    # Combine all text fields for analysis
    text_fields = [
        idea.get("title", ""),
        idea.get("summary", ""),
        idea.get("target_market", ""),
        idea.get("revenue_model", ""),
        idea.get("why_this_fits", ""),
    ]
    
    combined_text = " ".join(text_fields).lower()
    
    # Count tech and non-tech keyword matches
    tech_count = sum(1 for keyword in TECH_KEYWORDS if keyword in combined_text)
    non_tech_count = sum(1 for keyword in NON_TECH_KEYWORDS if keyword in combined_text)
    
    # If tech keywords significantly outnumber non-tech, it's tech
    if tech_count > 0 and tech_count >= non_tech_count * 2:
        return True
    
    # If non-tech keywords significantly outnumber tech, it's non-tech
    if non_tech_count > 0 and non_tech_count >= tech_count * 2:
        return False
    
    # Check for explicit tech indicators in title/summary
    title_lower = idea.get("title", "").lower()
    summary_lower = idea.get("summary", "").lower()
    
    # Strong tech indicators
    tech_indicators = ["saas", "software", "app", "platform", "ai", "automation", "digital product"]
    if any(indicator in title_lower or indicator in summary_lower for indicator in tech_indicators):
        return True
    
    # Strong non-tech indicators
    non_tech_indicators = ["restaurant", "cafe", "physical", "service", "consulting", "cleaning", "handyman"]
    if any(indicator in title_lower or indicator in summary_lower for indicator in non_tech_indicators):
        return False
    
    # Default: if unclear, check industry interest
    industry = idea.get("industry_interest", "").lower()
    if any(tech_word in industry for tech_word in ["ai", "automation", "software", "saas"]):
        return True
    
    # Default to non-tech if unclear
    return False


def filter_ideas_by_category(ideas: List[Dict[str, Any]], startup_category: str) -> List[Dict[str, Any]]:
    """
    Filter ideas based on startup_category.
    
    Args:
        ideas: List of idea dictionaries
        startup_category: "tech", "non_tech", or "both"
        
    Returns:
        Filtered list of ideas
    """
    if not startup_category or startup_category == "both":
        return ideas
    
    filtered = []
    for idea in ideas:
        is_tech = is_tech_idea(idea)
        
        if startup_category == "tech" and is_tech:
            filtered.append(idea)
        elif startup_category == "non_tech" and not is_tech:
            filtered.append(idea)
    
    return filtered

