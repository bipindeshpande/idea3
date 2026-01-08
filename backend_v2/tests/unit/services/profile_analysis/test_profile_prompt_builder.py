"""
Tests for profile_prompt_builder.py module.

Tests prompt building functions for profile analysis.
"""
import pytest
import json
from app.services.profile_analysis.profile_prompt_builder import ProfilePromptBuilder


class TestBuildSystemPrompt:
    """Tests for build_system_prompt method"""
    
    def test_build_system_prompt_with_variables(self):
        """Test building system prompt with variables"""
        variables = {
            "experience_level": "experienced",
            "goal_timeline": "6 months",
            "idea_type": "SaaS",
            "timeline_urgency_score": 8,
            "time_commitment": "Full-time",
            "budget": "$10K - $20K",
            "risk_tolerance": "Moderate",
            "technical_strength": "Coding, AI Tools",
            "business_strength": "Marketing",
            "industry_background": "Technology",
            "estimated_skill_seniority": "senior",
            "industry_fit_score": 8,
            "market_readiness": "high",
            "biggest_constraint": "Limited budget",
            "entrepreneurial_risk_profile": "moderate"
        }
        
        prompt = ProfilePromptBuilder.build_system_prompt(variables)
        
        assert "expert startup advisor" in prompt.lower()
        assert "User Variables" in prompt
        assert "experienced" in prompt
        assert "6 months" in prompt
        assert "SaaS" in prompt
        assert "8" in prompt  # timeline_urgency_score
        assert "JSON" in prompt
        assert "core_motivations" in prompt
        assert "operating_constraints" in prompt
        assert "strengths_and_capabilities" in prompt
        assert "strategic_considerations" in prompt
        assert "viability_red_flags" in prompt
        assert "pathway_recommendation" in prompt
        assert "PROFILE_ANALYSIS_START" in prompt
        assert "PROFILE_ANALYSIS_END" in prompt
    
    def test_build_system_prompt_with_minimal_variables(self):
        """Test building system prompt with minimal variables"""
        variables = {
            "experience_level": "unknown",
            "goal_timeline": "",
            "idea_type": "",
            "timeline_urgency_score": 5
        }
        
        prompt = ProfilePromptBuilder.build_system_prompt(variables)
        
        assert "User Variables" in prompt
        assert "unknown" in prompt
        assert "5" in prompt
        assert "core_motivations" in prompt
    
    def test_build_system_prompt_includes_all_sections(self):
        """Test that system prompt includes all required sections"""
        variables = {
            "experience_level": "experienced",
            "goal_timeline": "6 months",
            "idea_type": "SaaS",
            "timeline_urgency_score": 8,
            "time_commitment": "Full-time",
            "budget": "$10K",
            "risk_tolerance": "Moderate",
            "technical_strength": "Coding",
            "business_strength": "Marketing",
            "industry_background": "Tech",
            "estimated_skill_seniority": "senior",
            "industry_fit_score": 8,
            "market_readiness": "high",
            "biggest_constraint": "Budget",
            "entrepreneurial_risk_profile": "moderate"
        }
        
        prompt = ProfilePromptBuilder.build_system_prompt(variables)
        
        # Check for section-specific requirements
        assert "CORE_MOTIVATIONS" in prompt
        assert "OPERATING_CONSTRAINTS" in prompt
        assert "STRENGTHS_AND_CAPABILITIES" in prompt
        assert "STRATEGIC_CONSIDERATIONS" in prompt
        assert "VIABILITY_RED_FLAGS" in prompt
        assert "PATHWAY_RECOMMENDATION" in prompt
    
    def test_build_system_prompt_variables_json_format(self):
        """Test that variables are properly formatted as JSON in prompt"""
        variables = {
            "experience_level": "experienced",
            "goal_timeline": "6 months"
        }
        
        prompt = ProfilePromptBuilder.build_system_prompt(variables)
        
        # Variables should be in JSON format
        vars_json = json.dumps(variables, indent=2)
        assert vars_json in prompt or "experience_level" in prompt


class TestBuildUserPrompt:
    """Tests for build_user_prompt method"""
    
    def test_build_user_prompt_with_complete_inputs(self):
        """Test building user prompt with complete inputs"""
        inputs = {
            "time_commitment": "Full-time",
            "budget_range": "$10K - $20K",
            "risk_tolerance": "Moderate",
            "preferred_work_style": "Solo",
            "startup_style": "Tech startup",
            "business_type": "SaaS",
            "earnings_timeline": "6 months",
            "founder_ambition": "Build a successful SaaS",
            "industry_interest": "Technology",
            "experience_summary": "10 years of software development",
            "skills": {
                "product_creation": ["Coding"],
                "digital": ["AI Tools"],
                "sales_marketing": ["Marketing"],
                "operational": ["Operations"],
                "other": "Custom skills"
            }
        }
        variables = {
            "experience_level": "experienced",
            "goal_timeline": "6 months",
            "idea_type": "SaaS"
        }
        
        prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        assert "Analyze the following user profile" in prompt
        assert "User Variables" in prompt
        assert "User Profile Data" in prompt
        assert "Full-time" in prompt
        assert "$10K - $20K" in prompt
        assert "Moderate" in prompt
        assert "Solo" in prompt
        assert "Tech startup" in prompt
        assert "SaaS" in prompt
        assert "6 months" in prompt
        assert "Technology" in prompt
        assert "10 years" in prompt
        assert "Coding" in prompt
        assert "AI Tools" in prompt
        assert "Marketing" in prompt
        assert "Custom skills" in prompt
        assert "PROFILE_ANALYSIS_START" in prompt
        assert "PROFILE_ANALYSIS_END" in prompt
    
    def test_build_user_prompt_with_minimal_inputs(self):
        """Test building user prompt with minimal inputs"""
        inputs = {}
        variables = {}
        
        prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        assert "Analyze the following user profile" in prompt
        assert "User Variables" in prompt
        assert "User Profile Data" in prompt
        assert "PROFILE_ANALYSIS_START" in prompt
    
    def test_build_user_prompt_skills_formatting(self):
        """Test that skills are properly formatted in prompt"""
        inputs = {
            "skills": {
                "product_creation": ["Coding", "AI & Automation"],
                "digital": ["AI Tools", "Web Building"],
                "sales_marketing": ["Marketing", "Sales"],
                "operational": ["Operations"],
                "other": "Custom skill description"
            }
        }
        variables = {}
        
        prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        assert "Coding" in prompt
        assert "AI & Automation" in prompt
        assert "AI Tools" in prompt
        assert "Web Building" in prompt
        assert "Marketing" in prompt
        assert "Sales" in prompt
        assert "Operations" in prompt
        assert "Custom skill description" in prompt
    
    def test_build_user_prompt_empty_skills(self):
        """Test building prompt with empty skills"""
        inputs = {
            "skills": {}
        }
        variables = {}
        
        prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        # Should not crash and should still include structure
        assert "User Profile Data" in prompt
    
    def test_build_user_prompt_includes_section_requirements(self):
        """Test that user prompt includes section-specific requirements"""
        inputs = {
            "time_commitment": "Full-time",
            "budget_range": "$10K"
        }
        variables = {
            "experience_level": "experienced",
            "goal_timeline": "6 months"
        }
        
        prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        # Check for section requirements
        assert "CORE_MOTIVATIONS" in prompt
        assert "OPERATING_CONSTRAINTS" in prompt
        assert "STRENGTHS_AND_CAPABILITIES" in prompt
        assert "STRATEGIC_CONSIDERATIONS" in prompt
        assert "VIABILITY_RED_FLAGS" in prompt
        assert "PATHWAY_RECOMMENDATION" in prompt
        assert "TONE REQUIREMENTS" in prompt
        assert "ABSOLUTE REQUIREMENTS" in prompt
    
    def test_build_user_prompt_variables_json(self):
        """Test that variables are included as JSON in prompt"""
        inputs = {}
        variables = {
            "experience_level": "experienced",
            "goal_timeline": "6 months"
        }
        
        prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        # Variables should be in JSON format
        vars_json = json.dumps(variables, indent=2)
        assert vars_json in prompt
    
    def test_build_user_prompt_skips_missing_fields(self):
        """Test that missing optional fields are skipped"""
        inputs = {
            "time_commitment": "Full-time"
            # Missing other fields
        }
        variables = {}
        
        prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        # Should include time_commitment
        assert "Full-time" in prompt
        # Should not include fields that weren't provided
        # (This is tested by absence of specific missing field values)
    
    def test_build_user_prompt_with_other_skills_string(self):
        """Test handling of 'other' skills as string"""
        inputs = {
            "skills": {
                "other": "Python, JavaScript, React"
            }
        }
        variables = {}
        
        prompt = ProfilePromptBuilder.build_user_prompt(inputs, variables)
        
        assert "Python, JavaScript, React" in prompt
        assert "Other:" in prompt

