"""Validation service for idea validation"""
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime, timezone
from app.services.base_service import BaseService
from app.services.llm_service import LLMService
from app.models.validation import Validation
from app.models.user import User
from app.models.run import Run
from app.core.config import settings
import json
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError


class ValidationService(BaseService):
    """Service for idea validation operations"""
    
    def __init__(self, db: Session, redis_client=None):
        super().__init__(db, redis_client)
        self.llm_service = LLMService(db, redis_client)
    
    # Validation parameter groups for parallel analysis
    VALIDATION_PARAMETER_GROUPS = [
        {
            "group_id": "market",
            "parameters": [
                ("market_opportunity", "Market Opportunity"),
                ("target_audience_clarity", "Target Audience Clarity"),
                ("go_to_market_strategy", "Go-to-Market Strategy")
            ],
            "context": "Market viability and audience analysis"
        },
        {
            "group_id": "product",
            "parameters": [
                ("problem_solution_fit", "Problem-Solution Fit"),
                ("competitive_landscape", "Competitive Landscape"),
                ("technical_feasibility", "Technical Feasibility"),
                ("scalability_potential", "Scalability Potential")
            ],
            "context": "Product-market fit and technical viability"
        },
        {
            "group_id": "execution",
            "parameters": [
                ("business_model_viability", "Business Model Viability"),
                ("financial_sustainability", "Financial Sustainability"),
                ("risk_assessment", "Risk Assessment")
            ],
            "context": "Execution feasibility and sustainability"
        }
    ]
    
    def validate_idea(
        self,
        user_id: Optional[str],
        category_answers: Dict[str, Any],
        idea_explanation: str,
        validation_id: Optional[str] = None,
        idea_id: Optional[str] = None,
        idea_metadata: Optional[Dict[str, Any]] = None,
        include_next_steps: bool = True
    ) -> Dict[str, Any]:
        """
        Validate an idea and generate personalized recommendations
        
        Args:
            user_id: User ID (optional, for authenticated users)
            category_answers: Validation form answers
            idea_explanation: User's idea description
            validation_id: Optional validation ID for updates
            include_next_steps: Whether to generate next_steps (default: True, can be False for faster response)
        
        Returns:
            Dict with validation_id and validation result
        """
        start_time = time.time()
        
        try:
            # Generate validation scores and analysis
            validation_result = self._generate_validation_analysis(category_answers, idea_explanation)
            
            # Check overall timeout
            elapsed = time.time() - start_time
            if elapsed > settings.VALIDATION_OVERALL_TIMEOUT:
                self._log(f"Validation exceeded overall timeout ({settings.VALIDATION_OVERALL_TIMEOUT}s) after analysis", "WARNING")
                # Return results without next_steps if timeout exceeded
                validation_result["next_steps"] = "Next steps generation timed out. Please try again or view recommendations in the Detailed Analysis tab."
            elif include_next_steps:
                # Get user profile if available
                user_profile = None
                user_constraints = None
                if user_id:
                    user_profile, user_constraints = self._get_user_profile_and_constraints(user_id)
                
                # Build idea details including metadata if provided
                idea_details = {
                    "explanation": idea_explanation,
                    "category_answers": category_answers
                }
                if idea_id:
                    idea_details["idea_id"] = idea_id
                if idea_metadata:
                    idea_details.update(idea_metadata)
                
                # Generate personalized next_steps with timeout protection
                try:
                    next_steps_start = time.time()
                    next_steps = self.generate_next_steps(
                        user_profile=user_profile,
                        idea_details=idea_details,
                        validation_results=validation_result,
                        user_constraints=user_constraints
                    )
                    next_steps_elapsed = time.time() - next_steps_start
                    if next_steps_elapsed > settings.VALIDATION_NEXT_STEPS_TIMEOUT:
                        self._log(f"Next steps generation took {next_steps_elapsed:.1f}s (timeout: {settings.VALIDATION_NEXT_STEPS_TIMEOUT}s)", "WARNING")
                except Exception as next_steps_error:
                    self._log(f"Next steps generation failed: {str(next_steps_error)}", "ERROR")
                    # Use fallback next_steps instead of failing entire validation
                    next_steps = self._get_fallback_next_steps(validation_result)
                
                # Add next_steps to validation_result
                validation_result["next_steps"] = next_steps
            else:
                # Skip next_steps generation for faster response
                validation_result["next_steps"] = None
            
            # Save or update validation
            if validation_id:
                validation = self.db.query(Validation).filter(
                    Validation.validation_id == validation_id
                ).first()
                
                if validation:
                    validation.category_answers = category_answers
                    validation.idea_explanation = idea_explanation
                    validation.validation_result = validation_result
                    validation.updated_at = datetime.now(timezone.utc)
                    validation.status = "completed"
                    validation.error_message = None
                else:
                    raise ValueError(f"Validation {validation_id} not found")
            else:
                validation = Validation(
                    user_id=user_id,
                    category_answers=category_answers,
                    idea_explanation=idea_explanation,
                    validation_result=validation_result,
                    status="completed"
                )
                self.db.add(validation)
            
            self.db.commit()
            self.db.refresh(validation)
            
            return {
                "success": True,
                "validation_id": validation.validation_id,
                "validation": validation_result
            }
            
        except Exception as e:
            self._log(f"Validation failed: {str(e)}", "ERROR")
            self.db.rollback()
            
            # Create validation record with error status
            if validation_id:
                validation = self.db.query(Validation).filter(
                    Validation.validation_id == validation_id
                ).first()
                if validation:
                    validation.status = "failed"
                    validation.error_message = str(e)
                    self.db.commit()
            else:
                validation = Validation(
                    user_id=user_id,
                    category_answers=category_answers,
                    idea_explanation=idea_explanation,
                    validation_result={},
                    status="failed",
                    error_message=str(e)
                )
                self.db.add(validation)
                self.db.commit()
            
            raise
    
    def generate_next_steps(
        self,
        user_profile: Optional[Dict[str, Any]] = None,
        idea_details: Optional[Dict[str, Any]] = None,
        validation_results: Optional[Dict[str, Any]] = None,
        user_constraints: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate personalized next steps using LLM
        
        Args:
            user_profile: User profile from discovery/profile analysis
            idea_details: Idea explanation and category answers
            validation_results: Validation scores and analysis
            user_constraints: User constraints (budget, time, skills, etc.)
        
        Returns:
            Personalized next_steps string in markdown format
        """
        try:
            prompt = self._build_next_steps_prompt(
                user_profile=user_profile,
                idea_details=idea_details,
                validation_results=validation_results,
                user_constraints=user_constraints
            )
            
            system_prompt = """You are an expert startup advisor helping entrepreneurs move forward with their startup ideas.
Generate actionable, personalized next steps based on the user's profile, idea, validation results, and constraints.
Be specific, practical, and organized into clear timeframes."""

            response = self.llm_service.generate(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=2000,
                run_id=None
            )
            
            return response.get("content", "").strip()
            
        except Exception as e:
            self._log(f"Failed to generate next_steps: {str(e)}", "ERROR")
            # Return fallback generic next steps
            return self._get_fallback_next_steps(validation_results)
    
    def _build_next_steps_prompt(
        self,
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
    
    def _get_user_profile_and_constraints(
        self,
        user_id: str
    ) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """
        Get user profile and constraints from their latest discovery run
        
        Returns:
            Tuple of (user_profile, user_constraints)
        """
        try:
            # Get latest completed run for user
            latest_run = self.db.query(Run).filter(
                and_(
                    Run.user_id == user_id,
                    Run.status == "completed",
                    Run.deleted_at.is_(None)
                )
            ).order_by(desc(Run.created_at)).first()
            
            if not latest_run:
                return None, None
            
            user_profile = None
            user_constraints = None
            
            # Extract profile analysis from run
            if latest_run.profile_analysis:
                try:
                    # Try to parse as JSON first
                    if latest_run.profile_analysis.startswith("{"):
                        user_profile = json.loads(latest_run.profile_analysis)
                    else:
                        # Otherwise use as string
                        user_profile = latest_run.profile_analysis
                except:
                    user_profile = latest_run.profile_analysis
            
            # Extract constraints from inputs
            if latest_run.inputs:
                user_constraints = {
                    "budget_range": latest_run.inputs.get("budget_range"),
                    "time_commitment": latest_run.inputs.get("time_commitment"),
                    "risk_tolerance": latest_run.inputs.get("risk_tolerance"),
                    "skills": latest_run.inputs.get("skills"),
                    "preferred_work_style": latest_run.inputs.get("preferred_work_style"),
                    "startup_style": latest_run.inputs.get("startup_style"),
                }
            
            return user_profile, user_constraints
            
        except Exception as e:
            self._log(f"Failed to get user profile: {str(e)}", "WARNING")
            return None, None
    
    def _generate_validation_analysis(
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
        from app.core.config import settings
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
                    for group in self.VALIDATION_PARAMETER_GROUPS
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
                        group_results[group_id] = self._get_fallback_group_analysis(group_id)
                    except Exception as e:
                        # Isolated error handling - doesn't affect other groups or services
                        self._log(f"Validation group {group_id} failed: {str(e)}", "ERROR")
                        group_results[group_id] = self._get_fallback_group_analysis(group_id)
            
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
            for group in self.VALIDATION_PARAMETER_GROUPS:
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
            recommendations = self._generate_summary_recommendations(scores, details)
            
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
            for group in self.VALIDATION_PARAMETER_GROUPS:
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
            prompt = self._build_group_analysis_prompt(group, category_answers, idea_explanation)
            
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
    
    def _build_group_analysis_prompt(
        self,
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
    
    def _get_fallback_group_analysis(self, group_id: str) -> Dict[str, Any]:
        """
        Return fallback scores/details if LLM call fails for a group.
        
        This ensures validation always returns valid data even if some groups fail.
        Isolated from other services - doesn't affect discovery pipeline.
        """
        group = next((g for g in self.VALIDATION_PARAMETER_GROUPS if g["group_id"] == group_id), None)
        
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
    
    def _generate_summary_recommendations(
        self,
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
    
    def _get_fallback_next_steps(self, validation_results: Optional[Dict[str, Any]]) -> str:
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
    
    def get_validation(self, validation_id: str, user_id: Optional[str] = None) -> Optional[Validation]:
        """Get validation by ID"""
        query = self.db.query(Validation).filter(Validation.validation_id == validation_id)
        
        if user_id:
            query = query.filter(Validation.user_id == user_id)
        
        return query.filter(Validation.deleted_at.is_(None)).first()
    
    def get_user_validations(self, user_id: str, limit: int = 50) -> List[Validation]:
        """Get user's validations"""
        return self.db.query(Validation).filter(
            and_(
                Validation.user_id == user_id,
                Validation.deleted_at.is_(None)
            )
        ).order_by(desc(Validation.created_at)).limit(limit).all()

