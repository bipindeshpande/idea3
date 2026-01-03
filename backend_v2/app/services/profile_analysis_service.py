"""Profile Analysis Service (Stage 1)"""
from typing import Dict, Any, Optional
import hashlib
import json
from app.services.base_service import BaseService
from app.services.llm_service import LLMService
from app.services.cache_service import CacheService
from app.core.config import settings
from app.services.profile_analysis.profile_analysis_utils import (
    clean_profile_analysis,
    parse_profile_response,
    wrap_profile_analysis
)
from app.services.profile_analysis.profile_variable_extractor import ProfileVariableExtractor
from app.services.profile_analysis.profile_prompt_builder import ProfilePromptBuilder

# Export clean_profile_analysis for backward compatibility
__all__ = ["ProfileAnalysisService", "clean_profile_analysis"]


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
            run_id: Optional run ID for tracking
        
        Returns:
            Dict with 'profile_analysis' (delimited JSON string), 'usage', and 'json_obj'
        """
        # Check cache
        cache_key = self._generate_cache_key(inputs)
        cached = self.cache_service.get(cache_key, cache_type="profile")
        if cached:
            self._log("Profile analysis cache hit")
            return cached
        
        # Extract user variables
        variables = ProfileVariableExtractor.extract_user_variables(inputs)
        
        # Build prompts
        system_prompt = ProfilePromptBuilder.build_system_prompt(variables)
        user_prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        # Print prompts before sending to LLM
        print("\n" + "="*80)
        print("PROFILE ANALYSIS PROMPT (Before LLM Call)")
        print("="*80)
        print("\n[SYSTEM PROMPT]:")
        print(system_prompt)
        print("\n" + "-"*80)
        print("\n[USER PROMPT]:")
        print(user_prompt)
        print("\n" + "="*80 + "\n")
        
        try:
            response = self.llm_service.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=settings.MAX_TOKENS_STAGE1,
                run_id=run_id
            )

            # Parse and validate response
            json_obj = parse_profile_response(response["content"])
            
            # Wrap in delimiters
            profile_analysis = wrap_profile_analysis(json_obj)

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
            run_id: Optional run ID for tracking
        
        Returns:
            Dict with 'profile_analysis' (delimited JSON string), 'usage', and 'json_obj'
        """
        # Check cache (synchronous operation, but fast)
        cache_key = self._generate_cache_key(inputs)
        cached = self.cache_service.get(cache_key, cache_type="profile")
        if cached:
            self._log("Profile analysis cache hit")
            return cached
        
        # Extract user variables
        variables = ProfileVariableExtractor.extract_user_variables(inputs)
        
        # Build prompts
        system_prompt = ProfilePromptBuilder.build_system_prompt(variables)
        user_prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        # Print prompts before sending to LLM
        print("\n" + "="*80)
        print("PROFILE ANALYSIS PROMPT (Before LLM Call - Async)")
        print("="*80)
        print("\n[SYSTEM PROMPT]:")
        print(system_prompt)
        print("\n" + "-"*80)
        print("\n[USER PROMPT]:")
        print(user_prompt)
        print("\n" + "="*80 + "\n")
        
        try:
            response = await self.llm_service.generate_async(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=settings.MAX_TOKENS_STAGE1,
                run_id=run_id
            )

            # Parse and validate response
            json_obj = parse_profile_response(response["content"])
            
            # Wrap in delimiters
            profile_analysis = wrap_profile_analysis(json_obj)

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

