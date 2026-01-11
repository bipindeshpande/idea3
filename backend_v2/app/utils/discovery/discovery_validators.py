"""Discovery input validation and normalization utilities"""
from typing import Dict, Any
from fastapi import HTTPException, status
from app.utils.error_handler import handle_exception, ValidationError


def ensure_defaults(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensure all required fields have defaults if missing.
    """
    if not inputs or not isinstance(inputs, dict):
        inputs = {}
    
    # Set defaults for missing required fields
    if "startup_category" not in inputs or not inputs.get("startup_category"):
        inputs["startup_category"] = "both"  # Default to "both" if not specified
    if "risk_tolerance" not in inputs or not inputs.get("risk_tolerance"):
        inputs["risk_tolerance"] = "Moderate"
    if "preferred_work_style" not in inputs or not inputs.get("preferred_work_style"):
        inputs["preferred_work_style"] = "Flexible / No preference"
    if "startup_style" not in inputs or not inputs.get("startup_style"):
        inputs["startup_style"] = "Online-only business"
    if "customer_interaction" not in inputs or not inputs.get("customer_interaction"):
        inputs["customer_interaction"] = "Somewhat comfortable"
    if "location_context" not in inputs or not inputs.get("location_context"):
        inputs["location_context"] = "Urban"
    if "business_region" not in inputs or not inputs.get("business_region"):
        inputs["business_region"] = "Global / Online"
    if "business_type" not in inputs or not inputs.get("business_type"):
        inputs["business_type"] = "No preference"
    if "earnings_timeline" not in inputs or not inputs.get("earnings_timeline"):
        inputs["earnings_timeline"] = "90 days"
    
    # Ensure skills structure (new capability groups)
    if "skills" not in inputs or not isinstance(inputs.get("skills"), dict):
        inputs["skills"] = {
            "product_creation": [],
            "sales_marketing": [],
            "operational": [],
            "digital": [],
            "personality": [],
            "other": ""
        }
    
    return inputs


def validate_required_fields(inputs: Dict[str, Any]) -> None:
    """
    Validate that all required fields are present and non-empty.
    Raises ValidationError if validation fails.
    """
    required_fields = [
        "startup_category",
        "time_commitment",
        "budget_range",
        "risk_tolerance",
        "preferred_work_style",
        "startup_style",
        "customer_interaction",
        "location_context",
        "business_region",
        "industry_interest",
        "business_type",
        "earnings_timeline",
        "founder_ambition"
    ]
    
    missing_fields = []
    for field in required_fields:
        value = inputs.get(field)
        if not value or (isinstance(value, str) and not value.strip()):
            missing_fields.append(field)
    
    if missing_fields:
        import logging
        logger = logging.getLogger("startup_discovery")
        logger.warning(f"Missing required fields: {missing_fields}. Received inputs: {list(inputs.keys())}")
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            details={"missing_fields": missing_fields, "received_fields": list(inputs.keys())}
        )


def normalize_skills(skills: Any) -> Dict[str, Any]:
    """
    Normalize skills structure to ensure consistent format.
    Returns normalized skills dict.
    """
    if skills is None:
        # Auto-fill empty skills structure
        return {
            "technical": [],
            "creative": [],
            "physical": [],
            "business": [],
            "soft": [],
            "other": ""
        }
    elif not isinstance(skills, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format: 'skills' must be an object with categories"
        )
    else:
        # Ensure all categories exist (fill missing ones)
        default_skills = {
            "technical": [],
            "creative": [],
            "physical": [],
            "business": [],
            "soft": [],
            "other": ""
        }
        cleaned = {}
        for cat, default in default_skills.items():
            val = skills.get(cat, default)
            # Normalize types
            if cat == "other":
                cleaned[cat] = str(val) if val else ""
            else:
                cleaned[cat] = val if isinstance(val, list) else []
        return cleaned

