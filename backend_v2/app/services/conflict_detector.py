"""
Conflict Detector - Detects soft conflicts in user inputs and provides
adjustment guidance for recommendation generation.

This module identifies combinations that are uncommon or risky (e.g., 
non-technical + tech-heavy ideas) and provides guidance for reframing
recommendations instead of rejecting them.
"""

from typing import Dict, Any, List, Optional, Tuple


class ConflictDetector:
    """
    Detects soft conflicts in discovery inputs and provides adjustment guidance.
    Never blocks or errors - only provides signals for adjusting recommendations.
    """
    
    # Define conflict patterns: (field_combination, conflict_type, adjustment_guidance)
    CONFLICT_PATTERNS = [
        # Non-technical + Tech-heavy industries
        {
            "conditions": {
                "skill_strength": "non_technical",
                "industry_interest": ["ai", "software", "tech", "saas"]
            },
            "conflict_type": "skill_industry_mismatch",
            "adjustment": {
                "focus_areas": ["operations", "branding", "services", "marketplace", "distribution", "content"],
                "avoid_areas": ["software_development", "deep_tech", "engineering"],
                "message": "Based on your preference for non-technical work, we focused on {industry} ideas that rely more on operations, branding, and partnerships rather than software development.",
                "optional_clarification": "If you're open to light tech (no coding required), you'll see more options."
            }
        },
        
        # Non-technical + Food (tech expectations)
        {
            "conditions": {
                "skill_strength": "non_technical",
                "startup_category": "tech",
                "industry_interest": ["food", "food_and_beverage", "restaurant"]
            },
            "conflict_type": "category_industry_mismatch",
            "adjustment": {
                "focus_areas": ["operations", "sourcing", "distribution", "marketplace", "branding", "services"],
                "avoid_areas": ["food_tech", "delivery_apps", "ordering_platforms"],
                "message": "Based on your preferences, we focused on food business ideas that emphasize operations, branding, and partnerships rather than technical development.",
                "optional_clarification": "If you're open to light tech tools (no coding), you'll see more food tech options."
            }
        },
        
        # Low budget + High-capital industries
        {
            "conditions": {
                "budget_range": ["$0-5k", "under_5k", "$5k-20k"],
                "industry_interest": ["manufacturing", "manufacturing_crafts", "healthcare", "real_estate"]
            },
            "conflict_type": "budget_industry_mismatch",
            "adjustment": {
                "focus_areas": ["services", "consulting", "marketplace", "digital", "low_overhead"],
                "avoid_areas": ["manufacturing", "capital_intensive", "inventory"],
                "message": "Given your budget constraints, we focused on {industry} ideas that have lower startup costs and faster paths to revenue.",
                "optional_clarification": "If your budget increases, you'll see more capital-intensive options."
            }
        },
        
        # Part-time + Time-intensive industries
        {
            "conditions": {
                "time_commitment": ["5-10 hours/week", "10-20 hours/week", "part_time"],
                "industry_interest": ["restaurant", "retail", "home_services"]
            },
            "conflict_type": "time_industry_mismatch",
            "adjustment": {
                "focus_areas": ["automated", "online", "passive", "partnerships", "outsourced_operations"],
                "avoid_areas": ["hands_on_daily", "in_person_required", "operational_intensive"],
                "message": "Based on your part-time commitment, we focused on {industry} ideas that can be run with flexible hours and minimal daily operations.",
                "optional_clarification": "If you can commit more time, you'll see more hands-on options."
            }
        },
        
        # Solo + Team-required models
        {
            "conditions": {
                "preferred_work_style": ["independent", "solo", "independent/solo"],
                "startup_style": ["local_service_business", "retail"]
            },
            "conflict_type": "work_style_mismatch",
            "adjustment": {
                "focus_areas": ["solo_executable", "automated", "digital", "consulting", "content"],
                "avoid_areas": ["team_required", "multiple_locations", "complex_operations"],
                "message": "Based on your preference for solo work, we focused on ideas that can be executed independently without requiring a team.",
                "optional_clarification": "If you're open to partnerships, you'll see more scalable options."
            }
        },
        
        # Low risk tolerance + High-risk industries
        {
            "conditions": {
                "risk_tolerance": ["low", "conservative", "very_low"],
                "industry_interest": ["crypto", "blockchain", "biotech", "pharma"]
            },
            "conflict_type": "risk_tolerance_mismatch",
            "adjustment": {
                "focus_areas": ["proven_models", "stable_markets", "low_volatility", "validation_first"],
                "avoid_areas": ["speculative", "regulatory_uncertainty", "high_volatility"],
                "message": "Based on your conservative risk approach, we focused on ideas with proven models and lower regulatory complexity.",
                "optional_clarification": "If you're open to higher-risk opportunities, you'll see more innovative options."
            }
        },
        
        # Remote + Location-dependent
        {
            "conditions": {
                "preferred_work_style": ["remote", "remote_friendly", "flexible"],
                "startup_style": ["local_service_business", "home_based_business"],
                "location_context": ["local", "neighborhood"]
            },
            "conflict_type": "location_preference_mismatch",
            "adjustment": {
                "focus_areas": ["digital", "online", "remote_deliverable", "virtual_services"],
                "avoid_areas": ["in_person", "location_dependent", "local_only"],
                "message": "Based on your preference for remote work, we focused on ideas that can be delivered online or remotely.",
                "optional_clarification": "If you're open to local presence, you'll see more location-based options."
            }
        }
    ]
    
    @staticmethod
    def detect_conflicts(inputs: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Detect soft conflicts in user inputs.
        
        Returns:
            List of conflict dicts with:
            - conflict_type: Type of conflict detected
            - adjustment: Guidance for adjusting recommendations
            - severity: "low", "medium", "high" (informational only)
        """
        conflicts = []
        
        # Normalize inputs for comparison
        normalized = ConflictDetector._normalize_inputs(inputs)
        
        # Check each conflict pattern
        for pattern in ConflictDetector.CONFLICT_PATTERNS:
            if ConflictDetector._matches_pattern(normalized, pattern["conditions"]):
                conflicts.append({
                    "conflict_type": pattern["conflict_type"],
                    "adjustment": pattern["adjustment"],
                    "severity": "medium"  # All are soft conflicts, never blocking
                })
        
        return conflicts
    
    @staticmethod
    def _normalize_inputs(inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize inputs for pattern matching."""
        normalized = {}
        
        # Normalize skill_strength
        skill_strength = inputs.get("skill_strength", "").lower()
        if "non" in skill_strength and "tech" in skill_strength:
            normalized["skill_strength"] = "non_technical"
        elif "tech" in skill_strength:
            normalized["skill_strength"] = "technical"
        else:
            normalized["skill_strength"] = skill_strength
        
        # Normalize industry_interest
        industry = inputs.get("industry_interest", "").lower()
        normalized["industry_interest"] = industry
        
        # Normalize startup_category
        category = inputs.get("startup_category", "").lower()
        normalized["startup_category"] = category
        
        # Normalize budget_range
        budget = inputs.get("budget_range", "").lower()
        normalized["budget_range"] = budget
        
        # Normalize time_commitment
        time = inputs.get("time_commitment", "").lower()
        normalized["time_commitment"] = time
        
        # Normalize preferred_work_style
        work_style = inputs.get("preferred_work_style", "").lower()
        normalized["preferred_work_style"] = work_style
        
        # Normalize startup_style
        startup_style = inputs.get("startup_style", "").lower()
        normalized["startup_style"] = startup_style
        
        # Normalize risk_tolerance
        risk = inputs.get("risk_tolerance", "").lower()
        normalized["risk_tolerance"] = risk
        
        # Normalize location_context
        location = inputs.get("location_context", "").lower()
        normalized["location_context"] = location
        
        return normalized
    
    @staticmethod
    def _matches_pattern(normalized: Dict[str, Any], conditions: Dict[str, Any]) -> bool:
        """Check if normalized inputs match a pattern's conditions."""
        for key, expected_value in conditions.items():
            actual_value = normalized.get(key, "")
            
            if isinstance(expected_value, list):
                # Check if actual value matches any in the list
                if not any(val in actual_value for val in [actual_value, actual_value.replace("_", " "), actual_value.replace(" ", "_")]):
                    # Also check partial matches
                    if not any(exp in actual_value for exp in expected_value):
                        return False
            else:
                # Exact or partial match
                expected_str = str(expected_value).lower()
                actual_str = str(actual_value).lower()
                if expected_str not in actual_str and actual_str not in expected_str:
                    return False
        
        return True
    
    @staticmethod
    def build_adjustment_instructions(conflicts: List[Dict[str, Any]], inputs: Dict[str, Any]) -> str:
        """
        Build prompt instructions for adjusting recommendations based on detected conflicts.
        
        Returns:
            String with adjustment instructions to add to the prompt
        """
        if not conflicts:
            return ""
        
        instructions = []
        instructions.append("\nRECOMMENDATION ADJUSTMENT GUIDANCE (IMPORTANT):")
        instructions.append("The user's inputs suggest some uncommon combinations. Adjust your recommendations accordingly:")
        instructions.append("")
        
        for conflict in conflicts:
            adj = conflict["adjustment"]
            industry = inputs.get("industry_interest", "this industry")
            
            instructions.append(f"- Focus on: {', '.join(adj['focus_areas'])}")
            instructions.append(f"- Avoid: {', '.join(adj['avoid_areas'])}")
            instructions.append("")
        
        instructions.append("CRITICAL: Still generate valuable recommendations that fit their constraints.")
        instructions.append("Reframe ideas to work within their preferences - don't reject the combination.")
        instructions.append("")
        
        return "\n".join(instructions)
    
    @staticmethod
    def build_user_message(conflicts: List[Dict[str, Any]], inputs: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Build user-friendly message to show in results.
        
        Returns:
            Dict with:
            - message: Main message to display
            - optional_clarification: Optional suggestion (if applicable)
            or None if no conflicts
        """
        if not conflicts:
            return None
        
        # Use the first conflict's message (most relevant)
        conflict = conflicts[0]
        adj = conflict["adjustment"]
        industry = inputs.get("industry_interest", "your industry")
        
        # Format industry name nicely
        industry_display = industry.replace("_", " ").title()
        
        message = adj["message"].format(industry=industry_display)
        
        result = {
            "message": message,
            "optional_clarification": adj.get("optional_clarification")
        }
        
        return result

