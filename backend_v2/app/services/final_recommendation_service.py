"""
Final Recommendation Service - Generates premium final recommendation for discovery results.
"""
import json
import re
from typing import Dict, Any, List, Optional
from app.services.base_service import BaseService
from app.services.llm_service import LLMService


class FinalRecommendationService(BaseService):
    """Service for generating final recommendations."""
    
    def __init__(self, db, redis_client=None):
        super().__init__(db, redis_client)
        self.llm_service = LLMService(db, redis_client)
    
    def generate_final_recommendation(
        self,
        ideas: List[Dict[str, Any]],
        profile_analysis: str,
        inputs: Dict[str, Any],
        run_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Generate a premium Final Recommendation with structured decision, rationale, and recommended_path.
        
        Returns:
            {
                "decision": "pursue" | "pursue_with_caution" | "validate_further" | "consider_pivot" | "do_not_pursue",
                "rationale": [str, str, str],  # 3-5 rationale bullets
                "recommended_path": str  # Single sentence strategic direction
            }
        """
        try:
            if not ideas or len(ideas) == 0:
                return None
            
            # Extract top 3 ideas
            top_ideas = ideas[:3]
            
            # Parse profile analysis
            profile_data = {}
            if profile_analysis:
                try:
                    start_marker = "---PROFILE_ANALYSIS_START---"
                    end_marker = "---PROFILE_ANALYSIS_END---"
                    start_idx = profile_analysis.find(start_marker)
                    end_idx = profile_analysis.find(end_marker)
                    
                    if start_idx != -1 and end_idx != -1:
                        json_text = profile_analysis[start_idx + len(start_marker):end_idx].strip()
                        profile_data = json.loads(json_text)
                    else:
                        profile_data = json.loads(profile_analysis)
                except (json.JSONDecodeError, ValueError):
                    profile_data = {"raw": profile_analysis}
            
            # Extract user constraints and signals
            budget = inputs.get("budget_range", "not specified")
            time_commitment = inputs.get("time_commitment", "not specified")
            risk_tolerance = inputs.get("risk_tolerance", "moderate")
            goal_type = inputs.get("goal_type", "your goals")
            
            # Extract skills
            skills = inputs.get("skills", {})
            skill_list = []
            if isinstance(skills, dict):
                for category, skill_array in skills.items():
                    if category != "other" and isinstance(skill_array, list):
                        skill_list.extend(skill_array)
                    elif category == "other" and skill_array:
                        skill_list.append(str(skill_array))
            skills_str = ", ".join(skill_list[:5]) if skill_list else "general skills"
            
            # Extract experience level and ambition
            experience_level = inputs.get("experience_level", "not specified")
            ambition_level = inputs.get("ambition_level", "moderate")
            
            # Build idea summaries
            idea_summaries = []
            for idx, idea in enumerate(top_ideas, 1):
                title = idea.get("title", f"Idea {idx}")
                summary = idea.get("summary", "")
                validation_score = idea.get("validation_score", "")
                idea_summaries.append(f"{idx}. {title}: {summary} (Validation Score: {validation_score})")
            
            ideas_text = "\n".join(idea_summaries)
            
            # Extract feasibility signals from profile
            operating_constraints = profile_data.get("operating_constraints", "") if isinstance(profile_data, dict) else ""
            strengths = profile_data.get("strengths_and_capabilities", "") if isinstance(profile_data, dict) else ""
            red_flags = profile_data.get("viability_red_flags", "") if isinstance(profile_data, dict) else ""
            
            # Build prompt
            prompt = f"""You are a premium startup advisor providing a high-level strategic decision summary.

**Top Recommendations:**
{ideas_text}

**User Profile:**
- Budget: {budget}
- Time Commitment: {time_commitment}
- Risk Tolerance: {risk_tolerance}
- Goal Type: {goal_type}
- Experience Level: {experience_level}
- Ambition Level: {ambition_level}
- Skills: {skills_str}
- Operating Constraints: {operating_constraints[:200] if operating_constraints else "Standard constraints"}
- Strengths: {strengths[:200] if strengths else "General capabilities"}
- Red Flags: {red_flags[:200] if red_flags else "None identified"}

**Your Task:**
Generate a premium Final Recommendation that provides ONE clear decision, supported by 3-5 strategic insights.

**CRITICAL REQUIREMENTS:**
1. Decision must be ONE of these exact labels: "pursue", "pursue_with_caution", "validate_further", "consider_pivot", "do_not_pursue"
2. Rationale must be 3-5 bullets, each 1-2 sentences, mentioning specific signals (scores, constraints, insights)
3. Recommended path must be a single sentence representing the strategic direction
4. Do NOT repeat any step-by-step actions or tactical guidance
5. Do NOT repeat any content from Next Steps sections
6. Do NOT include lists of tasks
7. This section must ONLY contain: decision, strategic rationale, and strategic direction
8. Every rationale bullet must mention a specific signal (score, constraint, or insight)
9. No generic coaching language allowed
10. The decision must depend directly on the user's constraints and the idea's feasibility

**Output Format (JSON only):**
{{
  "decision": "<one of: pursue / pursue_with_caution / validate_further / consider_pivot / do_not_pursue>",
  "rationale": [
    "<1-2 sentence rationale #1 mentioning specific signal>",
    "<1-2 sentence rationale #2 mentioning specific signal>",
    "<1-2 sentence rationale #3 mentioning specific signal>",
    "<1-2 sentence rationale #4 mentioning specific signal>",
    "<1-2 sentence rationale #5 mentioning specific signal>"
  ],
  "recommended_path": "<a single sentence representing the strategic direction>"
}}

Generate the Final Recommendation now:"""

            system_prompt = """You are a premium startup advisor providing executive-level strategic summaries.
Your recommendations must be strategic, high-level, and decision-focused.
Do NOT include tactical steps, task lists, or action items.
Focus on: decision clarity, strategic rationale, and strategic direction.
Every insight must reference specific signals from the user's profile or idea analysis."""

            response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.5,
                max_tokens=800,
                run_id=run_id
            )
            
            content = response.get("content", "").strip()
            
            # Parse JSON from response
            try:
                # Try to extract JSON from markdown code blocks
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
                if json_match:
                    content = json_match.group(1)
                else:
                    # Try to find JSON object directly
                    json_match = re.search(r'\{.*?\}', content, re.DOTALL)
                    if json_match:
                        content = json_match.group(0)
                
                result = json.loads(content)
                
                # Validate decision
                valid_decisions = ["pursue", "pursue_with_caution", "validate_further", "consider_pivot", "do_not_pursue"]
                decision = result.get("decision", "").lower().strip()
                if decision not in valid_decisions:
                    self._log(f"Invalid decision '{decision}', falling back to 'validate_further'", "WARNING")
                    decision = "validate_further"
                
                # Validate rationale (ensure it's a list of 3-5 items)
                rationale = result.get("rationale", [])
                if not isinstance(rationale, list):
                    rationale = [str(rationale)] if rationale else []
                rationale = [str(r).strip() for r in rationale if r and str(r).strip()]
                if len(rationale) < 3:
                    # Generate fallback rationale
                    rationale = [
                        f"Top recommendation aligns with your {goal_type} goals and {time_commitment} time commitment.",
                        f"Budget constraints ({budget}) are compatible with the recommended approach.",
                        f"Your {skills_str} skills provide a strong foundation for execution."
                    ]
                rationale = rationale[:5]  # Max 5 items
                
                # Validate recommended_path
                recommended_path = result.get("recommended_path", "").strip()
                if not recommended_path:
                    recommended_path = f"Proceed with validation and early-stage testing aligned with your {goal_type} objectives."
                
                return {
                    "decision": decision,
                    "rationale": rationale,
                    "recommended_path": recommended_path
                }
                
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                self._log(f"Failed to parse Final Recommendation JSON: {e}", "WARNING")
                # Return fallback
                return {
                    "decision": "validate_further",
                    "rationale": [
                        f"Top recommendation shows alignment with your {goal_type} goals.",
                        f"Time commitment ({time_commitment}) and budget ({budget}) are compatible.",
                        f"Your skills and experience level support this direction."
                    ],
                    "recommended_path": f"Proceed with validation and early-stage testing aligned with your {goal_type} objectives."
                }
            
        except Exception as e:
            self._log(f"Failed to generate Final Recommendation: {e}", "WARNING")
            return None

