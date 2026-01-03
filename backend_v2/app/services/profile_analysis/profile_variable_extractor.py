"""User variable extraction and inference for profile analysis"""
import re
from typing import Dict, Any, Tuple


class ProfileVariableExtractor:
    """Extracts and infers user variables for personalization"""
    
    @staticmethod
    def extract_user_variables(inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and infer user variables for personalization"""
        variables = {}
        
        # Direct variables
        variables["time_commitment"] = inputs.get("time_commitment", "")
        variables["budget"] = inputs.get("budget_range", "")
        variables["risk_tolerance"] = inputs.get("risk_tolerance", "")
        variables["preferred_work_style"] = inputs.get("preferred_work_style", "")
        variables["industry_background"] = inputs.get("industry_interest", "")
        
        # Inferred variables
        variables["experience_level"] = ProfileVariableExtractor._infer_experience_level(inputs)
        variables["goal_timeline"] = inputs.get("earnings_timeline", "") or inputs.get("founder_ambition", "")
        variables["idea_type"] = inputs.get("business_type", "") or inputs.get("startup_style", "")
        
        # Extract technical and business strengths
        technical_strength, business_strength = ProfileVariableExtractor._extract_skill_strengths(inputs)
        variables["technical_strength"] = technical_strength
        variables["business_strength"] = business_strength
        
        # Infer additional variables
        variables["biggest_constraint"] = ProfileVariableExtractor._infer_biggest_constraint(variables)
        variables["market_readiness"] = ProfileVariableExtractor._infer_market_readiness(variables)
        variables["estimated_skill_seniority"] = ProfileVariableExtractor._infer_skill_seniority(inputs)
        variables["industry_fit_score"] = ProfileVariableExtractor._infer_industry_fit_score(variables)
        variables["monetization_preference"] = ProfileVariableExtractor._infer_monetization_preference(variables)
        variables["timeline_urgency_score"] = ProfileVariableExtractor._infer_timeline_urgency(variables)
        variables["entrepreneurial_risk_profile"] = ProfileVariableExtractor._infer_risk_profile(variables)
        
        return variables
    
    @staticmethod
    def _infer_experience_level(inputs: Dict[str, Any]) -> str:
        """Infer experience level from experience_summary"""
        experience_summary = inputs.get("experience_summary", "")
        if experience_summary:
            exp_lower = experience_summary.lower()
            if any(word in exp_lower for word in ["years", "decade", "senior", "expert", "experienced"]):
                return "experienced"
            elif any(word in exp_lower for word in ["beginner", "new", "learning", "junior"]):
                return "beginner"
            else:
                return "intermediate"
        return "unknown"
    
    @staticmethod
    def _extract_skill_strengths(inputs: Dict[str, Any]) -> Tuple[str, str]:
        """Extract technical and business strengths from skills"""
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
        
        technical_strength = ", ".join(technical_skills) if technical_skills else "Limited"
        business_strength = ", ".join(business_skills) if business_skills else "Limited"
        
        return technical_strength, business_strength
    
    @staticmethod
    def _infer_biggest_constraint(variables: Dict[str, Any]) -> str:
        """Infer biggest constraint from most limiting factor"""
        constraints = []
        time_commitment = variables.get("time_commitment", "")
        budget = variables.get("budget", "")
        risk_tolerance = variables.get("risk_tolerance", "")
        
        if time_commitment and ("<5" in time_commitment or "5–10" in time_commitment):
            constraints.append(("time", "Limited time commitment"))
        if budget and ("Free" in budget or "$0" in budget or "< $1 K" in budget):
            constraints.append(("budget", "Limited budget"))
        if risk_tolerance and risk_tolerance.lower() == "low":
            constraints.append(("risk", "Low risk tolerance"))
        
        if constraints:
            return constraints[0][1]  # Most limiting
        return "Moderate constraints"
    
    @staticmethod
    def _infer_market_readiness(variables: Dict[str, Any]) -> str:
        """Infer market readiness from experience, time, budget"""
        readiness_factors = []
        experience_level = variables.get("experience_level", "")
        time_commitment = variables.get("time_commitment", "")
        budget = variables.get("budget", "")
        
        if experience_level in ["experienced", "intermediate"]:
            readiness_factors.append("experience")
        if time_commitment and "Full-time" in time_commitment:
            readiness_factors.append("time")
        if budget and ("$20" in budget or "$10" in budget):
            readiness_factors.append("budget")
        
        if len(readiness_factors) >= 2:
            return "high"
        elif len(readiness_factors) == 1:
            return "moderate"
        else:
            return "low"
    
    @staticmethod
    def _infer_skill_seniority(inputs: Dict[str, Any]) -> str:
        """Infer estimated skill seniority from experience_summary"""
        experience_summary = inputs.get("experience_summary", "")
        if not experience_summary:
            return "mid"  # Default
        
        exp_lower = experience_summary.lower()
        # Check for years mentioned
        years_match = re.search(r'(\d+)\s*years?', exp_lower)
        years = 0
        if years_match:
            years = int(years_match.group(1))
        
        if years > 10 or any(word in exp_lower for word in ["senior", "expert", "lead", "principal", "architect", "director", "vp", "vice president"]):
            return "senior"
        elif years > 5 or any(word in exp_lower for word in ["mid-level", "mid level", "experienced", "5+", "6+", "7+", "8+", "9+"]):
            return "mid"
        elif any(word in exp_lower for word in ["junior", "entry", "beginner", "new", "learning", "intern"]):
            return "junior"
        else:
            return "mid"  # Default
    
    @staticmethod
    def _infer_industry_fit_score(variables: Dict[str, Any]) -> int:
        """Infer industry fit score (0-10) based on industry/background match with idea_type"""
        industry_background = (variables.get("industry_background", "") or "").lower()
        idea_type = (variables.get("idea_type", "") or "").lower()
        fit_score = 5  # Default neutral
        
        if industry_background and idea_type:
            # Check for keyword matches
            background_keywords = set(industry_background.split())
            idea_keywords = set(idea_type.split())
            
            # Common industry terms
            tech_terms = ["tech", "technology", "software", "saas", "app", "digital", "ai", "automation"]
            business_terms = ["business", "consulting", "service", "b2b", "b2c"]
            ecommerce_terms = ["ecommerce", "e-commerce", "retail", "online", "marketplace"]
            
            # Check matches
            if any(term in industry_background for term in tech_terms) and any(term in idea_type for term in tech_terms):
                fit_score = 8
            elif any(term in industry_background for term in business_terms) and any(term in idea_type for term in business_terms):
                fit_score = 8
            elif any(term in industry_background for term in ecommerce_terms) and any(term in idea_type for term in ecommerce_terms):
                fit_score = 8
            elif background_keywords.intersection(idea_keywords):
                fit_score = 7
            else:
                fit_score = 4  # Low match
        
        return fit_score
    
    @staticmethod
    def _infer_monetization_preference(variables: Dict[str, Any]) -> str:
        """Infer monetization preference from business_type and inputs"""
        monetization = "not-specified"
        idea_type = (variables.get("idea_type", "") or "").lower()
        
        if any(term in idea_type for term in ["saas", "software", "subscription", "recurring"]):
            monetization = "subscription"
        elif any(term in idea_type for term in ["service", "consulting", "agency", "freelance"]):
            monetization = "services"
        elif any(term in idea_type for term in ["product", "physical", "goods", "inventory"]):
            monetization = "one-time"
        elif any(term in idea_type for term in ["content", "media", "blog", "news", "advertising"]):
            monetization = "ads"
        
        return monetization
    
    @staticmethod
    def _infer_timeline_urgency(variables: Dict[str, Any]) -> int:
        """Infer timeline urgency score (0-10) based on earnings_timeline + motivations"""
        urgency_score = 5  # Default
        goal_timeline = (variables.get("goal_timeline", "") or "").lower()
        time_commitment = (variables.get("time_commitment", "") or "").lower()
        budget = (variables.get("budget", "") or "").lower()
        
        # High urgency indicators
        if any(term in goal_timeline for term in ["immediately", "now", "asap", "urgent", "soon", "quick", "fast"]):
            urgency_score = 9
        elif any(term in goal_timeline for term in ["3 months", "1 month", "2 months", "within 3"]):
            urgency_score = 8
        elif any(term in goal_timeline for term in ["6 months", "half year"]):
            urgency_score = 7
        elif any(term in goal_timeline for term in ["1 year", "12 months"]):
            urgency_score = 6
        
        # Adjust based on constraints (low budget + low time = higher urgency if they want fast results)
        if (budget and any(term in budget for term in ["free", "$0", "< $1", "under $1"])) and \
           (time_commitment and any(term in time_commitment for term in ["<5", "5-10", "part-time"])):
            # Limited resources but wants results = high urgency
            if urgency_score < 7:
                urgency_score = min(urgency_score + 2, 10)
        
        return urgency_score
    
    @staticmethod
    def _infer_risk_profile(variables: Dict[str, Any]) -> str:
        """Infer entrepreneurial risk profile: conservative | moderate | aggressive"""
        risk_tolerance = (variables.get("risk_tolerance", "") or "").lower()
        
        if any(term in risk_tolerance for term in ["low", "minimal", "conservative", "safe", "cautious"]):
            return "conservative"
        elif any(term in risk_tolerance for term in ["high", "aggressive", "bold", "risk-taking", "venturing"]):
            return "aggressive"
        else:
            return "moderate"

