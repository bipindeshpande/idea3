"""
Idea Enrichment Service - Adds discovery-level next steps to ideas.
"""
import copy
from typing import Dict, Any, List
from app.services.base_service import BaseService
from app.services.llm_service import LLMService


class IdeaEnrichmentService(BaseService):
    """Service for enriching ideas with discovery-level next steps."""
    
    def __init__(self, db, redis_client=None):
        super().__init__(db, redis_client)
        self.llm_service = LLMService(db, redis_client)
    
    def add_discovery_next_steps(
        self,
        ideas: List[Dict[str, Any]],
        profile_data: Dict[str, Any],
        inputs: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Add lightweight, early-stage next steps to each idea for Discovery.
        
        These are 3-5 bullet points focusing on:
        - Test basic demand
        - Create a rough prototype
        - Talk to 2-3 people
        - Validate pricing
        - Create a simple landing page
        
        These are NOT validation-level deep next steps.
        """
        enriched_ideas = []
        
        # Deep clone to prevent reference reuse
        for idea in ideas:
            enriched_idea = copy.deepcopy(idea)
            
            # Generate lightweight next_steps
            try:
                next_steps = self._generate_lightweight_next_steps(idea, profile_data, inputs)
                self._log(f"Generated next_steps for idea '{idea.get('title', 'unknown')}': length={len(next_steps) if next_steps else 0}", "INFO")
            except Exception as e:
                self._log(f"Failed to generate next_steps for idea '{idea.get('title', 'unknown')}': {e}", "ERROR")
                # Use fallback
                next_steps = "- Test basic demand with a simple landing page\n- Talk to 3-5 potential customers\n- Create a rough prototype\n- Validate pricing\n- Get feedback and iterate"
            
            # Store in enrichment.next_steps
            enriched_idea["enrichment"] = {
                "next_steps": next_steps
            }
            
            # Verify it was stored
            if not enriched_idea.get("enrichment", {}).get("next_steps"):
                self._log(f"WARNING: next_steps not stored for idea '{idea.get('title', 'unknown')}'", "WARNING")
            
            enriched_ideas.append(enriched_idea)
        
        return enriched_ideas
    
    def _generate_lightweight_next_steps(
        self,
        idea: Dict[str, Any],
        profile_data: Dict[str, Any],
        inputs: Dict[str, Any]
    ) -> str:
        """
        Generate lightweight, early-stage next steps (3-5 bullets).
        
        Uses short LLM prompt focused on early validation, not deep planning.
        """
        try:
            idea_title = idea.get("title", "")
            idea_summary = idea.get("summary", "")
            target_market = idea.get("target_market", "")
            
            # Extract user constraints
            budget = inputs.get("budget_range", "")
            time_commitment = inputs.get("time_commitment", "")
            skills = inputs.get("skills", {})
            
            # Build skills string
            skill_list = []
            if isinstance(skills, dict):
                for category, skill_array in skills.items():
                    if category != "other" and isinstance(skill_array, list):
                        skill_list.extend(skill_array)
                    elif category == "other" and skill_array:
                        skill_list.append(str(skill_array))
            
            skills_str = ", ".join(skill_list) if skill_list else "general skills"
            
            # Extract operating constraints from profile
            constraints = ""
            if isinstance(profile_data, dict):
                constraints = profile_data.get("operating_constraints", "")
            elif isinstance(profile_data, str):
                # Try to extract from string
                if "operating_constraints" in profile_data.lower():
                    constraints = "Based on user's constraints"
            
            # Build lightweight prompt
            prompt = f"""Generate 3-5 lightweight, early-stage next steps for this startup idea.
Focus on SIMPLE, QUICK validation actions that can be done in 1-2 weeks.

**Idea:**
Title: {idea_title}
Summary: {idea_summary}
Target Market: {target_market}

**User Constraints:**
- Budget: {budget}
- Time Available: {time_commitment}
- Skills: {skills_str}
- Constraints: {constraints if constraints else "Standard startup constraints"}

**Requirements:**
- Return ONLY a bulleted list (3-5 items)
- Each item should be 1 short sentence
- Focus on early validation: testing demand, talking to people, simple prototypes
- Keep it lightweight - no 90-day plans or deep strategy
- Make it actionable and specific to this idea

**Format:**
- Test [specific validation method]
- Create [simple artifact]
- Talk to [target group]
- Validate [specific assumption]
- Build [minimal prototype]

Generate the next steps now:"""

            system_prompt = """You are a startup advisor helping founders with early-stage validation.
Generate lightweight, actionable next steps focused on quick validation.
Keep responses brief - 3-5 bullet points only. No long explanations."""

            response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=300,  # Keep it short
                run_id=None
            )
            
            content = response.get("content", "").strip()
            
            # Clean up the response - ensure it's a bullet list
            if not content:
                # Fallback
                return "- Test basic demand with a simple landing page\n- Talk to 3-5 potential customers\n- Create a rough prototype or mockup\n- Validate pricing assumptions\n- Get initial feedback and iterate"
            
            # Normalize to bullet points
            lines = content.split("\n")
            bullets = []
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                # Ensure it starts with a bullet
                if not line.startswith("-") and not line.startswith("*") and not line[0].isdigit():
                    line = "- " + line
                elif line[0].isdigit() and ". " in line:
                    # Convert numbered list to bullets
                    line = "- " + line.split(". ", 1)[1]
                bullets.append(line)
            
            result = "\n".join(bullets[:5])  # Max 5 bullets
            return result if result else "- Test basic demand\n- Talk to potential customers\n- Create a simple prototype"
            
        except Exception as e:
            self._log(f"Failed to generate lightweight next_steps: {e}", "WARNING")
            # Return simple fallback
            return "- Test basic demand with a simple landing page\n- Talk to 3-5 potential customers\n- Create a rough prototype\n- Validate pricing\n- Get feedback and iterate"

