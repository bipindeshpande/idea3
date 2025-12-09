"""Profile Analysis Service (Stage 1)"""
from typing import Dict, Any, Optional
import asyncio
import re
from app.services.base_service import BaseService
from app.services.llm_service import LLMService
from app.services.cache_service import CacheService
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
            required_keys = ["core_motivations", "constraints", "strengths", "strategic_considerations"]
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
                required_keys = ["core_motivations", "constraints", "strengths", "strategic_considerations"]
                for key in required_keys:
                    if key not in parsed:
                        parsed[key] = ""
                validated_json = json.dumps(parsed, indent=2)
                return f"{start_marker}\n{validated_json}\n{end_marker}"
            except:
                # If still fails, return empty JSON structure with delimiters
                empty_json = json.dumps({
                    "core_motivations": "",
                    "constraints": "",
                    "strengths": "",
                    "strategic_considerations": ""
                }, indent=2)
                return f"{start_marker}\n{empty_json}\n{end_marker}"
    else:
        # No delimiters found - try to find JSON in the text
        # Look for JSON object pattern
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(0))
                required_keys = ["core_motivations", "constraints", "strengths", "strategic_considerations"]
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
            "constraints": "",
            "strengths": "",
            "strategic_considerations": ""
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
        
        # Generate analysis - must return JSON in delimited block
        system_prompt = """You are an expert startup advisor. Analyze the user profile and return ONLY a JSON object wrapped in delimiters.

CRITICAL FORMAT REQUIREMENTS:
1. Output MUST start with: ---PROFILE_ANALYSIS_START---
2. Output MUST end with: ---PROFILE_ANALYSIS_END---
3. Between delimiters, provide ONLY valid JSON (no markdown, no headings, no comments)
4. JSON must contain exactly these keys:
   - core_motivations (string: 2-3 sentences)
   - constraints (string: 4-5 bullet points or short paragraphs)
   - strengths (string: 4-5 bullet points or short paragraphs)
   - strategic_considerations (string: 3-4 bullet points or short paragraphs)

CRITICAL TONE REQUIREMENT:
- Address the user in FIRST PERSON using "you" and "your" (e.g., "You are looking to...", "Your interest in...", "You have...")
- Do NOT use third person (avoid "the user", "they", "their")
- Write as if speaking directly to the user

Example format:
---PROFILE_ANALYSIS_START---
{
  "core_motivations": "You are looking to generate extra income while maintaining flexibility. Your interest in technology suggests you value efficiency.",
  "constraints": "- You have limited time (≤ 5 hours/week)\n- Your budget is lean, prioritizing cost-effective solutions",
  "strengths": "- Your technical skills enable rapid prototyping\n- You understand product development and user needs",
  "strategic_considerations": "- Focus on ideas you can validate quickly\n- Leverage your existing skills and knowledge"
}
---PROFILE_ANALYSIS_END---

Do NOT include markdown headings, bold text, or any text outside the delimiters."""
        
        try:
            response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=settings.MAX_TOKENS_STAGE1,
                run_id=run_id,
            )
            
            # Clean the LLM response to remove metadata and recommendation content
            raw_content = response["content"]
            profile_analysis = clean_profile_analysis(raw_content)
            
            result = {
                "profile_analysis": profile_analysis,
                "usage": response.get("usage", {}),
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
        prompt_parts.append("---PROFILE_ANALYSIS_START---")
        prompt_parts.append("{")
        prompt_parts.append('  "core_motivations": "...",')
        prompt_parts.append('  "constraints": "...",')
        prompt_parts.append('  "strengths": "...",')
        prompt_parts.append('  "strategic_considerations": "..."')
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
        
        Args:
            inputs: Dictionary of intake form responses
        
        Returns:
            Dict with 'profile_analysis' (markdown text)
        """
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
        
        # Generate analysis asynchronously - must return JSON in delimited block
        system_prompt = """You are an expert startup advisor. Analyze the user profile and return ONLY a JSON object wrapped in delimiters.

CRITICAL FORMAT REQUIREMENTS:
1. Output MUST start with: ---PROFILE_ANALYSIS_START---
2. Output MUST end with: ---PROFILE_ANALYSIS_END---
3. Between delimiters, provide ONLY valid JSON (no markdown, no headings, no comments)
4. JSON must contain exactly these keys:
   - core_motivations (string: 2-3 sentences)
   - constraints (string: 4-5 bullet points or short paragraphs)
   - strengths (string: 4-5 bullet points or short paragraphs)
   - strategic_considerations (string: 3-4 bullet points or short paragraphs)

CRITICAL TONE REQUIREMENT:
- Address the user in FIRST PERSON using "you" and "your" (e.g., "You are looking to...", "Your interest in...", "You have...")
- Do NOT use third person (avoid "the user", "they", "their")
- Write as if speaking directly to the user

Example format:
---PROFILE_ANALYSIS_START---
{
  "core_motivations": "You are looking to generate extra income while maintaining flexibility. Your interest in technology suggests you value efficiency.",
  "constraints": "- You have limited time (≤ 5 hours/week)\n- Your budget is lean, prioritizing cost-effective solutions",
  "strengths": "- Your technical skills enable rapid prototyping\n- You understand product development and user needs",
  "strategic_considerations": "- Focus on ideas you can validate quickly\n- Leverage your existing skills and knowledge"
}
---PROFILE_ANALYSIS_END---

Do NOT include markdown headings, bold text, or any text outside the delimiters."""
        
        try:
            response = await self.llm_service.generate_async(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=settings.MAX_TOKENS_STAGE1,
                run_id=run_id,
            )
            
            # Clean the LLM response to remove metadata and recommendation content
            raw_content = response["content"]
            profile_analysis = clean_profile_analysis(raw_content)
            
            result = {
                "profile_analysis": profile_analysis,
                "usage": response.get("usage", {}),
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

