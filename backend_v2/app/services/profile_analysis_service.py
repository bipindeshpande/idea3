"""Profile Analysis Service (Stage 1)"""
from typing import Dict, Any, Optional
import asyncio
import re
from app.services.base_service import BaseService
from app.services.llm_service import LLMService
from app.services.cache_service import CacheService
from app.utils.text_cleaner import extract_profile_json
from app.core.config import settings
import hashlib
import json


def clean_profile_analysis(text: str) -> str:
    """
    Extract JSON from delimited block and clean profile analysis.
    
    Steps:
    1. Extract JSON from ---PROFILE_ANALYSIS_START--- ... ---PROFILE_ANALYSIS_END---
    2. Validate JSON structure
    3. Remove any content outside delimiters
    4. Return the JSON with delimiters preserved (for frontend parsing)
    """
    if not text:
        return text
    
    # Step 1: Extract JSON from delimited block
    start_marker = "---PROFILE_ANALYSIS_START---"
    end_marker = "---PROFILE_ANALYSIS_END---"
    
    start_idx = text.find(start_marker)
    end_idx = text.find(end_marker)
    
    if start_idx >= 0 and end_idx > start_idx:
        # Extract JSON block
        json_start = start_idx + len(start_marker)
        json_text = text[json_start:end_idx].strip()
        
        # Try to parse and validate JSON
        try:
            parsed = json.loads(json_text)
            # Ensure required keys exist
            required_keys = [
                "core_motivations",
                "operating_constraints",
                "strengths_and_capabilities",
                "strategic_considerations",
                "viability_red_flags",
                "pathway_recommendation"
            ]
            for key in required_keys:
                if key not in parsed:
                    parsed[key] = ""  # Add missing keys with empty string
            
            # Return validated JSON with delimiters preserved for frontend
            validated_json = json.dumps(parsed, indent=2)
            return f"{start_marker}\n{validated_json}\n{end_marker}"
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to clean and retry
            # Remove any markdown or extra text
            json_text = re.sub(r'^[^\{]*', '', json_text)  # Remove text before first {
            json_text = re.sub(r'[^\}]*$', '', json_text)  # Remove text after last }
            try:
                parsed = json.loads(json_text)
                required_keys = [
                    "core_motivations",
                    "operating_constraints",
                    "strengths_and_capabilities",
                    "strategic_considerations",
                    "viability_red_flags",
                    "pathway_recommendation"
                ]
                for key in required_keys:
                    if key not in parsed:
                        parsed[key] = ""
                validated_json = json.dumps(parsed, indent=2)
                return f"{start_marker}\n{validated_json}\n{end_marker}"
            except:
                # If still fails, return empty JSON structure with delimiters
                empty_json = json.dumps({
                    "core_motivations": "",
                    "operating_constraints": "",
                    "strengths_and_capabilities": "",
                    "strategic_considerations": "",
                    "viability_red_flags": "",
                    "pathway_recommendation": ""
                }, indent=2)
                return f"{start_marker}\n{empty_json}\n{end_marker}"
    else:
        # No delimiters found - try to find JSON in the text
        # Look for JSON object pattern
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(0))
                required_keys = [
                    "core_motivations",
                    "operating_constraints",
                    "strengths_and_capabilities",
                    "strategic_considerations",
                    "viability_red_flags",
                    "pathway_recommendation"
                ]
                for key in required_keys:
                    if key not in parsed:
                        parsed[key] = ""
                validated_json = json.dumps(parsed, indent=2)
                return f"{start_marker}\n{validated_json}\n{end_marker}"
            except:
                pass
        
        # Fallback: return empty JSON structure with delimiters
        empty_json = json.dumps({
            "core_motivations": "",
            "operating_constraints": "",
            "strengths_and_capabilities": "",
            "strategic_considerations": "",
            "viability_red_flags": "",
            "pathway_recommendation": ""
        }, indent=2)
        return f"{start_marker}\n{empty_json}\n{end_marker}"


class ProfileAnalysisService(BaseService):
    """Service for Stage 1: Profile Analysis"""
    
    def __init__(self, db, redis_client=None):
        super().__init__(db, redis_client)
        self.llm_service = LLMService(db, redis_client)
        self.cache_service = CacheService(db, redis_client)
    
    def analyze_profile(self, inputs: Dict[str, Any], run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze user profile from intake form inputs
        
        Args:
            inputs: Dictionary of intake form responses
        
        Returns:
            Dict with 'profile_analysis' (markdown text)
        """
        # Check cache
        cache_key = self._generate_cache_key(inputs)
        cached = self.cache_service.get(cache_key, cache_type="profile")
        if cached:
            self._log("Profile analysis cache hit")
            return cached
        
        # Build prompt
        prompt = self._build_profile_prompt(inputs)
        
        # Generate analysis - must return pure JSON
        # Extract variables for system prompt context
        vars = self._extract_user_variables(inputs)
        
        # Format variables as JSON string for prompt injection
        vars_json = json.dumps(vars, indent=2)
        
        system_prompt = f"""You are an expert startup advisor who specializes in deeply analyzing user constraints, motivations, skills, contradictions, feasibility, and realistic pathways.

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

1. CORE_MOTIVATIONS - MUST use: experience_level ({vars.get('experience_level', 'unknown')}), goal_timeline ({vars.get('goal_timeline', 'not specified')}), idea_type ({vars.get('idea_type', 'not specified')}), timeline_urgency_score ({vars.get('timeline_urgency_score', 5)})
   - Connect why the user wants to start NOW based on their experience level
   - Reference their specific goal timeline
   - Tie motivations to their preferred idea/business type
   - NO generic statements - every sentence must reference one of these variables

2. OPERATING_CONSTRAINTS - MUST use: time_commitment ({vars.get('time_commitment', 'not specified')}), budget ({vars.get('budget', 'not specified')}), risk_tolerance ({vars.get('risk_tolerance', 'not specified')}), biggest_constraint ({vars.get('biggest_constraint', 'moderate')})
   - Explicitly state how time_commitment limits options
   - Quantify budget constraints and their implications
   - Explain how risk_tolerance shapes decision-making
   - Identify biggest_constraint and its cascading effects
   - Include hidden constraints implied by combinations

3. STRENGTHS_AND_CAPABILITIES - MUST use: technical_strength ({vars.get('technical_strength', 'Limited')}), business_strength ({vars.get('business_strength', 'Limited')}), industry_background ({vars.get('industry_background', 'not specified')}), preferred_work_style ({vars.get('preferred_work_style', 'not specified')})
   - List specific technical capabilities from skills
   - List specific business capabilities from skills
   - Connect industry_background to relevant experience
   - Explain how preferred_work_style enables certain approaches
   - Ground everything in actual skills/interests, not assumptions

4. STRATEGIC_CONSIDERATIONS - MUST use: market_readiness ({vars.get('market_readiness', 'moderate')}), idea_type ({vars.get('idea_type', 'not specified')}), risk_tolerance ({vars.get('risk_tolerance', 'not specified')})
   - Assess market_readiness based on experience and resources
   - Consider how idea_type affects market entry strategy
   - Factor in risk_tolerance for strategic decisions
   - Use cause-and-effect reasoning, not generic advice
   - Connect strategic implications directly to user's specific situation

5. VIABILITY_RED_FLAGS - MUST use: technical_strength ({vars.get('technical_strength', 'Limited')}), business_strength ({vars.get('business_strength', 'Limited')}), time_commitment ({vars.get('time_commitment', 'not specified')}), budget ({vars.get('budget', 'not specified')}), risk_tolerance ({vars.get('risk_tolerance', 'not specified')})
   - Include ONLY red flags that directly apply to this user
   - If technical_strength is weak/Limited, flag technical requirements
   - If business_strength is weak/Limited, flag business/marketing needs
   - If time_commitment is limited, flag time-intensive ideas
   - If budget is low, flag capital-intensive ideas
   - If risk_tolerance is low, flag high-risk approaches
   - Skip red flags that don't apply - if none apply, state "No significant red flags identified for your profile."

6. PATHWAY_RECOMMENDATION - MUST use: goal_timeline ({vars.get('goal_timeline', 'not specified')}), time_commitment ({vars.get('time_commitment', 'not specified')}), budget ({vars.get('budget', 'not specified')}), idea_type ({vars.get('idea_type', 'not specified')})
   - Create a customized execution plan that respects goal_timeline
   - Design phases that fit within time_commitment
   - Suggest budget-appropriate steps
   - Align pathway with idea_type preferences
   - Provide specific, actionable steps tailored to these constraints

ABSOLUTE REQUIREMENTS:
- No generic sentences. Every line must explicitly connect to a user variable listed above.
- If a variable isn't relevant, skip it (don't use generic fallbacks).
- Output must feel uniquely written for this user's profile.
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
        
        # Print prompts before sending to LLM
        print("\n" + "="*80)
        print("PROFILE ANALYSIS PROMPT (Before LLM Call)")
        print("="*80)
        print("\n[SYSTEM PROMPT]:")
        print(system_prompt)
        print("\n" + "-"*80)
        print("\n[USER PROMPT]:")
        print(prompt)
        print("\n" + "="*80 + "\n")
        
        try:
            response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=settings.MAX_TOKENS_STAGE1,
                run_id=run_id
            )

            raw = response["content"]

            # CLEAN CODE FENCES
            raw = raw.replace("```json", "").replace("```", "").strip()

            # FIND JSON OBJECT
            first = raw.find("{")
            last = raw.rfind("}")

            if first == -1 or last == -1:
                raise Exception(f"ProfileAnalysis: No JSON found. Raw={raw[:200]}")

            json_text = raw[first:last+1]

            # PARSE JSON SAFELY
            try:
                json_obj = json.loads(json_text)
            except Exception as e:
                raise Exception(
                    f"ProfileAnalysis: Invalid JSON.\nError={e}\nJSON={json_text[:300]}"
                )

            # Ensure all required keys exist
            required_keys = [
                "core_motivations",
                "operating_constraints",
                "strengths_and_capabilities",
                "strategic_considerations",
                "viability_red_flags",
                "pathway_recommendation"
            ]
            for key in required_keys:
                if key not in json_obj:
                    json_obj[key] = ""  # Add missing keys with empty string

            # WRAP IN STRICT DELIMITERS
            wrapped_output = (
                "---PROFILE_ANALYSIS_START---\n"
                + json.dumps(json_obj, indent=2)
                + "\n---PROFILE_ANALYSIS_END---"
            )

            profile_analysis = wrapped_output

            result = {
                "profile_analysis": profile_analysis,
                "usage": response.get("usage", {}),
                "json_obj": json_obj,
            }
            
            # Cache result
            self.cache_service.set(
                cache_key,
                result,
                cache_type="profile",
                ttl_seconds=settings.CACHE_TTL_PROFILE
            )
            
            return result
            
        except Exception as e:
            self._log(f"Profile analysis failed: {e}", "ERROR")
            raise
    
    def _extract_user_variables(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and infer user variables for personalization"""
        variables = {}
        
        # Direct variables
        variables["time_commitment"] = inputs.get("time_commitment", "")
        variables["budget"] = inputs.get("budget_range", "")
        variables["risk_tolerance"] = inputs.get("risk_tolerance", "")
        variables["preferred_work_style"] = inputs.get("preferred_work_style", "")
        variables["industry_background"] = inputs.get("industry_interest", "")
        
        # Inferred variables
        # experience_level - infer from experience_summary
        experience_summary = inputs.get("experience_summary", "")
        if experience_summary:
            exp_lower = experience_summary.lower()
            if any(word in exp_lower for word in ["years", "decade", "senior", "expert", "experienced"]):
                variables["experience_level"] = "experienced"
            elif any(word in exp_lower for word in ["beginner", "new", "learning", "junior"]):
                variables["experience_level"] = "beginner"
            else:
                variables["experience_level"] = "intermediate"
        else:
            variables["experience_level"] = "unknown"
        
        # goal_timeline - from earnings_timeline or founder_ambition
        variables["goal_timeline"] = inputs.get("earnings_timeline", "") or inputs.get("founder_ambition", "")
        
        # idea_type - from business_type or startup_style
        variables["idea_type"] = inputs.get("business_type", "") or inputs.get("startup_style", "")
        
        # Extract technical and business strengths from skills
        skills = inputs.get("skills", {})
        technical_skills = []
        business_skills = []
        
        if isinstance(skills, dict):
            # Technical skills
            if isinstance(skills.get("product_creation"), list):
                technical_skills.extend([s for s in skills["product_creation"] if s in ["Coding", "AI & Automation"]])
            if isinstance(skills.get("digital"), list):
                technical_skills.extend([s for s in skills["digital"] if s in ["AI Tools", "Web Building", "Automation", "Data Analysis"]])
            
            # Business skills
            if isinstance(skills.get("sales_marketing"), list):
                business_skills.extend(skills["sales_marketing"])
            if isinstance(skills.get("operational"), list):
                business_skills.extend(skills["operational"])
        
        variables["technical_strength"] = ", ".join(technical_skills) if technical_skills else "Limited"
        variables["business_strength"] = ", ".join(business_skills) if business_skills else "Limited"
        
        # biggest_constraint - infer from most limiting factor
        constraints = []
        if variables["time_commitment"] and ("<5" in variables["time_commitment"] or "5–10" in variables["time_commitment"]):
            constraints.append(("time", "Limited time commitment"))
        if variables["budget"] and ("Free" in variables["budget"] or "$0" in variables["budget"] or "< $1 K" in variables["budget"]):
            constraints.append(("budget", "Limited budget"))
        if variables["risk_tolerance"] and variables["risk_tolerance"].lower() == "low":
            constraints.append(("risk", "Low risk tolerance"))
        
        if constraints:
            variables["biggest_constraint"] = constraints[0][1]  # Most limiting
        else:
            variables["biggest_constraint"] = "Moderate constraints"
        
        # market_readiness - infer from experience, time, budget
        readiness_factors = []
        if variables["experience_level"] in ["experienced", "intermediate"]:
            readiness_factors.append("experience")
        if variables["time_commitment"] and "Full-time" in variables["time_commitment"]:
            readiness_factors.append("time")
        if variables["budget"] and ("$20" in variables["budget"] or "$10" in variables["budget"]):
            readiness_factors.append("budget")
        
        if len(readiness_factors) >= 2:
            variables["market_readiness"] = "high"
        elif len(readiness_factors) == 1:
            variables["market_readiness"] = "moderate"
        else:
            variables["market_readiness"] = "low"
        
        # NEW: estimated_skill_seniority - infer from experience_summary
        if experience_summary:
            exp_lower = experience_summary.lower()
            # Check for years mentioned
            import re
            years_match = re.search(r'(\d+)\s*years?', exp_lower)
            years = 0
            if years_match:
                years = int(years_match.group(1))
            
            if years > 10 or any(word in exp_lower for word in ["senior", "expert", "lead", "principal", "architect", "director", "vp", "vice president"]):
                variables["estimated_skill_seniority"] = "senior"
            elif years > 5 or any(word in exp_lower for word in ["mid-level", "mid level", "experienced", "5+", "6+", "7+", "8+", "9+"]):
                variables["estimated_skill_seniority"] = "mid"
            elif any(word in exp_lower for word in ["junior", "entry", "beginner", "new", "learning", "intern"]):
                variables["estimated_skill_seniority"] = "junior"
            else:
                variables["estimated_skill_seniority"] = "mid"  # Default
        else:
            variables["estimated_skill_seniority"] = "mid"  # Default
        
        # NEW: industry_fit_score - 0-10 based on industry/background match with idea_type
        industry_background_lower = (variables.get("industry_background", "") or "").lower()
        idea_type_lower = (variables.get("idea_type", "") or "").lower()
        fit_score = 5  # Default neutral
        
        if industry_background_lower and idea_type_lower:
            # Check for keyword matches
            background_keywords = set(industry_background_lower.split())
            idea_keywords = set(idea_type_lower.split())
            
            # Common industry terms
            tech_terms = ["tech", "technology", "software", "saas", "app", "digital", "ai", "automation"]
            business_terms = ["business", "consulting", "service", "b2b", "b2c"]
            ecommerce_terms = ["ecommerce", "e-commerce", "retail", "online", "marketplace"]
            
            # Check matches
            if any(term in industry_background_lower for term in tech_terms) and any(term in idea_type_lower for term in tech_terms):
                fit_score = 8
            elif any(term in industry_background_lower for term in business_terms) and any(term in idea_type_lower for term in business_terms):
                fit_score = 8
            elif any(term in industry_background_lower for term in ecommerce_terms) and any(term in idea_type_lower for term in ecommerce_terms):
                fit_score = 8
            elif background_keywords.intersection(idea_keywords):
                fit_score = 7
            else:
                fit_score = 4  # Low match
        
        variables["industry_fit_score"] = fit_score
        
        # NEW: monetization_preference - infer from business_type and inputs
        monetization = "not-specified"
        business_type_lower = (variables.get("idea_type", "") or "").lower()
        if any(term in business_type_lower for term in ["saas", "software", "subscription", "recurring"]):
            monetization = "subscription"
        elif any(term in business_type_lower for term in ["service", "consulting", "agency", "freelance"]):
            monetization = "services"
        elif any(term in business_type_lower for term in ["product", "physical", "goods", "inventory"]):
            monetization = "one-time"
        elif any(term in business_type_lower for term in ["content", "media", "blog", "news", "advertising"]):
            monetization = "ads"
        
        variables["monetization_preference"] = monetization
        
        # NEW: timeline_urgency_score - 0-10 based on earnings_timeline + motivations
        urgency_score = 5  # Default
        goal_timeline_lower = (variables.get("goal_timeline", "") or "").lower()
        time_commitment_lower = (variables.get("time_commitment", "") or "").lower()
        budget_lower = (variables.get("budget", "") or "").lower()
        
        # High urgency indicators
        if any(term in goal_timeline_lower for term in ["immediately", "now", "asap", "urgent", "soon", "quick", "fast"]):
            urgency_score = 9
        elif any(term in goal_timeline_lower for term in ["3 months", "1 month", "2 months", "within 3"]):
            urgency_score = 8
        elif any(term in goal_timeline_lower for term in ["6 months", "half year"]):
            urgency_score = 7
        elif any(term in goal_timeline_lower for term in ["1 year", "12 months"]):
            urgency_score = 6
        
        # Adjust based on constraints (low budget + low time = higher urgency if they want fast results)
        if (budget_lower and any(term in budget_lower for term in ["free", "$0", "< $1", "under $1"])) and \
           (time_commitment_lower and any(term in time_commitment_lower for term in ["<5", "5-10", "part-time"])):
            # Limited resources but wants results = high urgency
            if urgency_score < 7:
                urgency_score = min(urgency_score + 2, 10)
        
        variables["timeline_urgency_score"] = urgency_score
        
        # NEW: entrepreneurial_risk_profile - conservative | moderate | aggressive
        risk_profile = "moderate"  # Default
        risk_tolerance_lower = (variables.get("risk_tolerance", "") or "").lower()
        
        if any(term in risk_tolerance_lower for term in ["low", "minimal", "conservative", "safe", "cautious"]):
            risk_profile = "conservative"
        elif any(term in risk_tolerance_lower for term in ["high", "aggressive", "bold", "risk-taking", "venturing"]):
            risk_profile = "aggressive"
        else:
            risk_profile = "moderate"
        
        variables["entrepreneurial_risk_profile"] = risk_profile
        
        return variables
    
    def _build_profile_prompt(self, inputs: Dict[str, Any]) -> str:
        """Build prompt for profile analysis with personalized section logic"""
        # Extract user variables
        vars = self._extract_user_variables(inputs)
        
        prompt_parts = [
            "Analyze the following user profile and provide a comprehensive, highly personalized analysis.",
            "",
            "**User Variables:**",
            json.dumps(vars, indent=2),
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
    
    def _generate_cache_key(self, inputs: Dict[str, Any]) -> str:
        """Generate cache key from inputs"""
        # Sort inputs for consistent hashing
        sorted_inputs = json.dumps(inputs, sort_keys=True)
        return hashlib.md5(sorted_inputs.encode()).hexdigest()
    
    def run(self, inputs: Dict[str, Any], run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Run profile analysis (alias for analyze_profile for parallel execution)
        
        This method is designed to be called in parallel with tool preprocessing.
        It uses the same logic as analyze_profile() to ensure consistency.
        
        Args:
            inputs: Dictionary of intake form responses
        
        Returns:
            Dict with 'profile_analysis' (delimited JSON string) and 'usage'
        """
        # Use the same method as analyze_profile() for consistency
        return self.analyze_profile(inputs, run_id=run_id)
    
    async def analyze_profile_async(self, inputs: Dict[str, Any], run_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Async version of analyze_profile
        
        Analyze user profile from intake form inputs asynchronously
        
        Args:
            inputs: Dictionary of intake form responses
        
        Returns:
            Dict with 'profile_analysis' (markdown text)
        """
        # Check cache (synchronous operation, but fast)
        cache_key = self._generate_cache_key(inputs)
        cached = self.cache_service.get(cache_key, cache_type="profile")
        if cached:
            self._log("Profile analysis cache hit")
            return cached
        
        # Build prompt
        prompt = self._build_profile_prompt(inputs)
        
        # Generate analysis asynchronously - must return pure JSON
        # Extract variables for system prompt context
        vars = self._extract_user_variables(inputs)
        
        # Format variables as JSON string for prompt injection
        vars_json = json.dumps(vars, indent=2)
        
        system_prompt = f"""You are an expert startup advisor who specializes in deeply analyzing user constraints, motivations, skills, contradictions, feasibility, and realistic pathways.

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

1. CORE_MOTIVATIONS - MUST use: experience_level ({vars.get('experience_level', 'unknown')}), goal_timeline ({vars.get('goal_timeline', 'not specified')}), idea_type ({vars.get('idea_type', 'not specified')}), timeline_urgency_score ({vars.get('timeline_urgency_score', 5)})
   - Connect why the user wants to start NOW based on experience_level and timeline_urgency_score
   - Reference their specific goal_timeline and tie to idea_type preferences
   - Cross-reference variables densely (e.g., "Your [experience_level] background combined with [timeline_urgency_score]/10 urgency for [idea_type] indicates...")
   - NO generic statements - every sentence must reference one of these variables

2. OPERATING_CONSTRAINTS - MUST use: time_commitment ({vars.get('time_commitment', 'not specified')}), budget ({vars.get('budget', 'not specified')}), risk_tolerance ({vars.get('risk_tolerance', 'not specified')}), entrepreneurial_risk_profile ({vars.get('entrepreneurial_risk_profile', 'moderate')}), biggest_constraint ({vars.get('biggest_constraint', 'moderate')})
   - CROSS-REFERENCE Section 1: Reference motivations when discussing constraints (e.g., "Despite ambitions in Section 1, your [time_commitment] constraint...")
   - Explicitly state how time_commitment limits options
   - Quantify budget constraints combined with entrepreneurial_risk_profile
   - Explain how entrepreneurial_risk_profile shapes decision-making
   - Identify biggest_constraint and its cascading effects
   - Include hidden constraints implied by combinations

3. STRENGTHS_AND_CAPABILITIES - MUST use: technical_strength ({vars.get('technical_strength', 'Limited')}), business_strength ({vars.get('business_strength', 'Limited')}), industry_background ({vars.get('industry_background', 'not specified')}), estimated_skill_seniority ({vars.get('estimated_skill_seniority', 'mid')})
   - CROSS-REFERENCE Section 2: Reference constraints when discussing strengths (e.g., "While Section 2 identifies constraints, your [estimated_skill_seniority] level in [technical_strength] enables...")
   - List specific technical capabilities with estimated_skill_seniority context
   - List specific business capabilities from skills
   - Connect industry_background to relevant experience with industry_fit_score ({vars.get('industry_fit_score', 5)}) context
   - Ground everything in actual skills/interests, not assumptions

4. STRATEGIC_CONSIDERATIONS - MUST use: market_readiness ({vars.get('market_readiness', 'moderate')}), industry_fit_score ({vars.get('industry_fit_score', 5)}), risk_tolerance ({vars.get('risk_tolerance', 'not specified')}), experience_level ({vars.get('experience_level', 'unknown')})
   - CROSS-REFERENCE Section 3: Reference gaps in strengths (e.g., "Given strengths in Section 3, your [industry_fit_score]/10 industry fit suggests...")
   - Assess market_readiness based on experience_level and resources
   - Use industry_fit_score to inform strategic positioning
   - Factor in risk_tolerance and experience_level for strategic decisions
   - Use cause-and-effect reasoning, not generic advice
   - Connect strategic implications directly to user's specific situation

5. VIABILITY_RED_FLAGS - MUST use: technical_strength ({vars.get('technical_strength', 'Limited')}), business_strength ({vars.get('business_strength', 'Limited')}), time_commitment ({vars.get('time_commitment', 'not specified')}), budget ({vars.get('budget', 'not specified')}), entrepreneurial_risk_profile ({vars.get('entrepreneurial_risk_profile', 'moderate')}), industry_fit_score ({vars.get('industry_fit_score', 5)})
   - Include ONLY red flags that directly apply to this user
   - If technical_strength is weak/Limited: flag technical requirements
   - If business_strength is weak/Limited: flag business/marketing needs
   - If time_commitment is limited: flag time-intensive ideas
   - If budget is low: flag capital-intensive ideas
   - If entrepreneurial_risk_profile is conservative: flag high-risk approaches
   - If industry_fit_score < 5: flag industry mismatch
   - Skip red flags that don't apply - if none apply, state "No significant red flags identified for your profile."

6. PATHWAY_RECOMMENDATION - MUST use: timeline_urgency_score ({vars.get('timeline_urgency_score', 5)}), time_commitment ({vars.get('time_commitment', 'not specified')}), budget ({vars.get('budget', 'not specified')}), idea_type ({vars.get('idea_type', 'not specified')})
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
        
        # Print prompts before sending to LLM
        print("\n" + "="*80)
        print("PROFILE ANALYSIS PROMPT (Before LLM Call - Async)")
        print("="*80)
        print("\n[SYSTEM PROMPT]:")
        print(system_prompt)
        print("\n" + "-"*80)
        print("\n[USER PROMPT]:")
        print(prompt)
        print("\n" + "="*80 + "\n")
        
        try:
            response = await self.llm_service.generate_async(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=settings.MAX_TOKENS_STAGE1,
                run_id=run_id
            )

            raw = response["content"]

            # CLEAN CODE FENCES
            raw = raw.replace("```json", "").replace("```", "").strip()

            # FIND JSON OBJECT
            first = raw.find("{")
            last = raw.rfind("}")

            if first == -1 or last == -1:
                raise Exception(f"ProfileAnalysis: No JSON found. Raw={raw[:200]}")

            json_text = raw[first:last+1]

            # PARSE JSON SAFELY
            try:
                json_obj = json.loads(json_text)
            except Exception as e:
                raise Exception(
                    f"ProfileAnalysis: Invalid JSON.\nError={e}\nJSON={json_text[:300]}"
                )

            # Ensure all required keys exist
            required_keys = [
                "core_motivations",
                "operating_constraints",
                "strengths_and_capabilities",
                "strategic_considerations",
                "viability_red_flags",
                "pathway_recommendation"
            ]
            for key in required_keys:
                if key not in json_obj:
                    json_obj[key] = ""  # Add missing keys with empty string

            # WRAP IN STRICT DELIMITERS
            wrapped_output = (
                "---PROFILE_ANALYSIS_START---\n"
                + json.dumps(json_obj, indent=2)
                + "\n---PROFILE_ANALYSIS_END---"
            )

            profile_analysis = wrapped_output

            result = {
                "profile_analysis": profile_analysis,
                "usage": response.get("usage", {}),
                "json_obj": json_obj,
            }
            
            # Cache result (synchronous, but fast)
            self.cache_service.set(
                cache_key,
                result,
                cache_type="profile",
                ttl_seconds=settings.CACHE_TTL_PROFILE
            )
            
            return result
            
        except Exception as e:
            self._log(f"Profile analysis failed: {e}", "ERROR")
            raise

