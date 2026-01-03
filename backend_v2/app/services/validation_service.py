"""Validation service for idea validation"""
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from datetime import datetime, timezone
from app.services.base_service import BaseService
from app.services.llm_service import LLMService
from app.models.validation import Validation
from app.core.config import settings
import time

# Import modular components
from app.services.validation import (
    ValidationAnalysis,
    ValidationPromptBuilder,
    ValidationFallbacks,
    UserProfileRetriever
)


class ValidationService(BaseService):
    """Service for idea validation operations"""
    
    def __init__(self, db: Session, redis_client=None):
        super().__init__(db, redis_client)
        self.llm_service = LLMService(db, redis_client)
        # Initialize modular components
        self.analysis = ValidationAnalysis(self.llm_service, log_callback=self._log)
        self.prompt_builder = ValidationPromptBuilder()
        self.fallbacks = ValidationFallbacks()
        self.user_profile_retriever = UserProfileRetriever(db)
    
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
            validation_result = self.analysis.generate_validation_analysis(
                category_answers, 
                idea_explanation
            )
            
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
                    user_profile, user_constraints = self.user_profile_retriever.get_user_profile_and_constraints(user_id)
                
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
                    next_steps = self.fallbacks.get_fallback_next_steps(validation_result)
                
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
                "validation": validation_result,
                "created_at": validation.created_at.isoformat() if validation.created_at else None,
                "updated_at": validation.updated_at.isoformat() if validation.updated_at else None
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
            prompt = self.prompt_builder.build_next_steps_prompt(
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
            return self.fallbacks.get_fallback_next_steps(validation_results)
    
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
