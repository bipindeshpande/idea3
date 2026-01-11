"""
Profile Formatter - Formats profile analysis for recommendations prompt.
"""
import json
from typing import Optional
from app.services.base_service import BaseService
from app.services.psyche_scoring_service import PsycheScoringService


class ProfileFormatter(BaseService):
    """Service for formatting profile analysis for recommendations."""
    
    def __init__(self, db, redis_client=None):
        super().__init__(db, redis_client)
        self.psyche_scoring_service = PsycheScoringService(db, redis_client)
    
    def format_profile_for_recommendations(self, profile_text: str, user_id: Optional[str] = None) -> str:
        """
        Extract and format profile analysis JSON for use in recommendations prompt.
        
        Converts JSON format to readable text format that the recommendations LLM can use.
        Also includes psyche profile if available.
        """
        if not profile_text:
            return profile_text
        
        # Extract JSON from delimited block using shared parser library
        from app.services.parsers.profile_parser import ProfileParser
        
        formatted = []
        profile_data = ProfileParser.extract_json(profile_text)
        
        if profile_data:
                    
                    # Format as readable text for recommendations prompt
                    formatted.append("## Profile Analysis Summary")
                    formatted.append("")
                    
                    if profile_data.get("core_motivations"):
                        formatted.append("### Core Motivations")
                        formatted.append(profile_data["core_motivations"])
                        formatted.append("")
                    
                    if profile_data.get("operating_constraints"):
                        formatted.append("### Operating Constraints")
                        formatted.append(profile_data["operating_constraints"])
                        formatted.append("")
                    
                    if profile_data.get("strengths_and_capabilities"):
                        formatted.append("### Strengths and Capabilities")
                        formatted.append(profile_data["strengths_and_capabilities"])
                        formatted.append("")
                    
                    if profile_data.get("strategic_considerations"):
                        formatted.append("### Strategic Considerations")
                        formatted.append(profile_data["strategic_considerations"])
                        formatted.append("")
                    
                    if profile_data.get("viability_red_flags"):
                        formatted.append("### Viability Red Flags")
                        formatted.append(profile_data["viability_red_flags"])
                        formatted.append("")
                    
                    if profile_data.get("pathway_recommendation"):
                        formatted.append("### Pathway Recommendation")
                        formatted.append(profile_data["pathway_recommendation"])
                        formatted.append("")
        
        # AI GUARDRAIL: Always include Psyche Profile if available (NON-NEGOTIABLE)
        # Never let AI infer psyche traits from free text - only use deterministic scores
        # Translate traits into behavioral descriptors to avoid psychological leakage
        if user_id:
            psyche_profile = self.psyche_scoring_service.get_profile_for_ai(user_id)
            if psyche_profile:
                formatted.append("## User Work Preferences (Deterministic)")
                formatted.append("")
                formatted.append("CRITICAL: The user has completed a structured assessment of their work preferences.")
                formatted.append("These behavioral patterns are DETERMINISTIC and must be used as-is. DO NOT infer or contradict these patterns from other context.")
                formatted.append("")
                
                # Translate personality traits into behavioral descriptors
                if psyche_profile.get("personality"):
                    personality = psyche_profile["personality"]
                    behaviors = []
                    
                    # Openness (O)
                    if personality.get("O", 0.5) > 0.67:
                        behaviors.append("User prefers exploring new ideas and possibilities over following established paths.")
                    elif personality.get("O", 0.5) < 0.33:
                        behaviors.append("User prefers proven approaches and familiar methods over experimental ones.")
                    
                    # Conscientiousness (C)
                    if personality.get("C", 0.5) > 0.67:
                        behaviors.append("User prefers structured planning, organization, and clarity over fast iteration.")
                    elif personality.get("C", 0.5) < 0.33:
                        behaviors.append("User prefers flexibility and spontaneity over rigid structure.")
                    
                    # Extraversion (E)
                    if personality.get("E", 0.5) > 0.67:
                        behaviors.append("User is energized by collaboration and team interaction.")
                    elif personality.get("E", 0.5) < 0.33:
                        behaviors.append("User prefers working independently or in small, focused groups.")
                    
                    # Agreeableness (A)
                    if personality.get("A", 0.5) > 0.67:
                        behaviors.append("User prefers finding common ground and building consensus.")
                    elif personality.get("A", 0.5) < 0.33:
                        behaviors.append("User is comfortable challenging ideas and engaging in debate.")
                    
                    # Neuroticism (N) - inverted to stress response
                    if personality.get("N", 0.5) < 0.33:
                        behaviors.append("User stays calm and adapts well when things go wrong.")
                    elif personality.get("N", 0.5) > 0.67:
                        behaviors.append("User may feel more stress under uncertainty and prefers stable situations.")
                    
                    if behaviors:
                        formatted.append("### How User Prefers to Work")
                        for behavior in behaviors:
                            formatted.append(f"- {behavior}")
                        formatted.append("")
                
                # Translate decision style into behavioral descriptors
                if psyche_profile.get("decision_style"):
                    decision = psyche_profile["decision_style"]
                    decision_behaviors = []
                    
                    if "risk" in decision:
                        if decision["risk"] < 0.4:
                            decision_behaviors.append("User is cautious with irreversible risk, especially early in a venture.")
                        elif decision["risk"] > 0.6:
                            decision_behaviors.append("User is comfortable taking calculated risks when the potential payoff is clear.")
                    
                    if "speed_vs_certainty" in decision:
                        if decision["speed_vs_certainty"] > 0.6:
                            decision_behaviors.append("User prefers thoroughness and certainty over speed when making important decisions.")
                        elif decision["speed_vs_certainty"] < 0.4:
                            decision_behaviors.append("User prefers quick action and iteration over waiting for perfect information.")
                    
                    if "maximize" in decision:
                        if decision["maximize"] > 0.6:
                            decision_behaviors.append("User tends to compare many options thoroughly before choosing.")
                        elif decision["maximize"] < 0.4:
                            decision_behaviors.append("User is comfortable choosing the first option that meets their core requirements.")
                    
                    if decision_behaviors:
                        formatted.append("### Decision-Making Approach")
                        for behavior in decision_behaviors:
                            formatted.append(f"- {behavior}")
                        formatted.append("")
                
                # Translate motivation into behavioral descriptors
                if psyche_profile.get("motivation"):
                    motivation = psyche_profile["motivation"]
                    # Find dominant motivation
                    dominant = max(motivation.items(), key=lambda x: x[1])
                    motivation_behaviors = []
                    
                    if dominant[1] > 0.4:  # Significant preference
                        if dominant[0] == "mastery":
                            motivation_behaviors.append("User is motivated by skill-building, depth, and expertise over quick wins.")
                        elif dominant[0] == "autonomy":
                            motivation_behaviors.append("User is motivated by independence, control, and freedom to work on their own terms.")
                        elif dominant[0] == "purpose":
                            motivation_behaviors.append("User is motivated by meaningful impact and creating change over personal gain.")
                    
                    if motivation_behaviors:
                        formatted.append("### What Drives the User")
                        for behavior in motivation_behaviors:
                            formatted.append(f"- {behavior}")
                        formatted.append("")
                
                formatted.append("REQUIRED ACTIONS:")
                formatted.append("1. Filter ideas that conflict with the user's work preferences and decision-making approach")
                formatted.append("2. Rank ideas that best align with their motivation and how they prefer to work")
                formatted.append("3. Explain why each recommendation fits their preferences in practical, work-oriented terms")
                formatted.append("4. Warn about potential friction points based on their work style")
                formatted.append("")
                formatted.append("CRITICAL EXPLANATION RULE: When explaining why an idea fits, do NOT mention personality traits,")
                formatted.append("scores, assessment results, or psychological terms. Explain fit in practical, work-oriented terms only.")
                formatted.append("Example: 'This idea allows you to build deep expertise' NOT 'This fits your high mastery motivation'")
                formatted.append("")
                formatted.append("ABSOLUTE RULE: If any other context (profile analysis, intake form, etc.) suggests")
                formatted.append("different patterns than these deterministic preferences, TRUST THESE PREFERENCES. Do not infer or override.")
                formatted.append("")
        
        if formatted:
            return "\n".join(formatted)
        
        # If no delimiters found, return as-is (might be old format or already formatted)
        return profile_text

