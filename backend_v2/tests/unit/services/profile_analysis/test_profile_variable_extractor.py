"""
Tests for profile_variable_extractor.py module.

Tests user variable extraction and inference functions.
"""
import pytest
from app.services.profile_analysis.profile_variable_extractor import ProfileVariableExtractor


class TestExtractUserVariables:
    """Tests for extract_user_variables method"""
    
    def test_extract_complete_inputs(self):
        """Test extracting variables from complete inputs"""
        inputs = {
            "time_commitment": "Full-time",
            "budget_range": "$10K - $20K",
            "risk_tolerance": "Moderate",
            "preferred_work_style": "Solo",
            "industry_interest": "Technology",
            "earnings_timeline": "6 months",
            "business_type": "SaaS",
            "experience_summary": "10 years of software development",
            "skills": {
                "product_creation": ["Coding"],
                "digital": ["AI Tools"],
                "sales_marketing": ["Marketing"],
                "operational": ["Operations"]
            }
        }
        
        variables = ProfileVariableExtractor.extract_user_variables(inputs)
        
        assert variables["time_commitment"] == "Full-time"
        assert variables["budget"] == "$10K - $20K"
        assert variables["risk_tolerance"] == "Moderate"
        assert variables["preferred_work_style"] == "Solo"
        assert variables["industry_background"] == "Technology"
        assert "experience_level" in variables
        assert "goal_timeline" in variables
        assert "idea_type" in variables
        assert "technical_strength" in variables
        assert "business_strength" in variables
        assert "biggest_constraint" in variables
        assert "market_readiness" in variables
        assert "estimated_skill_seniority" in variables
        assert "industry_fit_score" in variables
        assert "monetization_preference" in variables
        assert "timeline_urgency_score" in variables
        assert "entrepreneurial_risk_profile" in variables
    
    def test_extract_minimal_inputs(self):
        """Test extracting variables from minimal inputs"""
        inputs = {}
        
        variables = ProfileVariableExtractor.extract_user_variables(inputs)
        
        # Should still extract all variables with defaults
        assert variables["time_commitment"] == ""
        assert variables["budget"] == ""
        assert variables["risk_tolerance"] == ""
        assert "experience_level" in variables
        assert "goal_timeline" in variables
        assert "idea_type" in variables
    
    def test_extract_with_founder_ambition(self):
        """Test extracting goal_timeline from founder_ambition when earnings_timeline missing"""
        inputs = {
            "founder_ambition": "Build a unicorn"
        }
        
        variables = ProfileVariableExtractor.extract_user_variables(inputs)
        
        assert variables["goal_timeline"] == "Build a unicorn"
    
    def test_extract_with_startup_style(self):
        """Test extracting idea_type from startup_style when business_type missing"""
        inputs = {
            "startup_style": "Tech startup"
        }
        
        variables = ProfileVariableExtractor.extract_user_variables(inputs)
        
        assert variables["idea_type"] == "Tech startup"


class TestInferExperienceLevel:
    """Tests for _infer_experience_level method"""
    
    def test_infer_experienced(self):
        """Test inferring experienced level"""
        inputs = {"experience_summary": "I have 15 years of experience in software development"}
        result = ProfileVariableExtractor._infer_experience_level(inputs)
        assert result == "experienced"
    
    def test_infer_experienced_with_keywords(self):
        """Test inferring experienced level with keywords"""
        inputs = {"experience_summary": "I am a senior developer and expert in my field"}
        result = ProfileVariableExtractor._infer_experience_level(inputs)
        assert result == "experienced"
    
    def test_infer_beginner(self):
        """Test inferring beginner level"""
        inputs = {"experience_summary": "I am a beginner just learning to code"}
        result = ProfileVariableExtractor._infer_experience_level(inputs)
        assert result == "beginner"
    
    def test_infer_intermediate(self):
        """Test inferring intermediate level"""
        inputs = {"experience_summary": "I have some experience with web development"}
        result = ProfileVariableExtractor._infer_experience_level(inputs)
        assert result == "intermediate"
    
    def test_infer_unknown(self):
        """Test inferring unknown when no experience_summary"""
        inputs = {}
        result = ProfileVariableExtractor._infer_experience_level(inputs)
        assert result == "unknown"


class TestExtractSkillStrengths:
    """Tests for _extract_skill_strengths method"""
    
    def test_extract_technical_strengths(self):
        """Test extracting technical strengths"""
        inputs = {
            "skills": {
                "product_creation": ["Coding", "AI & Automation"],
                "digital": ["AI Tools", "Web Building"]
            }
        }
        technical, business = ProfileVariableExtractor._extract_skill_strengths(inputs)
        assert "Coding" in technical
        assert "AI & Automation" in technical
        assert "AI Tools" in technical
        assert "Web Building" in technical
    
    def test_extract_business_strengths(self):
        """Test extracting business strengths"""
        inputs = {
            "skills": {
                "sales_marketing": ["Marketing", "Sales"],
                "operational": ["Operations", "Management"]
            }
        }
        technical, business = ProfileVariableExtractor._extract_skill_strengths(inputs)
        assert "Marketing" in business
        assert "Sales" in business
        assert "Operations" in business
        assert "Management" in business
    
    def test_extract_no_skills(self):
        """Test extracting when no skills provided"""
        inputs = {}
        technical, business = ProfileVariableExtractor._extract_skill_strengths(inputs)
        assert technical == "Limited"
        assert business == "Limited"
    
    def test_extract_empty_skills(self):
        """Test extracting when skills dict is empty"""
        inputs = {"skills": {}}
        technical, business = ProfileVariableExtractor._extract_skill_strengths(inputs)
        assert technical == "Limited"
        assert business == "Limited"


class TestInferBiggestConstraint:
    """Tests for _infer_biggest_constraint method"""
    
    def test_infer_time_constraint(self):
        """Test inferring time constraint"""
        variables = {"time_commitment": "<5 hours/week"}
        result = ProfileVariableExtractor._infer_biggest_constraint(variables)
        assert "time" in result.lower() or "Limited time" in result
    
    def test_infer_budget_constraint(self):
        """Test inferring budget constraint"""
        variables = {"budget": "Free / $0"}
        result = ProfileVariableExtractor._infer_biggest_constraint(variables)
        assert "budget" in result.lower() or "Limited budget" in result
    
    def test_infer_risk_constraint(self):
        """Test inferring risk constraint"""
        variables = {"risk_tolerance": "Low"}
        result = ProfileVariableExtractor._infer_biggest_constraint(variables)
        assert "risk" in result.lower() or "Low risk" in result
    
    def test_infer_moderate_constraints(self):
        """Test inferring moderate constraints when none are limiting"""
        variables = {
            "time_commitment": "Full-time",
            "budget": "$20K+",
            "risk_tolerance": "High"
        }
        result = ProfileVariableExtractor._infer_biggest_constraint(variables)
        assert "Moderate" in result or "moderate" in result.lower()


class TestInferMarketReadiness:
    """Tests for _infer_market_readiness method"""
    
    def test_infer_high_readiness(self):
        """Test inferring high market readiness"""
        variables = {
            "experience_level": "experienced",
            "time_commitment": "Full-time",
            "budget": "$20K+"
        }
        result = ProfileVariableExtractor._infer_market_readiness(variables)
        assert result == "high"
    
    def test_infer_moderate_readiness(self):
        """Test inferring moderate market readiness"""
        variables = {
            "experience_level": "experienced",
            "time_commitment": "Part-time"
        }
        result = ProfileVariableExtractor._infer_market_readiness(variables)
        assert result == "moderate"
    
    def test_infer_low_readiness(self):
        """Test inferring low market readiness"""
        variables = {
            "experience_level": "beginner",
            "time_commitment": "Part-time"
        }
        result = ProfileVariableExtractor._infer_market_readiness(variables)
        assert result == "low"


class TestInferSkillSeniority:
    """Tests for _infer_skill_seniority method"""
    
    def test_infer_senior(self):
        """Test inferring senior skill level"""
        inputs = {"experience_summary": "I have 15 years of experience as a senior engineer"}
        result = ProfileVariableExtractor._infer_skill_seniority(inputs)
        assert result == "senior"
    
    def test_infer_senior_with_keywords(self):
        """Test inferring senior with keywords"""
        inputs = {"experience_summary": "I am a principal architect and director of engineering"}
        result = ProfileVariableExtractor._infer_skill_seniority(inputs)
        assert result == "senior"
    
    def test_infer_mid(self):
        """Test inferring mid skill level"""
        inputs = {"experience_summary": "I have 7 years of experience"}
        result = ProfileVariableExtractor._infer_skill_seniority(inputs)
        assert result == "mid"
    
    def test_infer_junior(self):
        """Test inferring junior skill level"""
        inputs = {"experience_summary": "I am a junior developer just starting out"}
        result = ProfileVariableExtractor._infer_skill_seniority(inputs)
        assert result == "junior"
    
    def test_infer_default_mid(self):
        """Test defaulting to mid when no experience_summary"""
        inputs = {}
        result = ProfileVariableExtractor._infer_skill_seniority(inputs)
        assert result == "mid"
    
    def test_infer_mid_default_fallback(self):
        """Test defaulting to mid when experience doesn't match any category"""
        inputs = {"experience_summary": "Some random text that doesn't match patterns"}
        result = ProfileVariableExtractor._infer_skill_seniority(inputs)
        assert result == "mid"


class TestInferIndustryFitScore:
    """Tests for _infer_industry_fit_score method"""
    
    def test_infer_high_fit_tech(self):
        """Test inferring high fit for tech industry"""
        variables = {
            "industry_background": "Technology",
            "idea_type": "SaaS software"
        }
        result = ProfileVariableExtractor._infer_industry_fit_score(variables)
        assert result >= 7
    
    def test_infer_high_fit_business(self):
        """Test inferring high fit for business services"""
        variables = {
            "industry_background": "Business consulting",
            "idea_type": "B2B service"
        }
        result = ProfileVariableExtractor._infer_industry_fit_score(variables)
        assert result >= 7
    
    def test_infer_low_fit(self):
        """Test inferring low fit for mismatched industries"""
        variables = {
            "industry_background": "Technology",
            "idea_type": "Restaurant business"
        }
        result = ProfileVariableExtractor._infer_industry_fit_score(variables)
        assert result <= 5
    
    def test_infer_default_neutral(self):
        """Test defaulting to neutral score"""
        variables = {}
        result = ProfileVariableExtractor._infer_industry_fit_score(variables)
        assert result == 5
    
    def test_infer_high_fit_ecommerce(self):
        """Test inferring high fit for ecommerce industry"""
        variables = {
            "industry_background": "ecommerce retail",
            "idea_type": "online marketplace"
        }
        result = ProfileVariableExtractor._infer_industry_fit_score(variables)
        assert result >= 7
    
    def test_infer_fit_keyword_intersection(self):
        """Test inferring fit score from keyword intersection"""
        variables = {
            "industry_background": "healthcare technology",
            "idea_type": "healthcare software"
        }
        result = ProfileVariableExtractor._infer_industry_fit_score(variables)
        assert result >= 6


class TestInferMonetizationPreference:
    """Tests for _infer_monetization_preference method"""
    
    def test_infer_subscription(self):
        """Test inferring subscription monetization"""
        variables = {"idea_type": "SaaS software subscription"}
        result = ProfileVariableExtractor._infer_monetization_preference(variables)
        assert result == "subscription"
    
    def test_infer_services(self):
        """Test inferring services monetization"""
        variables = {"idea_type": "Consulting agency service"}
        result = ProfileVariableExtractor._infer_monetization_preference(variables)
        assert result == "services"
    
    def test_infer_one_time(self):
        """Test inferring one-time monetization"""
        variables = {"idea_type": "Physical product goods"}
        result = ProfileVariableExtractor._infer_monetization_preference(variables)
        assert result == "one-time"
    
    def test_infer_ads(self):
        """Test inferring ads monetization"""
        variables = {"idea_type": "Content media blog"}
        result = ProfileVariableExtractor._infer_monetization_preference(variables)
        assert result == "ads"
    
    def test_infer_not_specified(self):
        """Test defaulting to not-specified"""
        variables = {}
        result = ProfileVariableExtractor._infer_monetization_preference(variables)
        assert result == "not-specified"


class TestInferTimelineUrgency:
    """Tests for _infer_timeline_urgency method"""
    
    def test_infer_high_urgency_immediate(self):
        """Test inferring high urgency for immediate timeline"""
        variables = {"goal_timeline": "I need to start immediately"}
        result = ProfileVariableExtractor._infer_timeline_urgency(variables)
        assert result >= 8
    
    def test_infer_high_urgency_short(self):
        """Test inferring high urgency for short timeline"""
        variables = {"goal_timeline": "3 months"}
        result = ProfileVariableExtractor._infer_timeline_urgency(variables)
        assert result >= 7
    
    def test_infer_moderate_urgency(self):
        """Test inferring moderate urgency"""
        variables = {"goal_timeline": "1 year"}
        result = ProfileVariableExtractor._infer_timeline_urgency(variables)
        assert 5 <= result <= 7
    
    def test_infer_default_urgency(self):
        """Test defaulting to moderate urgency"""
        variables = {}
        result = ProfileVariableExtractor._infer_timeline_urgency(variables)
        assert result == 5
    
    def test_infer_urgency_with_constraints(self):
        """Test inferring urgency adjusted by constraints"""
        variables = {
            "goal_timeline": "6 months",
            "budget": "Free / $0",
            "time_commitment": "<5 hours/week"
        }
        result = ProfileVariableExtractor._infer_timeline_urgency(variables)
        # Should be higher due to limited resources
        assert result >= 6
    
    def test_infer_urgency_adjustment_low_score(self):
        """Test urgency adjustment when initial score is low"""
        variables = {
            "goal_timeline": "2 years",  # Low urgency initially
            "budget": "Free / $0",
            "time_commitment": "<5 hours/week"
        }
        result = ProfileVariableExtractor._infer_timeline_urgency(variables)
        # Should be adjusted upward due to constraints
        assert result >= 5


class TestInferRiskProfile:
    """Tests for _infer_risk_profile method"""
    
    def test_infer_conservative(self):
        """Test inferring conservative risk profile"""
        variables = {"risk_tolerance": "Low risk minimal"}
        result = ProfileVariableExtractor._infer_risk_profile(variables)
        assert result == "conservative"
    
    def test_infer_aggressive(self):
        """Test inferring aggressive risk profile"""
        variables = {"risk_tolerance": "High risk aggressive bold"}
        result = ProfileVariableExtractor._infer_risk_profile(variables)
        assert result == "aggressive"
    
    def test_infer_moderate(self):
        """Test inferring moderate risk profile"""
        variables = {"risk_tolerance": "Moderate"}
        result = ProfileVariableExtractor._infer_risk_profile(variables)
        assert result == "moderate"
    
    def test_infer_default_moderate(self):
        """Test defaulting to moderate"""
        variables = {}
        result = ProfileVariableExtractor._infer_risk_profile(variables)
        assert result == "moderate"

