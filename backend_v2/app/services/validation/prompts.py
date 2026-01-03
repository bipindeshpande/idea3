"""Prompt building for validation analysis and next steps"""
from typing import Dict, Any, Optional


class ValidationPromptBuilder:
    """Builds prompts for validation analysis and next steps generation"""
    
    @staticmethod
    def build_group_analysis_prompt(
        group: Dict[str, Any],
        category_answers: Dict[str, Any],
        idea_explanation: str
    ) -> str:
        """
        Build focused prompt for analyzing one parameter group.
        
        This is validation-specific and isolated from other services.
        """
        param_names = [name for _, name in group["parameters"]]
        
        prompt_parts = [
            f"Analyze this startup idea across these {len(group['parameters'])} related parameters: {', '.join(param_names)}",
            f"Context: {group['context']}",
            "",
            "**Idea Description:**",
            idea_explanation,
            "",
            "**Business Details:**",
            f"Industry: {category_answers.get('industry', 'Not specified')}",
            f"Stage: {category_answers.get('stage', 'Not specified')}",
            f"Geography: {category_answers.get('geography', 'Not specified')}",
            f"Business Type: {category_answers.get('business_archetype', category_answers.get('business_type', 'Not specified'))}",
            f"Revenue Model: {category_answers.get('revenue_model', 'Not specified')}",
            f"Problem Category: {category_answers.get('problem_category', 'Not specified')}",
            f"Solution Type: {category_answers.get('solution_type', 'Not specified')}",
            f"User Type: {category_answers.get('user_type', 'Not specified')}",
            "",
            "**Your Task:**",
            "For each parameter, provide:",
            "1. A score from 1-10 (be realistic and critical, where 1-3 = weak, 4-6 = fair, 7-8 = strong, 9-10 = excellent)",
            "2. A detailed 2-3 sentence analysis explaining the score, focusing on strengths and concerns",
            "",
            "Parameters to analyze:"
        ]
        
        for param_key, param_name in group["parameters"]:
            prompt_parts.append(f"- {param_name} ({param_key})")
        
        prompt_parts.extend([
            "",
            "Return a JSON object with 'scores' and 'details' objects containing entries for each parameter.",
            "Be critical but fair in your assessment. Base scores on the idea's actual potential, not just optimism."
        ])
        
        return "\n".join(prompt_parts)
    
    @staticmethod
    def build_next_steps_prompt(
        user_profile: Optional[Dict[str, Any]],
        idea_details: Optional[Dict[str, Any]],
        validation_results: Optional[Dict[str, Any]],
        user_constraints: Optional[Dict[str, Any]]
    ) -> str:
        """Build prompt for next_steps generation"""
        prompt_parts = [
            "Generate personalized, actionable next steps for this startup idea.",
            "",
            "**Your Response Must Include:**",
            "1. **30-Day Actions**: Immediate, quick-win steps to start validation",
            "2. **60-Day Actions**: Medium-term development and testing steps",
            "3. **90-Day Actions**: Longer-term scaling and growth steps",
            "4. **Skill Gaps & Resources**: Identify missing skills and where to acquire them",
            "5. **Quick Wins**: Fast, low-effort actions to build momentum",
            "6. **Early Customer Testing Steps**: Specific ways to test with real customers",
            "",
            "Format your response as clear markdown with numbered/bulleted lists.",
            "",
        ]
        
        # Add idea details
        if idea_details:
            prompt_parts.append("**Idea Details:**")
            if idea_details.get("explanation"):
                prompt_parts.append(f"Idea: {idea_details['explanation']}")
            if idea_details.get("category_answers"):
                answers = idea_details["category_answers"]
                prompt_parts.append(f"Business Type: {answers.get('business_archetype', answers.get('business_type', 'Not specified'))}")
                prompt_parts.append(f"Delivery Channel: {answers.get('delivery_channel', 'Not specified')}")
            prompt_parts.append("")
        
        # Add validation results
        if validation_results:
            prompt_parts.append("**Validation Results:**")
            overall_score = validation_results.get("overall_score", 0)
            prompt_parts.append(f"Overall Score: {overall_score}/10")
            
            scores = validation_results.get("scores", {})
            if scores:
                prompt_parts.append("Parameter Scores:")
                for param, score in scores.items():
                    param_name = param.replace("_", " ").title()
                    prompt_parts.append(f"- {param_name}: {score}/10")
            
            recommendations = validation_results.get("recommendations", "")
            if recommendations:
                prompt_parts.append(f"Analysis: {recommendations[:500]}...")
            prompt_parts.append("")
        
        # Add user profile
        if user_profile:
            prompt_parts.append("**User Profile:**")
            if isinstance(user_profile, dict):
                for key, value in user_profile.items():
                    if value:
                        key_name = key.replace("_", " ").title()
                        prompt_parts.append(f"- {key_name}: {value}")
            elif isinstance(user_profile, str):
                prompt_parts.append(user_profile[:1000])
            prompt_parts.append("")
        
        # Add user constraints
        if user_constraints:
            prompt_parts.append("**User Constraints & Resources:**")
            if user_constraints.get("budget_range"):
                prompt_parts.append(f"Budget: {user_constraints['budget_range']}")
            if user_constraints.get("time_commitment"):
                prompt_parts.append(f"Time Commitment: {user_constraints['time_commitment']}")
            if user_constraints.get("risk_tolerance"):
                prompt_parts.append(f"Risk Tolerance: {user_constraints['risk_tolerance']}")
            if user_constraints.get("skills"):
                skills = user_constraints["skills"]
                if isinstance(skills, dict):
                    skill_list = []
                    for category, skill_array in skills.items():
                        if category != "other" and isinstance(skill_array, list) and skill_array:
                            skill_list.extend(skill_array)
                    if skill_list:
                        prompt_parts.append(f"Existing Skills: {', '.join(skill_list)}")
                elif isinstance(skills, list):
                    prompt_parts.append(f"Existing Skills: {', '.join(skills)}")
            prompt_parts.append("")
        
        prompt_parts.append(
            "**Instructions:**"
            "\n- Make recommendations specific to THIS idea and THIS user"
            "\n- Consider their constraints (budget, time, skills)"
            "\n- Prioritize validation and customer testing early"
            "\n- Be practical and actionable"
            "\n- Use markdown formatting with headers and lists"
        )
        
        return "\n".join(prompt_parts)

