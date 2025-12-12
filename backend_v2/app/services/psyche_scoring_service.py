"""Psyche Scoring Service - Deterministic scoring engine"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.services.base_service import BaseService
from app.services.psyche_scoring_map import SCORING_MAP, get_questions
from app.models.psyche_profile import PsycheProfile
from app.models.user import User

# Scoring algorithm version - increment when scoring logic changes
SCORING_VERSION = "1.0"


class PsycheScoringService(BaseService):
    """Service for deterministic psyche profiling"""
    
    # Baseline scores (all start at 0.5, except motivation which is normalized)
    BASELINE = {
        "personality": {
            "O": 0.5,  # Openness
            "C": 0.5,  # Conscientiousness
            "E": 0.5,  # Extraversion
            "A": 0.5,  # Agreeableness
            "N": 0.5   # Neuroticism
        },
        "decision_style": {
            "risk": 0.5,
            "speed_vs_certainty": 0.5,
            "maximize": 0.5
        },
        "motivation": {
            "autonomy": 0.33,
            "mastery": 0.33,
            "purpose": 0.33
        }
    }
    
    def __init__(self, db, redis_client=None):
        super().__init__(db, redis_client)
    
    def score_answers(self, answers: Dict[str, str], optional_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Score questionnaire answers deterministically.
        
        Args:
            answers: Dict of {question_id: answer_id} e.g. {"Q1": "A", "Q2": "B"}
            optional_text: Optional text field response
        
        Returns:
            Dict with personality, decision_style, motivation, and confidence scores
        """
        # Initialize scores from baseline
        scores = {
            "O": self.BASELINE["personality"]["O"],
            "C": self.BASELINE["personality"]["C"],
            "E": self.BASELINE["personality"]["E"],
            "A": self.BASELINE["personality"]["A"],
            "N": self.BASELINE["personality"]["N"],
            "risk": self.BASELINE["decision_style"]["risk"],
            "speed_vs_certainty": self.BASELINE["decision_style"]["speed_vs_certainty"],
            "maximize": self.BASELINE["decision_style"]["maximize"],
            "autonomy": self.BASELINE["motivation"]["autonomy"],
            "mastery": self.BASELINE["motivation"]["mastery"],
            "purpose": self.BASELINE["motivation"]["purpose"]
        }
        
        # Apply scoring map
        for question_id, answer_id in answers.items():
            impacts = SCORING_MAP.get(question_id, {}).get(answer_id, {})
            if not impacts:
                continue
            
            for axis, delta in impacts.items():
                if axis in scores:
                    scores[axis] += delta
        
        # Clamp all scores to [0, 1]
        for key in scores:
            scores[key] = max(0.0, min(1.0, scores[key]))
        
        # Normalize motivation scores (must sum to 1.0)
        motivation_sum = scores["autonomy"] + scores["mastery"] + scores["purpose"]
        if motivation_sum > 0:
            scores["autonomy"] = scores["autonomy"] / motivation_sum
            scores["mastery"] = scores["mastery"] / motivation_sum
            scores["purpose"] = scores["purpose"] / motivation_sum
        else:
            # Fallback to equal distribution if all are 0
            scores["autonomy"] = 0.33
            scores["mastery"] = 0.33
            scores["purpose"] = 0.33
        
        # Calculate confidence (answered questions / total questions)
        total_questions = len(get_questions())
        answered_questions = len([q for q in answers.keys() if answers[q]])
        confidence = answered_questions / total_questions if total_questions > 0 else 0.0
        
        # Optional: Detect contradictions (simple heuristic)
        # If user is both high risk and high neuroticism, reduce confidence slightly
        if scores["risk"] > 0.6 and scores["N"] > 0.6:
            confidence *= 0.95
        
        # Format result
        result = {
            "personality": {
                "O": round(scores["O"], 3),
                "C": round(scores["C"], 3),
                "E": round(scores["E"], 3),
                "A": round(scores["A"], 3),
                "N": round(scores["N"], 3)
            },
            "decision_style": {
                "risk": round(scores["risk"], 3),
                "speed_vs_certainty": round(scores["speed_vs_certainty"], 3),
                "maximize": round(scores["maximize"], 3)
            },
            "motivation": {
                "autonomy": round(scores["autonomy"], 3),
                "mastery": round(scores["mastery"], 3),
                "purpose": round(scores["purpose"], 3)
            },
            "confidence": round(confidence, 3)
        }
        
        return result
    
    def save_profile(self, user_id: str, answers: Dict[str, str], optional_text: Optional[str] = None) -> PsycheProfile:
        """
        Score answers and save profile to database.
        
        Args:
            user_id: User ID
            answers: Dict of {question_id: answer_id}
            optional_text: Optional text field response
        
        Returns:
            PsycheProfile instance
        """
        try:
            # Score the answers
            scored_profile = self.score_answers(answers, optional_text)
            
            # Check if profile exists
            existing = self.db.query(PsycheProfile).filter(PsycheProfile.user_id == user_id).first()
            
            # Set versioning metadata
            computed_at = datetime.now(timezone.utc)
            
            if existing:
                # Update existing profile
                existing.personality = scored_profile["personality"]
                existing.decision_style = scored_profile["decision_style"]
                existing.motivation = scored_profile["motivation"]
                existing.confidence = str(scored_profile["confidence"])
                existing.raw_answers = answers
                existing.optional_text = optional_text
                existing.version = SCORING_VERSION  # Also update version field
                existing.psyche_version = SCORING_VERSION
                existing.computed_at = computed_at
                self.db.commit()
                self.db.refresh(existing)
                return existing
            else:
                # Create new profile
                profile = PsycheProfile(
                    user_id=user_id,
                    personality=scored_profile["personality"],
                    decision_style=scored_profile["decision_style"],
                    motivation=scored_profile["motivation"],
                    confidence=str(scored_profile["confidence"]),
                    raw_answers=answers,
                    optional_text=optional_text,
                    version=SCORING_VERSION,  # Set version field
                    psyche_version=SCORING_VERSION,
                    computed_at=computed_at
                )
                self.db.add(profile)
                self.db.commit()
                self.db.refresh(profile)
                return profile
        except Exception as e:
            # Log error and re-raise
            self._log(f"Failed to save psyche profile for user {user_id}: {str(e)}", "ERROR")
            import traceback
            self._log(f"Traceback: {traceback.format_exc()}", "ERROR")
            raise
    
    def get_profile(self, user_id: str) -> Optional[PsycheProfile]:
        """Get user's psyche profile"""
        return self.db.query(PsycheProfile).filter(PsycheProfile.user_id == user_id).first()
    
    def get_profile_for_ai(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's psyche profile formatted for AI consumption"""
        profile = self.get_profile(user_id)
        if profile:
            return profile.to_ai_format()
        return None

