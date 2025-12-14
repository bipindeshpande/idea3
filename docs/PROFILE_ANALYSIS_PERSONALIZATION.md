# Profile Analysis Personalization Engine

## Overview
This document describes the personalization logic for the Profile Analysis feature. Each section (1-6) uses specific user variables to create highly personalized content.

## Section Personalization Rules

### 1. Core Motivations
**Variables Used:**
- `experience_level` - Inferred from experience_summary
- `goal_timeline` - From earnings_timeline or founder_ambition
- `idea_type` - From business_type or startup_style

**Logic:**
- Connect why the user wants to start NOW based on their experience level
- Reference their specific goal timeline (earnings_timeline)
- Tie motivations to their preferred idea/business type
- No generic statements - every sentence must reference one of these variables

### 2. Operating Constraints
**Variables Used:**
- `time_commitment` - Direct from inputs
- `budget` - From budget_range
- `risk_tolerance` - Direct from inputs
- `biggest_constraint` - Inferred from the most limiting factor

**Logic:**
- Explicitly state how time_commitment limits options
- Quantify budget constraints and their implications
- Explain how risk_tolerance shapes decision-making
- Identify the biggest_constraint and its cascading effects
- Include hidden constraints implied by combinations of these variables

### 3. Strengths & Capabilities
**Variables Used:**
- `technical_strength` - Extracted from skills (coding, AI, automation, etc.)
- `business_strength` - Extracted from skills (sales, marketing, operations, etc.)
- `industry_background` - From industry_interest
- `preferred_work_style` - Direct from inputs

**Logic:**
- List specific technical capabilities from skills
- List specific business capabilities from skills
- Connect industry_background to relevant experience
- Explain how preferred_work_style enables certain approaches
- Ground everything in actual skills/interests, not assumptions

### 4. Strategic Considerations
**Variables Used:**
- `market_readiness` - Inferred from experience_summary, time_commitment, budget
- `idea_type` - From business_type or startup_style
- `risk_tolerance` - Direct from inputs

**Logic:**
- Assess market_readiness based on experience and resources
- Consider how idea_type affects market entry strategy
- Factor in risk_tolerance for strategic decisions
- Use cause-and-effect reasoning, not generic advice
- Connect strategic implications directly to user's specific situation

### 5. Viability Red Flags
**Variables Used:**
- `technical_strength` - From skills
- `business_strength` - From skills
- `time_commitment` - Direct from inputs
- `budget` - From budget_range
- `risk_tolerance` - Direct from inputs

**Logic:**
- Include ONLY red flags that directly apply to this user
- If technical_strength is weak, flag technical requirements
- If business_strength is weak, flag business/marketing needs
- If time_commitment is limited, flag time-intensive ideas
- If budget is low, flag capital-intensive ideas
- If risk_tolerance is low, flag high-risk approaches
- Skip red flags that don't apply to this user's profile

### 6. Pathway Recommendations
**Variables Used:**
- `goal_timeline` - From earnings_timeline or founder_ambition
- `time_commitment` - Direct from inputs
- `budget` - From budget_range
- `idea_type` - From business_type or startup_style

**Logic:**
- Create a customized execution plan that respects goal_timeline
- Design phases that fit within time_commitment
- Suggest budget-appropriate steps
- Align pathway with idea_type preferences
- Provide specific, actionable steps tailored to these constraints

## Implementation Notes

- All variables must be extracted/inferred from intake form inputs
- If a variable isn't available or relevant, skip it (don't use generic fallbacks)
- Every sentence must explicitly connect to at least one user variable
- Output must feel uniquely written for this specific user
- No generic sentences or boilerplate text

