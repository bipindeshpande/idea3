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


class ValidationService(BaseService):
    """Service for idea validation operations"""
    
    def __init__(self, db: Session, redis_client=None):
        super().__init__(db, redis_client)
        self.llm_service = LLMService(db, redis_client)
    
    def validate_idea(
        self,
        user_id: Optional[str],
        category_answers: Dict[str, Any],
        idea_explanation: str,
        validation_id: Optional[str] = None,
        idea_id: Optional[str] = None,
        idea_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validate an idea and generate personalized recommendations
        
        Args:
            user_id: User ID (optional, for authenticated users)
            category_answers: Validation form answers
            idea_explanation: User's idea description
            validation_id: Optional validation ID for updates
        
        Returns:
            Dict with validation_id and validation result
        """
        try:
            # Generate validation scores and analysis
            validation_result = self._generate_validation_analysis(category_answers, idea_explanation)
            
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
            
            # Generate personalized next_steps
            next_steps = self.generate_next_steps(
                user_profile=user_profile,
                idea_details=idea_details,
                validation_results=validation_result,
                user_constraints=user_constraints
            )
            
            # Add next_steps to validation_result
            validation_result["next_steps"] = next_steps
            
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
        Generate validation scores and analysis
        
        This is a placeholder - in production this would use a proper validation engine
        """
        # TODO: Implement proper validation scoring logic
        # For now, return a basic structure
        
        # Mock scores - in production this would be calculated based on answers
        scores = {
            "market_opportunity": 7.5,
            "problem_solution_fit": 7.0,
            "competitive_landscape": 6.5,
            "target_audience_clarity": 7.0,
            "business_model_viability": 6.8,
            "technical_feasibility": 7.2,
            "financial_sustainability": 6.5,
            "scalability_potential": 7.0,
            "risk_assessment": 6.8,
            "go_to_market_strategy": 7.0,
        }
        
        overall_score = sum(scores.values()) / len(scores)
        
        return {
            "scores": scores,
            "overall_score": round(overall_score, 1),
            "recommendations": "Your idea shows strong potential. Focus on early customer validation and MVP development.",
            "details": {}
        }
    
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

