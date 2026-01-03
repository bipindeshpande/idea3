"""Fallback logic for validation when LLM calls fail"""
from typing import Dict, Any, Optional
from .constants import VALIDATION_PARAMETER_GROUPS


class ValidationFallbacks:
    """Handles fallback responses when validation analysis fails"""
    
    @staticmethod
    def get_fallback_group_analysis(group_id: str) -> Dict[str, Any]:
        """
        Return fallback scores/details if LLM call fails for a group.
        
        This ensures validation always returns valid data even if some groups fail.
        Isolated from other services - doesn't affect discovery pipeline.
        """
        group = next((g for g in VALIDATION_PARAMETER_GROUPS if g["group_id"] == group_id), None)
        
        if not group:
            # Fallback if group not found
            return {"scores": {}, "details": {}}
        
        # Default to 6.0 score and generic message
        scores = {param_key: 6.0 for param_key, _ in group["parameters"]}
        details = {
            param_key: f"Analysis for {param_name} could not be generated at this time. Please try again or review manually."
            for param_key, param_name in group["parameters"]
        }
        
        return {"scores": scores, "details": details}
    
    @staticmethod
    def get_fallback_next_steps(validation_results: Optional[Dict[str, Any]]) -> str:
        """Return fallback generic next steps if LLM generation fails"""
        overall_score = validation_results.get("overall_score", 5.0) if validation_results else 5.0
        
        if overall_score >= 7:
            return """## Next Steps

### 30-Day Actions
1. Create an MVP roadmap
2. Validate with real customers
3. Build a landing page

### 60-Day Actions
1. Launch MVP
2. Gather user feedback
3. Iterate based on learnings

### 90-Day Actions
1. Scale based on validated learnings
2. Consider funding if needed
3. Build team"""
        else:
            return """## Next Steps

### 30-Day Actions
1. Refine your idea based on feedback
2. Conduct market research
3. Talk to potential customers

### 60-Day Actions
1. Validate core assumptions
2. Test problem-solution fit
3. Iterate on your concept

### 90-Day Actions
1. Develop MVP if validated
2. Continue customer discovery
3. Refine business model"""
    
    @staticmethod
    def generate_summary_recommendations(
        scores: Dict[str, float],
        details: Dict[str, str]
    ) -> str:
        """
        Generate summary recommendations based on scores and details.
        
        This is a simple rule-based approach (no LLM call) for speed.
        Can be enhanced later with LLM if needed.
        """
        if not scores:
            return "Unable to generate recommendations. Please review the validation details manually."
        
        overall_score = sum(scores.values()) / len(scores) if scores else 0
        
        # Identify top strengths and weaknesses
        sorted_params = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_strength = sorted_params[0] if sorted_params else None
        top_weakness = sorted_params[-1] if sorted_params else None
        
        if overall_score >= 8:
            base_msg = "Your idea shows strong potential across multiple dimensions."
            if top_strength:
                strength_name = top_strength[0].replace("_", " ").title()
                base_msg += f" Your strongest area is {strength_name}."
            return f"{base_msg} Focus on early customer validation and MVP development to capitalize on this strength."
        
        elif overall_score >= 6:
            base_msg = "Your idea has good potential with some areas for improvement."
            if top_weakness:
                weakness_name = top_weakness[0].replace("_", " ").title()
                base_msg += f" Consider strengthening {weakness_name} through research and validation."
            return f"{base_msg} Focus on addressing weaker areas while building on your strengths."
        
        else:
            base_msg = "Your idea has potential but needs significant refinement."
            if top_weakness:
                weakness_name = top_weakness[0].replace("_", " ").title()
                base_msg += f" Priority should be improving {weakness_name}."
            return f"{base_msg} Consider pivoting or addressing key weaknesses before moving forward."

