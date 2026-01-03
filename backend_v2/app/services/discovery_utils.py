"""
Discovery utility functions - static helpers for discovery operations.
"""
from typing import Dict, Any


def normalize_industry_name(name: str) -> str:
    """
    Normalize industry name to match static engine JSON file names.
    
    Maps common variations to the correct file names.
    """
    if not name:
        return ""
    
    mapping = {
        # Food & Beverage (has JSON: food_and_beverage.json, restaurant.json, food_delivery.json)
        "food & beverage": "food_and_beverage",
        "food and beverage": "food_and_beverage",
        "food and beverages": "food_and_beverage",
        "food_and_beverage": "food_and_beverage",
        "meal prep": "food_and_beverage",
        "meal preparation": "food_and_beverage",
        "restaurant": "restaurant",
        "restaurants": "restaurant",
        "food delivery": "food_delivery",
        "fooddelivery": "food_delivery",
        "food_delivery": "food_delivery",
        
        # AI & Automation (has JSON: ai.json)
        "ai": "ai",
        "artificial intelligence": "ai",
        "ai & automation": "ai",
        "ai and automation": "ai",
        "automation": "ai",
        
        # Finance / Accounting (has JSON: fintech.json)
        "finance": "fintech",
        "fintech": "fintech",
        "financial technology": "fintech",
        "finance / accounting": "fintech",
        "finance/accounting": "fintech",
        "accounting": "fintech",
        
        # Healthcare / Wellness / Beauty (has JSON: healthcare.json, healthtech.json)
        "healthcare": "healthcare",
        "health care": "healthcare",
        "health & wellness": "healthcare",
        "health and wellness": "healthcare",
        "healthcare / wellness": "healthcare",
        "beauty & wellness": "healthcare",
        "beauty and wellness": "healthcare",
        "beauty / wellness": "healthcare",
        "health tech": "healthtech",
        "healthtech": "healthtech",
        "health technology": "healthtech",
        
        # Retail & E-commerce (no JSON - will use LLM fallback)
        "retail & e-commerce": "retail_ecommerce",
        "retail and e-commerce": "retail_ecommerce",
        "retail / e-commerce": "retail_ecommerce",
        "retail/ecommerce": "retail_ecommerce",
        "e-commerce": "retail_ecommerce",
        "ecommerce": "retail_ecommerce",
        "retail": "retail_ecommerce",
        
        # Education (no JSON - will use LLM fallback)
        "education": "education",
        "edtech": "education",
        "education / edtech": "education",
        
        # Fitness & Sports (no JSON - will use LLM fallback)
        "fitness & sports": "fitness_sports",
        "fitness and sports": "fitness_sports",
        "fitness / sports": "fitness_sports",
        "fitness": "fitness_sports",
        "sports": "fitness_sports",
        
        # Kids & Parenting (no JSON - will use LLM fallback)
        "kids & parenting": "kids_parenting",
        "kids and parenting": "kids_parenting",
        "kids / parenting": "kids_parenting",
        "parenting": "kids_parenting",
        
        # Home Services (no JSON - will use LLM fallback)
        "home services": "home_services",
        "home service": "home_services",
        
        # Travel & Tourism (no JSON - will use LLM fallback)
        "travel & tourism": "travel_tourism",
        "travel and tourism": "travel_tourism",
        "travel / tourism": "travel_tourism",
        "travel": "travel_tourism",
        "tourism": "travel_tourism",
        
        # Manufacturing / Crafts (no JSON - will use LLM fallback)
        "manufacturing / crafts": "manufacturing_crafts",
        "manufacturing/crafts": "manufacturing_crafts",
        "manufacturing": "manufacturing_crafts",
        "crafts": "manufacturing_crafts",
        
        # Software / SaaS (no JSON - will use LLM fallback)
        "software / saas": "software_saas",
        "software/saas": "software_saas",
        "software": "software_saas",
        "saas": "software_saas",
        
        # Freelancing / Consulting (no JSON - will use LLM fallback)
        "freelancing / consulting": "freelancing_consulting",
        "freelancing/consulting": "freelancing_consulting",
        "freelancing": "freelancing_consulting",
        "consulting": "freelancing_consulting",
        
        # Agriculture / Gardening (no JSON - will use LLM fallback)
        "agriculture / gardening": "agriculture_gardening",
        "agriculture/gardening": "agriculture_gardening",
        "agriculture": "agriculture_gardening",
        "gardening": "agriculture_gardening",
        
        # Social Impact (no JSON - will use LLM fallback)
        "social impact": "social_impact",
        "social impact / non-profit": "social_impact",
        "non-profit": "social_impact",
        "nonprofit": "social_impact",
        
        # Local Services (no JSON - will use LLM fallback)
        "local services": "local_services",
        "local service": "local_services",
        
        # Other (no JSON - will use LLM fallback)
        "other": "other",
    }
    
    normalized = name.lower().strip()
    return mapping.get(normalized, normalized.replace(" ", "_"))


def determine_realism_level(inputs: Dict[str, Any]) -> int:
    """
    Determine realism level (1-5) based on user intent inputs.
    
    Realism is calculated from:
    - founder_ambition (goal_type equivalent): 40% weight
    - time_commitment: 25% weight
    - budget_range: 20% weight
    - risk_tolerance: 15% weight
    
    Does NOT use skill_strength for realism calculation.
    
    Returns:
        Integer between 1 and 5:
        - 1: Teen-friendly, simple, encouraging, no regulations, minimal risks
        - 3: Practical, balanced, approachable details, light risks
        - 5: Founder-grade realism, include risks, economics, market realities
    """
    # Map founder_ambition (goal_type) to score (40% weight)
    founder_ambition = inputs.get("founder_ambition", "").lower()
    goal_scores = {
        "side income": 1,
        "turn hobby into business": 1,
        "part-time business": 2,
        "full-time business": 4,
        "scalable venture": 5,
    }
    goal_score = goal_scores.get(founder_ambition, 3)  # Default to 3 if not found
    
    # Map time_commitment to score (25% weight)
    time_commitment = inputs.get("time_commitment", "").lower()
    time_scores = {
        "<5 hrs/week": 1,
        "< 5 hrs/week": 1,
        "5–10 hrs/week": 2,
        "5-10 hrs/week": 2,
        "10–20 hrs/week": 3,
        "10-20 hrs/week": 3,
        "full-time": 5,
        "full time": 5,
    }
    time_score = time_scores.get(time_commitment, 3)  # Default to 3
    
    # Map budget_range to score (20% weight)
    budget_range = inputs.get("budget_range", "").lower()
    budget_scores = {
        "free / sweat-equity only": 1,
        "$0–100": 1,
        "$0-100": 1,
        "$100–1,000": 2,
        "$100-1,000": 2,
        "$1,000–5,000": 3,
        "$1,000-5,000": 3,
        "$1k-5k": 3,
        "$5,000–20,000": 4,
        "$5,000-20,000": 4,
        "$5k-20k": 4,
        "$20,000+": 5,
        "$20k+": 5,
        "$20 k and above": 5,
    }
    budget_score = budget_scores.get(budget_range, 3)  # Default to 3
    
    # Map risk_tolerance to score (15% weight)
    risk_tolerance = inputs.get("risk_tolerance", "").lower()
    risk_scores = {
        "low": 1,
        "very low": 1,
        "moderate": 3,
        "medium": 3,
        "high": 5,
    }
    risk_score = risk_scores.get(risk_tolerance, 3)  # Default to 3
    
    # Calculate weighted score
    weighted_score = (
        goal_score * 0.40 +
        time_score * 0.25 +
        budget_score * 0.20 +
        risk_score * 0.15
    )
    
    # Round to integer and clamp between 1 and 5
    realism_level = max(1, min(5, round(weighted_score)))
    
    return realism_level

