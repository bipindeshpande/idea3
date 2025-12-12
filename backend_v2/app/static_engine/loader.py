"""
Loader module for static industry data.

Loads and validates industry JSON files from static/industries/.
"""
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

# Base directory for static industry data
STATIC_BASE_DIR = Path(__file__).parent / "static" / "industries"


def _validate_schema(data: Dict[str, Any]) -> tuple[bool, List[str]]:
    """
    Simple schema validation for industry data.
    
    Args:
        data: Dictionary to validate
        
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    required_keys = [
        "business_models",
        "target_segments",
        "value_props",
        "skill_tags",
        "budget_bins",
        "constraints_map",
        "trend_summary",
        "competitor_notes",
        "markdown_template",
        "idea_fragments",
        "parameter_mappings",
    ]
    
    # Check required keys exist
    for key in required_keys:
        if key not in data:
            errors.append(f"Missing required key: {key}")
    
    # Validate idea_fragments structure
    if "idea_fragments" in data:
        if not isinstance(data["idea_fragments"], dict):
            errors.append("idea_fragments must be a dictionary")
        else:
            required_fragment_keys = ["problems", "solutions", "delivery_modes", "revenue_patterns", "automation_patterns"]
            for key in required_fragment_keys:
                if key not in data["idea_fragments"]:
                    errors.append(f"idea_fragments missing required key: {key}")
                elif not isinstance(data["idea_fragments"][key], list):
                    errors.append(f"idea_fragments.{key} must be a list")
                else:
                    # Validate fragment objects have id and text
                    for idx, fragment in enumerate(data["idea_fragments"][key]):
                        if not isinstance(fragment, dict):
                            errors.append(f"idea_fragments.{key}[{idx}] must be an object")
                        elif "id" not in fragment or "text" not in fragment:
                            errors.append(f"idea_fragments.{key}[{idx}] must have 'id' and 'text' keys")
    
    # Validate parameter_mappings structure
    if "parameter_mappings" in data:
        if not isinstance(data["parameter_mappings"], dict):
            errors.append("parameter_mappings must be a dictionary")
        else:
            # Required keys - work_style OR preferred_work_style (not both)
            required_param_keys = ["time_commitment", "budget_range", "risk_tolerance", "skill_strength", "goal_type", "startup_style", "business_region"]
            for key in required_param_keys:
                if key not in data["parameter_mappings"]:
                    errors.append(f"parameter_mappings missing required key: {key}")
                elif not isinstance(data["parameter_mappings"][key], dict):
                    errors.append(f"parameter_mappings.{key} must be a dictionary")
            
            # Validate work_style OR preferred_work_style (at least one must exist)
            has_work_style = "work_style" in data["parameter_mappings"]
            has_preferred_work_style = "preferred_work_style" in data["parameter_mappings"]
            if not has_work_style and not has_preferred_work_style:
                errors.append("parameter_mappings missing required key: work_style or preferred_work_style (at least one)")
            elif has_work_style and not isinstance(data["parameter_mappings"]["work_style"], dict):
                errors.append("parameter_mappings.work_style must be a dictionary")
            elif has_preferred_work_style and not isinstance(data["parameter_mappings"]["preferred_work_style"], dict):
                errors.append("parameter_mappings.preferred_work_style must be a dictionary")
    
    is_valid = len(errors) == 0
    return is_valid, errors


def load_industry_data(industry_key: str) -> Optional[Dict[str, Any]]:
    """
    Loads industry data from static/industries/{industry_key}.json
    
    Validates schema and returns structured Python object.
    
    Args:
        industry_key: Industry identifier (e.g., "ai", "fintech")
        
    Returns:
        Dictionary with industry data structure, or None if not found/invalid
        
    Structure:
        {
            "business_models": [...],
            "target_segments": [...],
            "value_props": {...},
            "skill_tags": {...},
            "budget_bins": {...},
            "constraints_map": {...},
            "trend_summary": [...],
            "competitor_notes": [...],
            "markdown_template": "...",
            "idea_fragments": {
                "problems": [{"id": "...", "text": "..."}, ...],
                "solutions": [...],
                "delivery_modes": [...],
                "revenue_patterns": [...],
                "automation_patterns": [...]
            },
            "parameter_mappings": {
                "time_commitment": {...},
                "budget_range": {...},
                "risk_tolerance": {...},
                "skill_strength": {...},
                "goal_type": {...},
                "preferred_work_style": {...},
                "startup_style": {...}
            },
            "archetypes": [...],
            "difficulty_levels": [...],
            "revenue_potential": [...],
            "operational_models": [...]
        }
    """
    # Normalize industry key (handle variations)
    industry_key = industry_key.lower().strip()
    
    # Try direct match first
    file_path = STATIC_BASE_DIR / f"{industry_key}.json"
    
    # If not found, try common variations
    if not file_path.exists():
        variations = {
            # Industries with JSON files
            "ai": "ai",
            "artificial intelligence": "ai",
            "ai & automation": "ai",
            "ai and automation": "ai",
            "automation": "ai",
            "fintech": "fintech",
            "financial technology": "fintech",
            "finance / accounting": "fintech",
            "finance/accounting": "fintech",
            "finance": "fintech",
            "accounting": "fintech",
            "food_and_beverage": "food_and_beverage",
            "food & beverage": "food_and_beverage",
            "food and beverage": "food_and_beverage",
            "restaurant": "restaurant",
            "restaurants": "restaurant",
            "food_delivery": "food_delivery",
            "food delivery": "food_delivery",
            "healthcare": "healthcare",
            "health care": "healthcare",
            "health & wellness": "healthcare",
            "health and wellness": "healthcare",
            "beauty & wellness": "healthcare",
            "beauty and wellness": "healthcare",
            "healthtech": "healthtech",
            "health tech": "healthtech",
            "health technology": "healthtech",
            
            # Industries without JSON files (will return None and use LLM fallback)
            # These are normalized but won't match any file
            "retail_ecommerce": "retail_ecommerce",
            "retail & e-commerce": "retail_ecommerce",
            "retail and e-commerce": "retail_ecommerce",
            "retail / e-commerce": "retail_ecommerce",
            "e-commerce": "retail_ecommerce",
            "ecommerce": "retail_ecommerce",
            "retail": "retail_ecommerce",
            "education": "education",
            "edtech": "education",
            "education / edtech": "education",
            "fitness_sports": "fitness_sports",
            "fitness & sports": "fitness_sports",
            "fitness and sports": "fitness_sports",
            "fitness": "fitness_sports",
            "sports": "fitness_sports",
            "kids_parenting": "kids_parenting",
            "kids & parenting": "kids_parenting",
            "kids and parenting": "kids_parenting",
            "parenting": "kids_parenting",
            "home_services": "home_services",
            "home services": "home_services",
            "travel_tourism": "travel_tourism",
            "travel & tourism": "travel_tourism",
            "travel and tourism": "travel_tourism",
            "travel": "travel_tourism",
            "tourism": "travel_tourism",
            "manufacturing_crafts": "manufacturing_crafts",
            "manufacturing / crafts": "manufacturing_crafts",
            "manufacturing/crafts": "manufacturing_crafts",
            "manufacturing": "manufacturing_crafts",
            "crafts": "manufacturing_crafts",
            "software_saas": "software_saas",
            "software / saas": "software_saas",
            "software/saas": "software_saas",
            "software": "software_saas",
            "saas": "software_saas",
            "freelancing_consulting": "freelancing_consulting",
            "freelancing / consulting": "freelancing/consulting",
            "freelancing": "freelancing_consulting",
            "consulting": "freelancing_consulting",
            "agriculture_gardening": "agriculture_gardening",
            "agriculture / gardening": "agriculture_gardening",
            "agriculture/gardening": "agriculture_gardening",
            "agriculture": "agriculture_gardening",
            "gardening": "agriculture_gardening",
            "social_impact": "social_impact",
            "social impact": "social_impact",
            "social impact / non-profit": "social_impact",
            "non-profit": "social_impact",
            "nonprofit": "social_impact",
            "local_services": "local_services",
            "local services": "local_services",
            "other": "other",
        }
        
        normalized = variations.get(industry_key, industry_key)
        file_path = STATIC_BASE_DIR / f"{normalized}.json"
    
    if not file_path.exists():
        logger.warning(f"Industry data file not found: {file_path}")
        return None
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Validate schema
        is_valid, errors = _validate_schema(data)
        if not is_valid:
            logger.error(f"Schema validation failed for {industry_key}:")
            for error in errors:
                logger.error(f"  - {error}")
            return None
        
        logger.info(f"Successfully loaded industry data for '{industry_key}'")
        return data
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {file_path}: {e}")
        return None
    except Exception as e:
        logger.error(f"Failed to load industry data from {file_path}: {e}")
        return None

