"""Validation analysis generation using parallel LLM calls"""
from typing import Dict, Any
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from app.services.llm_service import LLMService
from app.core.config import settings
from .constants import VALIDATION_PARAMETER_GROUPS
from .prompts import ValidationPromptBuilder
from .fallbacks import ValidationFallbacks


class ValidationAnalysis:
    """Handles parallel validation analysis generation"""
    
    def __init__(self, llm_service: LLMService, log_callback=None):
        """
        Initialize validation analysis handler
        
        Args:
            llm_service: LLMService instance for making LLM calls
            log_callback: Optional callback function for logging (message, level)
        """
        self.llm_service = llm_service
        self._log = log_callback or (lambda msg, level="INFO": print(f"[{level}] ValidationAnalysis: {msg}"))
        self.prompt_builder = ValidationPromptBuilder()
        self.fallbacks = ValidationFallbacks()
    
    def generate_validation_analysis(
        self,
        category_answers: Dict[str, Any],
        idea_explanation: str
    ) -> Dict[str, Any]:
        """
        Generate validation scores and analysis using parallel LLM calls.
        
        This method is isolated from discovery pipeline - uses validation-specific
        timeouts, error handling, and configuration.
        """
        self._log("Starting parallel LLM validation analysis", "INFO")
        
        # Verify LLM service is configured
        if not self.llm_service:
            self._log("LLM service not initialized!", "ERROR")
            raise ValueError("LLM service not initialized")
        
        # Check if API keys are configured
        if not settings.OPENAI_API_KEY and not settings.ANTHROPIC_API_KEY:
            self._log("No LLM API keys configured (OPENAI_API_KEY or ANTHROPIC_API_KEY)", "ERROR")
            raise ValueError("No LLM API keys configured")
        
        self._log(f"Using LLM provider: {settings.DEFAULT_LLM_PROVIDER}, model: {settings.DEFAULT_MODEL}", "INFO")
        
        try:
            # Execute all groups in parallel
            with ThreadPoolExecutor(max_workers=settings.VALIDATION_MAX_WORKERS) as executor:
                # Submit all group analysis tasks
                futures = {
                    executor.submit(
                        self._analyze_parameter_group,
                        group,
                        category_answers,
                        idea_explanation
                    ): group["group_id"]
                    for group in VALIDATION_PARAMETER_GROUPS
                }
                
                # Collect results with isolated error handling
                group_results = {}
                for future in futures:
                    group_id = futures[future]
                    try:
                        # Use validation-specific timeout (isolated from STAGE1_TIMEOUT)
                        result = future.result(timeout=settings.VALIDATION_GROUP_TIMEOUT)
                        group_results[group_id] = result
                    except FutureTimeoutError:
                        self._log(f"Validation group {group_id} timed out after {settings.VALIDATION_GROUP_TIMEOUT}s", "WARNING")
                        group_results[group_id] = self.fallbacks.get_fallback_group_analysis(group_id)
                    except Exception as e:
                        # Isolated error handling - doesn't affect other groups or services
                        self._log(f"Validation group {group_id} failed: {str(e)}", "ERROR")
                        group_results[group_id] = self.fallbacks.get_fallback_group_analysis(group_id)
            
            # Combine all group results
            scores = {}
            details = {}
            for group_id, result in group_results.items():
                if result and isinstance(result, dict):
                    scores.update(result.get("scores", {}))
                    details.update(result.get("details", {}))
            
            self._log(f"Validation analysis complete: {len(scores)} scores, {len(details)} details", "INFO")
            
            # Ensure all parameters have scores and details (fallback if missing)
            all_params = []
            for group in VALIDATION_PARAMETER_GROUPS:
                all_params.extend([param_key for param_key, _ in group["parameters"]])
            
            for param_key in all_params:
                if param_key not in scores:
                    scores[param_key] = 6.0
                if param_key not in details:
                    details[param_key] = f"Analysis for {param_key.replace('_', ' ').title()} is being generated."
            
            # Clamp all scores to minimum of 1
            for key in scores:
                scores[key] = max(float(scores[key]), 1.0)
            
            # Calculate overall score
            overall_score = sum(scores.values()) / len(scores) if scores else 0
            
            # Generate summary recommendations
            recommendations = self.fallbacks.generate_summary_recommendations(scores, details)
            
            return {
                "scores": scores,
                "details": details,  # Now populated with actual analysis!
                "overall_score": round(overall_score, 1),
                "recommendations": recommendations
            }
        except Exception as e:
            # If parallel execution fails completely, log and return fallback
            self._log(f"Parallel validation analysis failed: {str(e)}", "ERROR")
            import traceback
            self._log(f"Traceback: {traceback.format_exc()}", "ERROR")
            # Return fallback with all parameters
            all_params = []
            for group in VALIDATION_PARAMETER_GROUPS:
                all_params.extend([param_key for param_key, _ in group["parameters"]])
            
            fallback_scores = {param: 6.0 for param in all_params}
            fallback_details = {
                param: f"Analysis for {param.replace('_', ' ').title()} could not be generated. Please try again."
                for param in all_params
            }
            
            return {
                "scores": fallback_scores,
                "details": fallback_details,
                "overall_score": 6.0,
                "recommendations": "Validation analysis encountered an error. Please try again."
            }
    
    def _analyze_parameter_group(
        self,
        group: Dict[str, Any],
        category_answers: Dict[str, Any],
        idea_explanation: str
    ) -> Dict[str, Any]:
        """
        Analyze one parameter group using LLM with structured output.
        
        This method is isolated - errors here don't affect other groups or services.
        
        Returns:
            {"scores": {...}, "details": {...}} for this group's parameters
        """
        try:
            # Build focused prompt for this group
            prompt = self.prompt_builder.build_group_analysis_prompt(group, category_answers, idea_explanation)
            
            # Define JSON schema for structured output
            schema = {
                "type": "object",
                "properties": {
                    "scores": {
                        "type": "object",
                        "properties": {
                            param_key: {"type": "number", "minimum": 1, "maximum": 10}
                            for param_key, param_name in group["parameters"]
                        },
                        "required": [param_key for param_key, _ in group["parameters"]]
                    },
                    "details": {
                        "type": "object",
                        "properties": {
                            param_key: {
                                "type": "string",
                                "description": f"2-3 sentence analysis of {param_name}"
                            }
                            for param_key, param_name in group["parameters"]
                        },
                        "required": [param_key for param_key, _ in group["parameters"]]
                    }
                },
                "required": ["scores", "details"]
            }
            
            # Call LLM with structured output (reuses shared utility)
            self._log(f"Calling LLM for validation group {group['group_id']} with {len(group['parameters'])} parameters", "INFO")
            try:
                response = self.llm_service.generate_structured(
                    prompt=prompt,
                    schema=schema,
                    temperature=settings.VALIDATION_TEMPERATURE,
                    max_tokens=settings.VALIDATION_MAX_TOKENS_PER_GROUP,
                    run_id=None  # Validation doesn't use run_id tracking
                )
                self._log(f"LLM call successful for group {group['group_id']}", "INFO")
            except Exception as llm_error:
                import traceback
                self._log(f"LLM call failed for group {group['group_id']}: {type(llm_error).__name__}: {str(llm_error)}", "ERROR")
                self._log(f"LLM error traceback:\n{traceback.format_exc()}", "ERROR")
                raise
            
            # Validate response structure
            if not isinstance(response, dict):
                raise ValueError("LLM response is not a dictionary")
            
            if "scores" not in response or "details" not in response:
                raise ValueError("LLM response missing required 'scores' or 'details' fields")
            
            # Ensure minimum score of 1 for all parameters
            if "scores" in response:
                for key in response["scores"]:
                    response["scores"][key] = max(float(response["scores"][key]), 1.0)
            
            # Validate details are strings
            if "details" in response:
                for key in response["details"]:
                    if not isinstance(response["details"][key], str):
                        response["details"][key] = str(response["details"][key])
            
            return response
            
        except Exception as e:
            # Isolated error handling - log detailed error info
            import traceback
            error_type = type(e).__name__
            error_msg = str(e)
            error_traceback = traceback.format_exc()
            self._log(f"Failed to analyze validation group {group['group_id']}: {error_type}: {error_msg}", "ERROR")
            self._log(f"Traceback for group {group['group_id']}:\n{error_traceback}", "ERROR")
            # Re-raise so caller can use fallback
            raise

