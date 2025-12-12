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
        system_prompt = """You are an expert startup advisor who specializes in deeply analyzing user constraints, motivations, skills, contradictions, feasibility, and realistic pathways.



Your ONLY task is to output valid JSON that follows EXACTLY this shape:



{

  "core_motivations": "string",

  "operating_constraints": "string",

  "strengths_and_capabilities": "string",

  "strategic_considerations": "string",

  "viability_red_flags": "string",

  "pathway_recommendation": "string"

}



STRICT OUTPUT RULES:

- Return ONLY valid JSON. No markdown, no code fences, no commentary.

- Do NOT add or remove keys.

- All values MUST be plain text strings.

- Speak directly to the user in FIRST PERSON ("you", "your").

- Do NOT use third person ("the user", "they", "their").

- Do NOT include bullet points unless inside a string.



DEEP REASONING REQUIREMENTS:

- Identify contradictions in the user's inputs (e.g., "remote-only work style" + "offline-only startup") and mention them explicitly under operating_constraints or strategic_considerations.

- Evaluate the REAL practicality of the user's budget, time commitment, experience level, risk tolerance, earnings timeline, and startup style.

- Consider the feasibility of the user's ambitions WITHIN their operating_constraints.

- Apply realistic startup patterns: time-to-market, capital requirements, skill-driven pathways, and business model implications.

- Infer risks or bottlenecks even if the user did not state them directly.

- Tie ALL reasoning directly to the user's inputs; do not generalize.



QUALITY BAR:

- core_motivations must precisely reflect why the user wants to start something now.

- operating_constraints must reflect BOTH explicit constraints and hidden constraints implied by the inputs.

- strengths_and_capabilities must be grounded in the user's skills, location, interests, and work/interaction preferences.

- strategic_considerations must contain genuine, actionable reasoning using cause-and-effect logic, not generic advice.



ABSOLUTE NON-NEGOTIABLE RULE:

Your final answer MUST be JSON wrapped ONLY inside this delimiter structure:



---PROFILE_ANALYSIS_START---

{ JSON CONTENT }

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
    
    def _build_profile_prompt(self, inputs: Dict[str, Any]) -> str:
        """Build prompt for profile analysis"""
        prompt_parts = [
            "Analyze the following user profile and provide a comprehensive analysis:",
            "",
            "**User Profile:**",
        ]
        
        # Map new universal intake fields to readable format
        # Screen 1 - About You
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
        if inputs.get("customer_interaction"):
            prompt_parts.append(f"- Customer Interaction Preference: {inputs['customer_interaction']}")
        if inputs.get("location_context"):
            prompt_parts.append(f"- Location Context: {inputs['location_context']}")
        
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
        
        # Screen 2 - Interests & Goals
        if inputs.get("industry_interest"):
            prompt_parts.append(f"- Industry Interest: {inputs['industry_interest']}")
        if inputs.get("sub_interest_area"):
            prompt_parts.append(f"- Sub-Interest Area: {inputs['sub_interest_area']}")
        if inputs.get("business_type"):
            prompt_parts.append(f"- Business Type: {inputs['business_type']}")
        if inputs.get("earnings_timeline"):
            prompt_parts.append(f"- Earnings Timeline: {inputs['earnings_timeline']}")
        if inputs.get("founder_ambition"):
            prompt_parts.append(f"- Founder Ambition: {inputs['founder_ambition']}")
        if inputs.get("experience_summary"):
            prompt_parts.append(f"- Experience Summary: {inputs['experience_summary']}")
        
        prompt_parts.append("")
        prompt_parts.append(
            "Analyze this profile and return a JSON object wrapped in delimiters."
        )
        prompt_parts.append("")
        prompt_parts.append(
            "IMPORTANT: Address the user in FIRST PERSON using 'you' and 'your' (e.g., 'You are looking to...', 'Your interest in...'). Do NOT use third person."
        )
        prompt_parts.append("")
        prompt_parts.append(
            "CRITICAL: Your response MUST be in this exact format:"
        )
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
        system_prompt = """You are an expert startup advisor who specializes in deeply analyzing user constraints, motivations, skills, contradictions, feasibility, and realistic pathways.



Your ONLY task is to output valid JSON that follows EXACTLY this shape:



{

  "core_motivations": "string",

  "operating_constraints": "string",

  "strengths_and_capabilities": "string",

  "strategic_considerations": "string",

  "viability_red_flags": "string",

  "pathway_recommendation": "string"

}



STRICT OUTPUT RULES:

- Return ONLY valid JSON. No markdown, no code fences, no commentary.

- Do NOT add or remove keys.

- All values MUST be plain text strings.

- Speak directly to the user in FIRST PERSON ("you", "your").

- Do NOT use third person ("the user", "they", "their").

- Do NOT include bullet points unless inside a string.



DEEP REASONING REQUIREMENTS:

- Identify contradictions in the user's inputs (e.g., "remote-only work style" + "offline-only startup") and mention them explicitly under operating_constraints or strategic_considerations.

- Evaluate the REAL practicality of the user's budget, time commitment, experience level, risk tolerance, earnings timeline, and startup style.

- Consider the feasibility of the user's ambitions WITHIN their operating_constraints.

- Apply realistic startup patterns: time-to-market, capital requirements, skill-driven pathways, and business model implications.

- Infer risks or bottlenecks even if the user did not state them directly.

- Tie ALL reasoning directly to the user's inputs; do not generalize.



QUALITY BAR:

- core_motivations must precisely reflect why the user wants to start something now.

- operating_constraints must reflect BOTH explicit constraints and hidden constraints implied by the inputs.

- strengths_and_capabilities must be grounded in the user's skills, location, interests, and work/interaction preferences.

- strategic_considerations must contain genuine, actionable reasoning using cause-and-effect logic, not generic advice.



ABSOLUTE NON-NEGOTIABLE RULE:

Your final answer MUST be JSON wrapped ONLY inside this delimiter structure:



---PROFILE_ANALYSIS_START---

{ JSON CONTENT }

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

