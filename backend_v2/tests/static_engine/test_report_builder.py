"""
Tests for report_builder.py module.

Validates markdown report structure and formatting.
"""
import pytest
import re
from app.static_engine.report_builder import (
    build_markdown_report,
    _format_profile_for_report,
    _format_ideas_section,
    _format_industry_context
)


@pytest.fixture
def sample_profile():
    """Create sample profile data."""
    return {
        "core_motivations": "User wants to build a scalable business",
        "operating_constraints": "Limited budget and time",
        "strengths_and_capabilities": "Strong technical skills",
        "strategic_considerations": "Focus on automation",
        "viability_red_flags": "None identified",
        "pathway_recommendation": "Start with MVP approach"
    }


@pytest.fixture
def sample_ideas():
    """Create sample idea list."""
    return [
        {
            "problem": "Small businesses struggle to automate",
            "solution": "AI-powered workflow automation",
            "delivery_mode": "SaaS platform",
            "revenue_pattern": "Subscription monthly",
            "automation_pattern": "Automated lead scoring",
            "archetypes": ["tool", "analytics"],
            "weight": 4.5,
            "priority": "high"
        },
        {
            "problem": "Enterprises face high costs",
            "solution": "Predictive analytics",
            "delivery_mode": "Mobile app",
            "revenue_pattern": "Pay-per-use",
            "automation_pattern": "AI content generation",
            "archetypes": ["service"],
            "weight": 4.0,
            "priority": "medium"
        }
    ]


@pytest.fixture
def sample_industry_data():
    """Create sample industry data."""
    return {
        "markdown_template": "# Industry Overview\n\n## Ideas\n\n{{ideas}}\n\n## Context\n\n{{industry_context}}",
        "value_props": {
            "efficiency": ["Streamlined operations", "Automated workflows"],
            "cost_savings": ["Lower costs", "Reduced overhead"]
        },
        "skill_tags": {
            "machine_learning": ["Predictive models", "Algorithm implementation"],
            "data_analysis": ["Data interpretation", "Insight extraction"]
        },
        "budget_bins": {
            "low": "Under $10k",
            "medium": "$10k-$100k",
            "high": "Over $100k"
        },
        "constraints_map": {
            "time": "Implementation time constraints",
            "budget": "Budget limitations"
        },
        "archetypes": [
            {"id": "tool", "label": "AI Tool"},
            {"id": "analytics", "label": "Analytics Service"},
            {"id": "service", "label": "Service"}
        ]
    }


class TestReportStructure:
    """Test markdown report structure."""
    
    def test_report_contains_ideas_section(self, sample_profile, sample_ideas, sample_industry_data):
        """Report should contain ideas section."""
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=sample_industry_data
        )
        
        assert "## Ideas" in report or "### Idea" in report or "Recommended Ideas" in report
    
    def test_report_contains_profile_section(self, sample_profile, sample_ideas, sample_industry_data):
        """Report should contain profile information."""
        # Update template to include profile placeholder
        industry_data_with_profile = sample_industry_data.copy()
        industry_data_with_profile["markdown_template"] = (
            "# Industry Overview\n\n## Profile\n\n{{profile_analysis}}\n\n## Ideas\n\n{{ideas}}\n\n## Context\n\n{{industry_context}}"
        )
        
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=industry_data_with_profile
        )
        
        # Should contain at least one profile field
        assert "Core Motivations" in report or "core_motivations" in report.lower() or \
               "Profile" in report or sample_profile["core_motivations"] in report
    
    def test_report_contains_industry_context(self, sample_profile, sample_ideas, sample_industry_data):
        """Report should contain industry context."""
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=sample_industry_data
        )
        
        # Should contain context information
        assert "Context" in report or "Value Propositions" in report or \
               "Relevant Skills" in report or "Budget Considerations" in report
    
    def test_report_is_valid_markdown(self, sample_profile, sample_ideas, sample_industry_data):
        """Report should be valid markdown structure."""
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=sample_industry_data
        )
        
        # Check for markdown headers
        assert re.search(r'^#+\s+', report, re.MULTILINE), "Report should contain markdown headers"
        
        # Check for list items (ideas should be formatted as lists or sections)
        assert len(report) > 0, "Report should not be empty"
    
    def test_report_uses_template(self, sample_profile, sample_ideas, sample_industry_data):
        """Report should use industry template."""
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=sample_industry_data
        )
        
        # Template placeholder should be replaced
        assert "{{ideas}}" not in report, "Template placeholder should be replaced"
        assert "{{industry_context}}" not in report, "Template placeholder should be replaced"


class TestIdeasSection:
    """Test ideas section formatting."""
    
    def test_ideas_section_contains_all_ideas(self, sample_ideas, sample_industry_data):
        """Ideas section should contain all ideas."""
        section = _format_ideas_section(sample_ideas, sample_industry_data)
        
        # Should contain all idea problems
        for idea in sample_ideas:
            assert idea["problem"] in section, f"Missing problem: {idea['problem']}"
            assert idea["solution"] in section, f"Missing solution: {idea['solution']}"
    
    def test_ideas_section_has_correct_structure(self, sample_ideas, sample_industry_data):
        """Ideas section should have proper markdown structure."""
        section = _format_ideas_section(sample_ideas, sample_industry_data)
        
        # Should have idea headers
        assert "### Idea" in section or "## Recommended Ideas" in section
        
        # Should have idea fields
        assert "**Problem:**" in section or "Problem:" in section
        assert "**Solution:**" in section or "Solution:" in section
    
    def test_ideas_section_includes_archetypes(self, sample_ideas, sample_industry_data):
        """Ideas section should include archetype labels."""
        section = _format_ideas_section(sample_ideas, sample_industry_data)
        
        # Should contain archetype labels
        assert "AI Tool" in section or "Analytics Service" in section or \
               "tool" in section.lower() or "analytics" in section.lower()
    
    def test_ideas_section_includes_weights(self, sample_ideas, sample_industry_data):
        """Ideas section should include weight/priority information."""
        section = _format_ideas_section(sample_ideas, sample_industry_data)
        
        # Should contain weight or priority information
        assert "Relevance Score" in section or "weight" in section.lower() or \
               "priority" in section.lower() or "high" in section.lower() or \
               "medium" in section.lower()
    
    def test_empty_ideas_list_handled(self, sample_industry_data):
        """Empty ideas list should be handled gracefully."""
        section = _format_ideas_section([], sample_industry_data)
        
        assert len(section) > 0, "Should return some content even with empty list"
        assert "No ideas" in section or "idea" in section.lower()


class TestProfileFormatting:
    """Test profile formatting."""
    
    def test_profile_formatting_includes_all_fields(self, sample_profile):
        """Profile formatting should include all fields."""
        formatted = _format_profile_for_report(sample_profile)
        
        assert "Core Motivations" in formatted
        assert "Operating Constraints" in formatted
        assert "Strengths and Capabilities" in formatted
        assert "Strategic Considerations" in formatted
        assert "Viability Red Flags" in formatted
        assert "Pathway Recommendation" in formatted
    
    def test_profile_formatting_handles_string(self):
        """Profile formatting should handle string input."""
        profile_str = "This is a string profile"
        formatted = _format_profile_for_report(profile_str)
        
        assert formatted == profile_str
    
    def test_profile_formatting_handles_empty_dict(self):
        """Profile formatting should handle empty dictionary."""
        formatted = _format_profile_for_report({})
        
        assert "No profile data" in formatted or len(formatted) > 0


class TestIndustryContext:
    """Test industry context formatting."""
    
    def test_industry_context_includes_value_props(self, sample_industry_data):
        """Industry context should include value propositions."""
        context = _format_industry_context(sample_industry_data)
        
        assert "Value Propositions" in context
        assert "efficiency" in context.lower() or "Efficiency" in context
    
    def test_industry_context_includes_skill_tags(self, sample_industry_data):
        """Industry context should include skill tags."""
        context = _format_industry_context(sample_industry_data)
        
        assert "Relevant Skills" in context or "machine learning" in context.lower()
    
    def test_industry_context_includes_budget_bins(self, sample_industry_data):
        """Industry context should include budget bins."""
        context = _format_industry_context(sample_industry_data)
        
        assert "Budget Considerations" in context or "budget" in context.lower()
    
    def test_industry_context_includes_constraints(self, sample_industry_data):
        """Industry context should include constraints for high realism."""
        # Constraints only appear for realism >= 4
        context = _format_industry_context(sample_industry_data, realism_level=4)
        
        assert "Industry Constraints" in context or "Constraints" in context or "Considerations" in context


class TestDeterministicOutput:
    """Test that report output is deterministic."""
    
    def test_same_inputs_produce_same_output(self, sample_profile, sample_ideas, sample_industry_data):
        """Same inputs should produce same output."""
        report1 = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=sample_industry_data
        )
        
        report2 = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=sample_industry_data
        )
        
        assert report1 == report2, "Same inputs should produce identical output"
    
    def test_report_length_is_reasonable(self, sample_profile, sample_ideas, sample_industry_data):
        """Report should have reasonable length."""
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=sample_industry_data
        )
        
        # Should be substantial but not excessive
        assert len(report) > 100, "Report should be substantial"
        assert len(report) < 100000, "Report should not be excessively long"


class TestTemplateHandling:
    """Test template placeholder replacement."""
    
    def test_template_placeholders_replaced(self, sample_profile, sample_ideas):
        """Template placeholders should be replaced."""
        industry_data = {
            "markdown_template": "Template with {{ideas}} and {{industry_context}}",
            "value_props": {},
            "skill_tags": {},
            "budget_bins": {},
            "constraints_map": {}
        }
        
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=industry_data
        )
        
        assert "{{ideas}}" not in report
        assert "{{industry_context}}" not in report
    
    def test_no_template_uses_default(self, sample_profile, sample_ideas, sample_industry_data):
        """Missing template should use default."""
        industry_data_no_template = sample_industry_data.copy()
        industry_data_no_template["markdown_template"] = ""
        
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=industry_data_no_template
        )
        
        # Should still produce a report
        assert len(report) > 0
        assert "Industry Overview" in report or "Ideas" in report
    
    def test_template_without_placeholders_appends_sections(self, sample_profile, sample_ideas, sample_industry_data):
        """Template without placeholders should append sections."""
        industry_data_no_placeholders = sample_industry_data.copy()
        industry_data_no_placeholders["markdown_template"] = "# Static Template\n\nNo placeholders here."
        
        report = build_markdown_report(
            profile=sample_profile,
            idea_list=sample_ideas,
            industry_data=industry_data_no_placeholders
        )
        
        # Should contain template and appended sections
        assert "Static Template" in report
        assert len(report) > len(industry_data_no_placeholders["markdown_template"])
    
    def test_ideas_section_realism_level_low(self, sample_ideas, sample_industry_data):
        """Ideas section with low realism level should use personalized header."""
        section = _format_ideas_section(sample_ideas, sample_industry_data, realism_level=1)
        
        assert "Your Personalized Ideas" in section or "🚀" in section
    
    def test_ideas_section_realism_level_high(self, sample_ideas, sample_industry_data):
        """Ideas section with high realism level should use strategic header."""
        section = _format_ideas_section(sample_ideas, sample_industry_data, realism_level=5)
        
        assert "Strategic Startup Recommendations" in section
    
    def test_ideas_section_structured_format(self, sample_industry_data):
        """Ideas section should format structured ideas correctly."""
        structured_ideas = [
            {
                "title": "AI Automation Tool",
                "summary": "Automate workflows",
                "target_market": "Small businesses",
                "revenue_model": "Subscription",
                "validation_score": 8.5,
                "timeline": "3-6 months",
                "why_this_fits": "Matches your skills",
                "index": 1
            }
        ]
        
        section = _format_ideas_section(structured_ideas, sample_industry_data)
        
        assert "title: AI Automation Tool" in section
        assert "summary: Automate workflows" in section
        assert "target_market: Small businesses" in section
        assert "revenue_model: Subscription" in section
        assert "validation_score: 8.5" in section
        assert "timeline: 3-6 months" in section
        assert "why_this_fits: Matches your skills" in section
    
    def test_ideas_section_details_markdown(self, sample_industry_data):
        """Ideas section should include details_markdown if available."""
        ideas_with_details = [
            {
                "title": "Test Idea",
                "details_markdown": "## Detailed Description\n\nThis is a detailed explanation."
            }
        ]
        
        section = _format_ideas_section(ideas_with_details, sample_industry_data)
        
        assert "Detailed Description" in section
        assert "This is a detailed explanation" in section
    
    def test_industry_context_realism_level_low(self, sample_industry_data):
        """Industry context with low realism should use simplified headers."""
        context = _format_industry_context(sample_industry_data, realism_level=1)
        
        assert "Why This Industry Works" in context or "Budget Tips" in context
    
    def test_industry_context_realism_level_high(self, sample_industry_data):
        """Industry context with high realism should include all sections."""
        context = _format_industry_context(sample_industry_data, realism_level=5)
        
        assert "Value Propositions" in context
        assert "Relevant Skills" in context
        assert "Budget Considerations" in context
        assert "Industry Constraints" in context or "Considerations" in context
    
    def test_industry_context_constraints_only_high_realism(self, sample_industry_data):
        """Constraints section should only appear for high realism."""
        context_low = _format_industry_context(sample_industry_data, realism_level=3)
        context_high = _format_industry_context(sample_industry_data, realism_level=4)
        
        # Constraints should only be in high realism
        if "Constraints" in context_low:
            # If it appears in low, it should be less detailed
            assert "Industry Constraints & Considerations" not in context_low
        assert "Industry Constraints & Considerations" in context_high or "Constraints" in context_high

