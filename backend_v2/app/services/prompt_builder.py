"""
PromptBuilder – Constructs all LLM prompts used in the Discovery pipeline.

This class builds:
1. Stage 1 prompt  – Profile Analysis
2. Stage 2 prompt  – Idea Research + Recommendations
"""

from typing import Dict, Any


class PromptBuilder:
    """
    Builds structured prompts for the two-stage Discovery pipeline.
    """

    # ----------------------------------------------------------------------
    # STAGE 1 – PROFILE ANALYSIS PROMPT
    # ----------------------------------------------------------------------
    @staticmethod
    def build_profile_analysis_prompt(profile: Dict[str, Any]) -> str:
        """
        Build the Stage 1 prompt used for Profile Analysis.
        The output must be full JSON with Core Motivation, Constraints,
        Strengths, and Skill Gaps exactly as your frontend expects.
        """

        return f"""
You are a startup advisor. Analyze the user's profile and generate a concise, structured profile analysis.

CRITICAL INSTRUCTIONS:
- Write in second-person ("You")
- Use markdown headings (##)
- Produce ALL 4 required sections
- Each section must contain substantial content
- Total length: 400–500 words

USER PROFILE:
- Goal Type: {profile.get("goal_type")}
- Time Commitment: {profile.get("time_commitment")}
- Budget Range: {profile.get("budget_range")}
- Interest Area: {profile.get("interest_area")}
- Sub-Interest Focus: {profile.get("sub_interest_area")}
- Work Style: {profile.get("work_style")}
- Skill Strength: {profile.get("skill_strength")}
- Experience Summary: {profile.get("experience_summary")}

REQUIRED OUTPUT FORMAT:

## 1. Core Motivation
(3–4 sentences explaining the deeper motivation behind the user’s goals)

## 2. Constraints
(5–7 bullet points for time, budget, work style, and practical limitations)

## 3. Strengths
(5–7 bullet points mapping skills + experience to startup advantages)

## 4. Skill Gaps
(5–7 bullet points explaining capability gaps and why they matter)
"""


    # ----------------------------------------------------------------------
    # STAGE 2 – IDEA RESEARCH + RECOMMENDATIONS PROMPT
    # ----------------------------------------------------------------------
    @staticmethod
    def build_idea_research_prompt(
        profile_analysis: str,
        tool_results: Dict[str, Any]
    ) -> str:
        """
        Build the Stage 2 prompt using:
        - Stage 1 output (profile_analysis)
        - static + dynamic tools (tool_results)

        tool_results may contain:
            market_trends
            market_size
            risks
            competitors
            costs
            revenue
            viability
            persona
            validation_questions
        """

        # Flatten tools for embedding into the prompt
        def safe(v): return v if v else "Not available"

        return f"""
You are a startup advisor. Generate full idea research and personalized recommendations.

===== USER PROFILE ANALYSIS (FROM STAGE 1) =====
{profile_analysis}

===== RESEARCH DATA (STATIC + DYNAMIC TOOLS) =====
Market Trends:
{safe(tool_results.get("market_trends"))}

Competitors:
{safe(tool_results.get("competitors"))}

Market Size:
{safe(tool_results.get("market_size"))}

Risks:
{safe(tool_results.get("risks"))}

Startup Costs:
{safe(tool_results.get("costs"))}

Revenue Projections:
{safe(tool_results.get("revenue"))}

Financial Viability:
{safe(tool_results.get("viability"))}

Customer Persona:
{safe(tool_results.get("persona"))}

Validation Questions:
{safe(tool_results.get("validation_questions"))}

===== REQUIRED OUTPUT =====

## SECTION 1: IDEA RESEARCH REPORT
### Idea Research Report
- Begin with 3–4 sentence executive summary
- Provide at least 5 startup ideas
- For each idea:
  - Concept
  - Target Market
  - Revenue Model
  - Resources Needed
  - Timeline
  - Competitive Landscape
  - Market Size Interpretation
  - Validation Score
  - Risks
  - Suggested Experiments

### Validation Backlog
A bullet list of experiments, research actions, and validation priorities.

---

## SECTION 2: PERSONALIZED RECOMMENDATIONS
### Comprehensive Recommendation Report

### Profile Fit Summary
5 bullet points on why the top ideas align with the user’s motivations, constraints, and strengths.

### Recommendation Matrix
A table with columns:
Idea | Fit Score | Effort Required | Time to Market | Revenue Potential

### Top 3 Ideas Deep Dive
For each:
- Idea Name
- Why This Fits (2–3 sentences)
- What You’ll Build (2–3 sentences)
- Revenue Model (1–2 sentences)
- Resources Needed (3–5 bullet points)
- Timeline (1–2 sentences)

### Financial Outlook
2–3 paragraphs about startup cost, revenue trajectory, breakeven, and funding needs.

### Risk Radar
4–6 risks with:
Risk Name | Likelihood | Impact | Mitigation Strategy

### Customer Persona
2–3 paragraphs using the persona + Stage 1 profile.

### Validation Questions
5–7 questions the user must answer before committing.

### 30/60/90 Day Roadmap
For Top Idea:
- 30 Days: 3–5 concrete tasks
- 60 Days: 3–5 tasks
- 90 Days: 3–5 tasks

### Decision Checklist
5–7 yes/no questions determining readiness.

CRITICAL:
- Follow structure exactly.
- Do NOT skip sections.
- Write in second-person.
"""


# End of PromptBuilder
