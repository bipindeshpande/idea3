"""Prompt building for profile analysis"""
import json
from typing import Dict, Any


class ProfilePromptBuilder:
    """Builds prompts for profile analysis"""
    
    @staticmethod
    def build_system_prompt(variables: Dict[str, Any]) -> str:
        """Build system prompt for profile analysis"""
        vars_json = json.dumps(variables, indent=2)
        
        return f"""You are an expert startup advisor who specializes in deeply analyzing user constraints, motivations, skills, contradictions, feasibility, and realistic pathways.

User Variables (use these throughout):
{vars_json}

Your ONLY task is to output valid JSON that follows EXACTLY this shape:

{{
  "core_motivations": "string",
  "operating_constraints": "string",
  "strengths_and_capabilities": "string",
  "strategic_considerations": "string",
  "viability_red_flags": "string",
  "pathway_recommendation": "string"
}}

STRICT OUTPUT RULES:
- Return ONLY valid JSON. No markdown, no code fences, no commentary.
- Do NOT add or remove keys.
- All values MUST be plain text strings.
- Speak directly to the user in FIRST PERSON ("you", "your").
- Do NOT use third person ("the user", "they", "their").
- Do NOT include bullet points unless inside a string.

TONE REQUIREMENTS (apply globally):
- Advisor-like: confident, direct, analytical, non-generic
- No filler lines like "in summary" or "in conclusion"
- Every sentence must reference the user's actual variables from User Variables dictionary above
- Use dense personalization: connect multiple variables in single sentences
- Cross-reference other sections when relevant (e.g., "Given your motivations in Section 1...")

SECTION-SPECIFIC PERSONALIZATION REQUIREMENTS WITH CROSS-REFERENCING:

1. CORE_MOTIVATIONS - MUST use: experience_level ({variables.get('experience_level', 'unknown')}), goal_timeline ({variables.get('goal_timeline', 'not specified')}), idea_type ({variables.get('idea_type', 'not specified')}), timeline_urgency_score ({variables.get('timeline_urgency_score', 5)})
   - Connect why the user wants to start NOW based on experience_level and timeline_urgency_score
   - Reference their specific goal_timeline and tie to idea_type preferences
   - Cross-reference variables densely (e.g., "Your [experience_level] background combined with [timeline_urgency_score]/10 urgency for [idea_type] indicates...")
   - NO generic statements - every sentence must reference one of these variables

2. OPERATING_CONSTRAINTS - MUST use: time_commitment ({variables.get('time_commitment', 'not specified')}), budget ({variables.get('budget', 'not specified')}), risk_tolerance ({variables.get('risk_tolerance', 'not specified')}), entrepreneurial_risk_profile ({variables.get('entrepreneurial_risk_profile', 'moderate')}), biggest_constraint ({variables.get('biggest_constraint', 'moderate')})
   - CROSS-REFERENCE Section 1: Reference motivations when discussing constraints (e.g., "Despite ambitions in Section 1, your [time_commitment] constraint...")
   - Explicitly state how time_commitment limits options
   - Quantify budget constraints combined with entrepreneurial_risk_profile
   - Explain how entrepreneurial_risk_profile shapes decision-making
   - Identify biggest_constraint and its cascading effects
   - Include hidden constraints implied by combinations

3. STRENGTHS_AND_CAPABILITIES - MUST use: technical_strength ({variables.get('technical_strength', 'Limited')}), business_strength ({variables.get('business_strength', 'Limited')}), industry_background ({variables.get('industry_background', 'not specified')}), estimated_skill_seniority ({variables.get('estimated_skill_seniority', 'mid')})
   - CROSS-REFERENCE Section 2: Reference constraints when discussing strengths (e.g., "While Section 2 identifies constraints, your [estimated_skill_seniority] level in [technical_strength] enables...")
   - List specific technical capabilities with estimated_skill_seniority context
   - List specific business capabilities from skills
   - Connect industry_background to relevant experience with industry_fit_score ({variables.get('industry_fit_score', 5)}) context
   - Ground everything in actual skills/interests, not assumptions

4. STRATEGIC_CONSIDERATIONS - MUST use: market_readiness ({variables.get('market_readiness', 'moderate')}), industry_fit_score ({variables.get('industry_fit_score', 5)}), risk_tolerance ({variables.get('risk_tolerance', 'not specified')}), experience_level ({variables.get('experience_level', 'unknown')})
   - CROSS-REFERENCE Section 3: Reference gaps in strengths (e.g., "Given strengths in Section 3, your [industry_fit_score]/10 industry fit suggests...")
   - Assess market_readiness based on experience_level and resources
   - Use industry_fit_score to inform strategic positioning
   - Factor in risk_tolerance and experience_level for strategic decisions
   - Use cause-and-effect reasoning, not generic advice
   - Connect strategic implications directly to user's specific situation

5. VIABILITY_RED_FLAGS - MUST use: technical_strength ({variables.get('technical_strength', 'Limited')}), business_strength ({variables.get('business_strength', 'Limited')}), time_commitment ({variables.get('time_commitment', 'not specified')}), budget ({variables.get('budget', 'not specified')}), entrepreneurial_risk_profile ({variables.get('entrepreneurial_risk_profile', 'moderate')}), industry_fit_score ({variables.get('industry_fit_score', 5)})
   - Include ONLY red flags that directly apply to this user
   - If technical_strength is weak/Limited: flag technical requirements
   - If business_strength is weak/Limited: flag business/marketing needs
   - If time_commitment is limited: flag time-intensive ideas
   - If budget is low: flag capital-intensive ideas
   - If entrepreneurial_risk_profile is conservative: flag high-risk approaches
   - If industry_fit_score < 5: flag industry mismatch
   - Skip red flags that don't apply - if none apply, state "No significant red flags identified for your profile."

6. PATHWAY_RECOMMENDATION - MUST use: timeline_urgency_score ({variables.get('timeline_urgency_score', 5)}), time_commitment ({variables.get('time_commitment', 'not specified')}), budget ({variables.get('budget', 'not specified')}), idea_type ({variables.get('idea_type', 'not specified')})
   - CROSS-REFERENCE Section 5: Reference red flags when framing pathway (e.g., "To address red flags in Section 5, your pathway must...")
   - CROSS-REFERENCE Section 1: Connect back to motivations when framing the pathway
   - Create a customized execution plan that respects timeline_urgency_score and goal_timeline
   - Design phases that fit within time_commitment constraints
   - Suggest budget-appropriate steps aligned with idea_type
   - Provide specific, actionable steps tailored to these constraints

ABSOLUTE REQUIREMENTS:
- No generic sentences. Every line must explicitly connect to a user variable from User Variables dictionary.
- Cross-reference other sections when it adds value and clarity.
- Dense personalization: pack multiple variable references into single sentences.
- If a variable isn't relevant, skip it (don't use generic fallbacks).
- Output must feel uniquely written for this user's profile - like a premium advisor consultation.
- Identify contradictions in the user's inputs and mention them explicitly.
- Evaluate the REAL practicality of the user's constraints.
- Infer risks or bottlenecks even if the user did not state them directly.

ABSOLUTE NON-NEGOTIABLE RULE:
Your final answer MUST be JSON wrapped ONLY inside this delimiter structure:

---PROFILE_ANALYSIS_START---
{{ JSON CONTENT }}
---PROFILE_ANALYSIS_END---

Return NOTHING before or after these delimiters.
"""
    
    @staticmethod
    def build_user_prompt(inputs: Dict[str, Any], variables: Dict[str, Any]) -> str:
        """Build user prompt for profile analysis"""
        prompt_parts = [
            "Analyze the following user profile and provide a comprehensive, highly personalized analysis.",
            "",
            "**User Variables:**",
            json.dumps(variables, indent=2),
            "",
            "**User Profile Data:**",
        ]
        
        # Include all relevant inputs
        if inputs.get("time_commitment"):
            prompt_parts.append(f"- Time Commitment: {inputs['time_commitment']}")
        if inputs.get("budget_range"):
            prompt_parts.append(f"- Budget Range: {inputs['budget_range']}")
        if inputs.get("risk_tolerance"):
            prompt_parts.append(f"- Risk Tolerance: {inputs['risk_tolerance']}")
        if inputs.get("preferred_work_style"):
            prompt_parts.append(f"- Preferred Work Style: {inputs['preferred_work_style']}")
        if inputs.get("startup_style"):
            prompt_parts.append(f"- Startup Style: {inputs['startup_style']}")
        if inputs.get("business_type"):
            prompt_parts.append(f"- Business Type: {inputs['business_type']}")
        if inputs.get("earnings_timeline"):
            prompt_parts.append(f"- Earnings Timeline: {inputs['earnings_timeline']}")
        if inputs.get("founder_ambition"):
            prompt_parts.append(f"- Founder Ambition: {inputs['founder_ambition']}")
        if inputs.get("industry_interest"):
            prompt_parts.append(f"- Industry Interest: {inputs['industry_interest']}")
        if inputs.get("experience_summary"):
            prompt_parts.append(f"- Experience Summary: {inputs['experience_summary']}")
        
        # Skills
        skills = inputs.get("skills", {})
        if isinstance(skills, dict):
            skill_parts = []
            for category, value in skills.items():
                if category == "other" and value and isinstance(value, str) and value.strip():
                    skill_parts.append(f"Other: {value}")
                elif category != "other" and isinstance(value, list) and value:
                    skill_parts.append(f"{category.title()}: {', '.join(value)}")
            if skill_parts:
                prompt_parts.append(f"- Skills: {'; '.join(skill_parts)}")
        
        prompt_parts.append("")
        prompt_parts.append("=" * 80)
        prompt_parts.append("SECTION-SPECIFIC PERSONALIZATION RULES WITH CROSS-REFERENCING")
        prompt_parts.append("=" * 80)
        prompt_parts.append("")
        prompt_parts.append("TONE REQUIREMENTS (apply globally):")
        prompt_parts.append("- Advisor-like: confident, direct, analytical, non-generic")
        prompt_parts.append("- No filler lines like 'in summary' or 'in conclusion'")
        prompt_parts.append("- Every sentence must reference the user's actual variables from the User Variables dictionary above")
        prompt_parts.append("- Use dense personalization: connect multiple variables in single sentences")
        prompt_parts.append("- Cross-reference other sections when relevant (e.g., 'Given your motivations in Section 1...')")
        prompt_parts.append("")
        prompt_parts.append("1. CORE_MOTIVATIONS:")
        prompt_parts.append("   - REQUIRED variables: experience_level, goal_timeline, idea_type, timeline_urgency_score")
        prompt_parts.append("   - Connect why the user wants to start NOW based on experience_level and timeline_urgency_score")
        prompt_parts.append("   - Reference their specific goal_timeline and tie to idea_type preferences")
        prompt_parts.append("   - Example: 'Given your [experience_level] background with [timeline_urgency_score]/10 urgency, your [goal_timeline] timeline for [idea_type] opportunities indicates...'")
        prompt_parts.append("   - NO generic statements - every sentence must reference one of these variables")
        prompt_parts.append("")
        prompt_parts.append("2. OPERATING_CONSTRAINTS:")
        prompt_parts.append("   - REQUIRED variables: time_commitment, budget, risk_tolerance, entrepreneurial_risk_profile, biggest_constraint")
        prompt_parts.append("   - CROSS-REFERENCE: Reference motivations from Section 1 (e.g., 'Despite your ambitions in Section 1, your [time_commitment] constraint...')")
        prompt_parts.append("   - Explicitly state how time_commitment limits options (e.g., 'With [time_commitment], you can only pursue...')")
        prompt_parts.append("   - Quantify budget constraints and their implications (e.g., 'Your [budget] budget combined with [entrepreneurial_risk_profile] risk profile means...')")
        prompt_parts.append("   - Explain how entrepreneurial_risk_profile shapes decision-making")
        prompt_parts.append("   - Identify biggest_constraint and its cascading effects")
        prompt_parts.append("   - Include hidden constraints implied by combinations of these variables")
        prompt_parts.append("")
        prompt_parts.append("3. STRENGTHS_AND_CAPABILITIES:")
        prompt_parts.append("   - REQUIRED variables: technical_strength, business_strength, industry_background, estimated_skill_seniority")
        prompt_parts.append("   - CROSS-REFERENCE: Reference constraints from Section 2 (e.g., 'While Section 2 identifies constraints, your [estimated_skill_seniority] level in [technical_strength] enables...')")
        prompt_parts.append("   - List specific technical capabilities from skills (e.g., 'Your [estimated_skill_seniority] technical strength in [technical_strength] enables...')")
        prompt_parts.append("   - List specific business capabilities from skills (e.g., 'Your business strength in [business_strength] positions you to...')")
        prompt_parts.append("   - Connect industry_background to relevant experience with industry_fit_score context")
        prompt_parts.append("   - Ground everything in actual skills/interests, not assumptions")
        prompt_parts.append("")
        prompt_parts.append("4. STRATEGIC_CONSIDERATIONS:")
        prompt_parts.append("   - REQUIRED variables: market_readiness, industry_fit_score, risk_tolerance, experience_level")
        prompt_parts.append("   - CROSS-REFERENCE: Reference gaps in Section 3 (e.g., 'Given the strengths identified in Section 3, your [industry_fit_score]/10 industry fit suggests...')")
        prompt_parts.append("   - Assess market_readiness based on experience_level and resources")
        prompt_parts.append("   - Use industry_fit_score to inform strategic positioning (e.g., 'With [industry_fit_score]/10 industry fit, your strategic moves should...')")
        prompt_parts.append("   - Factor in risk_tolerance and experience_level for strategic decisions")
        prompt_parts.append("   - Use cause-and-effect reasoning, not generic advice")
        prompt_parts.append("   - Connect strategic implications directly to user's specific situation")
        prompt_parts.append("")
        prompt_parts.append("5. VIABILITY_RED_FLAGS:")
        prompt_parts.append("   - REQUIRED variables: technical_strength, business_strength, time_commitment, budget, entrepreneurial_risk_profile")
        prompt_parts.append("   - Include ONLY red flags that directly apply based on these variables")
        prompt_parts.append("   - If technical_strength is weak/Limited: flag technical requirements")
        prompt_parts.append("   - If business_strength is weak/Limited: flag business/marketing needs")
        prompt_parts.append("   - If time_commitment is limited: flag time-intensive ideas")
        prompt_parts.append("   - If budget is low: flag capital-intensive ideas")
        prompt_parts.append("   - If entrepreneurial_risk_profile is conservative: flag high-risk approaches")
        prompt_parts.append("   - Check industry_fit_score: if <5, flag industry mismatch")
        prompt_parts.append("   - Skip red flags that don't apply - if none apply, state 'No significant red flags identified for your profile.'")
        prompt_parts.append("")
        prompt_parts.append("6. PATHWAY_RECOMMENDATION:")
        prompt_parts.append("   - REQUIRED variables: timeline_urgency_score, time_commitment, budget, idea_type")
        prompt_parts.append("   - CROSS-REFERENCE: Reference red flags from Section 5 (e.g., 'To address the red flags in Section 5, your pathway must...')")
        prompt_parts.append("   - Create a customized execution plan that respects timeline_urgency_score (e.g., 'Given your [timeline_urgency_score]/10 urgency and [goal_timeline] timeline, your pathway should...')")
        prompt_parts.append("   - Design phases that fit within time_commitment constraints")
        prompt_parts.append("   - Suggest budget-appropriate steps aligned with idea_type")
        prompt_parts.append("   - Provide specific, actionable steps tailored to these constraints")
        prompt_parts.append("   - Connect back to motivations from Section 1 when framing the pathway")
        prompt_parts.append("")
        prompt_parts.append("ABSOLUTE REQUIREMENTS:")
        prompt_parts.append("- No generic sentences. Every line must explicitly connect to a user variable from the User Variables dictionary.")
        prompt_parts.append("- Cross-reference other sections when it adds value and clarity.")
        prompt_parts.append("- Dense personalization: pack multiple variable references into single sentences.")
        prompt_parts.append("- If a variable isn't relevant, skip it (don't use generic fallbacks).")
        prompt_parts.append("- Output must feel uniquely written for this user's profile - like a premium advisor consultation.")
        prompt_parts.append("- Identify contradictions in the user's inputs and mention them explicitly.")
        prompt_parts.append("- Evaluate the REAL practicality of the user's constraints.")
        prompt_parts.append("- Infer risks or bottlenecks even if the user did not state them directly.")
        prompt_parts.append("")
        prompt_parts.append("Your response MUST be in this exact format:")
        prompt_parts.append("---PROFILE_ANALYSIS_START---")
        prompt_parts.append("{")
        prompt_parts.append('  "core_motivations": "...",')
        prompt_parts.append('  "operating_constraints": "...",')
        prompt_parts.append('  "strengths_and_capabilities": "...",')
        prompt_parts.append('  "strategic_considerations": "...",')
        prompt_parts.append('  "viability_red_flags": "...",')
        prompt_parts.append('  "pathway_recommendation": "..."')
        prompt_parts.append("}")
        prompt_parts.append("---PROFILE_ANALYSIS_END---")
        
        return "\n".join(prompt_parts)

