"""
Report builder module.

Builds markdown reports from industry data and synthesized ideas.
Fully deterministic - no randomness in output formatting.
"""
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


def build_markdown_report(
    profile: Dict[str, Any],
    idea_list: List[Dict[str, Any]],
    industry_data: Dict[str, Any],
    realism_level: int = 3
) -> str:
    """
    Build a markdown report using industry template and synthesized ideas.
    
    Uses industry_data["markdown_template"] as the skeleton and fills it with:
    - 10-20 ideas from idea_list
    - Weighted and selected fragments
    - Industry context
    
    Args:
        profile: User profile analysis data
        idea_list: List of synthesized idea seeds from synthesizer
        industry_data: Industry data loaded from loader
        
    Returns:
        Complete markdown report string (fully deterministic)
    """
    template = industry_data.get("markdown_template", "")
    
    # If no template, build a default one
    if not template:
        template = _build_default_template(industry_data)
    
    # Extract profile information
    profile_text = _format_profile_for_report(profile)
    
    # Format ideas (with realism level adjustment)
    ideas_section = _format_ideas_section(idea_list, industry_data, realism_level)
    
    # Extract industry context (with realism level adjustment)
    industry_context = _format_industry_context(industry_data, realism_level)
    
    # Replace template placeholders
    report = template
    
    # Replace common placeholders
    report = report.replace("{{profile_analysis}}", profile_text)
    report = report.replace("{{ideas}}", ideas_section)
    report = report.replace("{{industry_context}}", industry_context)
    report = report.replace("{{business_models}}", _format_list(industry_data.get("business_models", [])))
    report = report.replace("{{target_segments}}", _format_list(industry_data.get("target_segments", [])))
    report = report.replace("{{trends}}", _format_list(industry_data.get("trend_summary", [])))
    report = report.replace("{{competitors}}", _format_list(industry_data.get("competitor_notes", [])))
    
    # If template doesn't have placeholders, append sections
    if "{{" not in template:
        report = f"{template}\n\n{profile_text}\n\n{ideas_section}\n\n{industry_context}"
    
    return report


def _build_default_template(industry_data: Dict[str, Any]) -> str:
    """Build a default markdown template if none exists."""
    return """# Industry Overview

## Business Models
{{business_models}}

## Target Segments
{{target_segments}}

## Trends
{{trends}}

## Competitor Landscape
{{competitors}}

## Profile Analysis
{{profile_analysis}}

## Idea Recommendations
{{ideas}}

## Industry Context
{{industry_context}}
"""


def _format_profile_for_report(profile: Dict[str, Any]) -> str:
    """Format profile data for markdown report."""
    if isinstance(profile, str):
        # If profile is already a string, return it
        return profile
    
    sections = []
    
    if profile.get("core_motivations"):
        sections.append(f"### Core Motivations\n\n{profile.get('core_motivations')}\n")
    
    if profile.get("operating_constraints"):
        sections.append(f"### Operating Constraints\n\n{profile.get('operating_constraints')}\n")
    
    if profile.get("strengths_and_capabilities"):
        sections.append(f"### Strengths and Capabilities\n\n{profile.get('strengths_and_capabilities')}\n")
    
    if profile.get("strategic_considerations"):
        sections.append(f"### Strategic Considerations\n\n{profile.get('strategic_considerations')}\n")
    
    if profile.get("viability_red_flags"):
        sections.append(f"### Viability Red Flags\n\n{profile.get('viability_red_flags')}\n")
    
    if profile.get("pathway_recommendation"):
        sections.append(f"### Pathway Recommendation\n\n{profile.get('pathway_recommendation')}\n")
    
    return "\n".join(sections) if sections else "No profile data available."


def _format_ideas_section(idea_list: List[Dict[str, Any]], industry_data: Dict[str, Any], realism_level: int = 3) -> str:
    """Format ideas list into markdown section, adjusted for realism level."""
    if not idea_list:
        return "No ideas generated."
    
    sections = []
    # Adjust header based on realism level
    if realism_level <= 2:
        sections.append("## Your Personalized Ideas 🚀\n\n")
    elif realism_level >= 4:
        sections.append("## Strategic Startup Recommendations\n\n")
    else:
        sections.append("## Recommended Ideas\n\n")
    
    for idx, idea in enumerate(idea_list, 1):
        idea_index = idea.get("index", idx)
        sections.append(f"### IDEA_{idea_index}\n")
        
        # If structured idea, format in expected field:value format
        if idea.get("title"):
            sections.append(f"title: {idea.get('title', '')}\n")
        if idea.get("summary"):
            sections.append(f"summary: {idea.get('summary', '')}\n")
        if idea.get("target_market"):
            sections.append(f"target_market: {idea.get('target_market', '')}\n")
        if idea.get("revenue_model"):
            sections.append(f"revenue_model: {idea.get('revenue_model', '')}\n")
        if idea.get("validation_score"):
            sections.append(f"validation_score: {idea.get('validation_score', '')}\n")
        if idea.get("timeline"):
            sections.append(f"timeline: {idea.get('timeline', '')}\n")
        if idea.get("why_this_fits"):
            sections.append(f"why_this_fits: {idea.get('why_this_fits', '')}\n")
        
        sections.append("\n")
        
        # Add details markdown if available (for full report view)
        if idea.get("details_markdown"):
            sections.append(f"{idea.get('details_markdown')}\n\n")
        elif not idea.get("title"):
            # Fallback to old format for backward compatibility
            # Fallback to old format for backward compatibility
            if idea.get("problem"):
                sections.append(f"**Problem:** {idea.get('problem')}\n\n")
            
            if idea.get("solution"):
                sections.append(f"**Solution:** {idea.get('solution')}\n\n")
            
            if idea.get("delivery_mode"):
                sections.append(f"**Delivery Mode:** {idea.get('delivery_mode')}\n\n")
            
            if idea.get("revenue_pattern"):
                sections.append(f"**Revenue Pattern:** {idea.get('revenue_pattern')}\n\n")
            
            if idea.get("automation_pattern"):
                sections.append(f"**Automation Pattern:** {idea.get('automation_pattern')}\n\n")
            
            if idea.get("archetypes"):
                archetype_labels = []
                archetypes_list = industry_data.get("archetypes", [])
                for arch_id in idea.get("archetypes", []):
                    for arch in archetypes_list:
                        if arch.get("id") == arch_id:
                            archetype_labels.append(arch.get("label", arch_id))
                            break
                    else:
                        archetype_labels.append(arch_id)
                
                if archetype_labels:
                    sections.append(f"**Business Archetype:** {', '.join(archetype_labels)}\n\n")
            
            if idea.get("weight"):
                sections.append(f"*Relevance Score: {idea.get('weight')}/5 ({idea.get('priority', 'medium')} priority)*\n\n")
        
        sections.append("---\n\n")
    
    return "".join(sections)


def _format_industry_context(industry_data: Dict[str, Any], realism_level: int = 3) -> str:
    """Format industry context information, adjusted for realism level."""
    sections = []
    
    # Value propositions (simplified for lower realism)
    value_props = industry_data.get("value_props", {})
    if value_props and realism_level >= 2:
        if realism_level <= 2:
            sections.append("### Why This Industry Works\n\n")
        else:
            sections.append("### Value Propositions\n\n")
        for key, values in value_props.items():
            if isinstance(values, list):
                sections.append(f"**{key.replace('_', ' ').title()}:**\n")
                for value in values:
                    sections.append(f"- {value}\n")
                sections.append("\n")
        sections.append("\n")
    
    # Skill tags (only for higher realism)
    skill_tags = industry_data.get("skill_tags", {})
    if skill_tags and realism_level >= 3:
        sections.append("### Relevant Skills\n\n")
        for key, values in skill_tags.items():
            if isinstance(values, list):
                sections.append(f"**{key.replace('_', ' ').title()}:**\n")
                for value in values:
                    sections.append(f"- {value}\n")
                sections.append("\n")
        sections.append("\n")
    
    # Budget bins (simplified for lower realism)
    budget_bins = industry_data.get("budget_bins", {})
    if budget_bins:
        if realism_level <= 2:
            sections.append("### Budget Tips\n\n")
        else:
            sections.append("### Budget Considerations\n\n")
        for key, value in budget_bins.items():
            sections.append(f"**{key.title()}:** {value}\n\n")
    
    # Constraints (only for higher realism)
    constraints = industry_data.get("constraints_map", {})
    if constraints and realism_level >= 4:
        sections.append("### Industry Constraints & Considerations\n\n")
        for key, value in constraints.items():
            sections.append(f"**{key.title()}:** {value}\n\n")
    
    return "".join(sections)


def _format_list(items: List[str]) -> str:
    """Format a list of strings as markdown list."""
    if not items:
        return "None specified."
    
    return "\n".join(f"- {item}" for item in items)

