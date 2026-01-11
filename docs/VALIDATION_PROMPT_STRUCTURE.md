# Validation Prompt Structure

This document shows the complete prompt structure for validation analysis, with brackets `[BRACKETS]` indicating where user inputs and dynamic content are inserted.

---

## 1. GROUP ANALYSIS PROMPT
(Returned by `ValidationPromptBuilder.build_group_analysis_prompt()`)

This prompt is used to analyze startup ideas across validation parameter groups. It's called in parallel for each parameter group.

### Prompt Structure:

```
Analyze this startup idea across these [NUMBER_OF_PARAMETERS] related parameters: [PARAMETER_NAMES]
Context: [GROUP_CONTEXT]

**Idea Description:**
[idea_explanation]

**Business Details:**
Industry: [category_answers.industry or 'Not specified']
Stage: [category_answers.stage or 'Not specified']
Geography: [category_answers.geography or 'Not specified']
Business Type: [category_answers.business_archetype or category_answers.business_type or 'Not specified']
Revenue Model: [category_answers.revenue_model or 'Not specified']
Problem Category: [category_answers.problem_category or 'Not specified']
Solution Type: [category_answers.solution_type or 'Not specified']
User Type: [category_answers.user_type or 'Not specified']

**Your Task:**
For each parameter, provide:
1. A score from 1-10 (be realistic and critical, where 1-3 = weak, 4-6 = fair, 7-8 = strong, 9-10 = excellent)
2. A detailed 2-3 sentence analysis explaining the score, focusing on strengths and concerns

Parameters to analyze:
- [PARAMETER_NAME_1] ([param_key_1])
- [PARAMETER_NAME_2] ([param_key_2])
- [PARAMETER_NAME_N] ([param_key_n])

Return a JSON object with 'scores' and 'details' objects containing entries for each parameter.
Be critical but fair in your assessment. Base scores on the idea's actual potential, not just optimism.
```

### Dynamic Inputs Explained:

#### From `group` dictionary:
- `[NUMBER_OF_PARAMETERS]`: Number of parameters in this group (e.g., 3, 4)
- `[PARAMETER_NAMES]`: Comma-separated list of parameter display names (e.g., "Market Opportunity, Target Audience Clarity, Go-to-Market Strategy")
- `[GROUP_CONTEXT]`: Context description for the parameter group (e.g., "Market viability and audience analysis")
- `[PARAMETER_NAME_1]`, `[PARAMETER_NAME_2]`, etc.: Display names for each parameter (e.g., "Market Opportunity", "Problem-Solution Fit")
- `[param_key_1]`, `[param_key_2]`, etc.: Parameter keys (e.g., "market_opportunity", "problem_solution_fit")

#### From `category_answers` dictionary:
- `[category_answers.industry]`: Industry selection (e.g., "Food & Beverage", "AI & Automation")
- `[category_answers.stage]`: Business stage (e.g., "Idea", "Early validation", "MVP")
- `[category_answers.geography]`: Geographic market (e.g., "United States / Canada", "Global / Online")
- `[category_answers.business_archetype]` or `[category_answers.business_type]`: Business type (e.g., "Service", "Product", "Marketplace")
- `[category_answers.revenue_model]`: Revenue model (e.g., "Subscription", "One-time purchase", "Commission")
- `[category_answers.problem_category]`: Problem category classification
- `[category_answers.solution_type]`: Solution type classification
- `[category_answers.user_type]`: Target user type (e.g., "B2C", "B2B", "B2B2C")

#### From function parameter:
- `[idea_explanation]`: Full text description of the startup idea (user-provided explanation)

### Parameter Groups:

The validation system uses 3 parameter groups, each analyzed in parallel:

**Group 1: Market**
- Parameters: market_opportunity, target_audience_clarity, go_to_market_strategy
- Context: "Market viability and audience analysis"

**Group 2: Product**
- Parameters: problem_solution_fit, competitive_landscape, technical_feasibility, scalability_potential
- Context: "Product-market fit and technical viability"

**Group 3: Execution**
- Parameters: business_model_viability, financial_sustainability, risk_assessment
- Context: "Execution feasibility and sustainability"

### Expected Output Format:

The LLM is called with a JSON schema that expects this structure:

```json
{
  "scores": {
    "[param_key_1]": <number 1-10>,
    "[param_key_2]": <number 1-10>,
    ...
  },
  "details": {
    "[param_key_1]": "<2-3 sentence analysis>",
    "[param_key_2]": "<2-3 sentence analysis>",
    ...
  }
}
```

### Example with Real Values:

```
Analyze this startup idea across these 3 related parameters: Market Opportunity, Target Audience Clarity, Go-to-Market Strategy
Context: Market viability and audience analysis

**Idea Description:**
A personalized meal prep service that delivers healthy, pre-portioned meals to busy professionals in urban areas. The service uses local ingredients and offers customizable meal plans based on dietary preferences and fitness goals.

**Business Details:**
Industry: Food & Beverage
Stage: Idea
Geography: United States / Canada
Business Type: Service
Revenue Model: Subscription
Problem Category: Convenience
Solution Type: Service delivery
User Type: B2C

**Your Task:**
For each parameter, provide:
1. A score from 1-10 (be realistic and critical, where 1-3 = weak, 4-6 = fair, 7-8 = strong, 9-10 = excellent)
2. A detailed 2-3 sentence analysis explaining the score, focusing on strengths and concerns

Parameters to analyze:
- Market Opportunity (market_opportunity)
- Target Audience Clarity (target_audience_clarity)
- Go-to-Market Strategy (go_to_market_strategy)

Return a JSON object with 'scores' and 'details' objects containing entries for each parameter.
Be critical but fair in your assessment. Base scores on the idea's actual potential, not just optimism.
```

---

## 2. NEXT STEPS PROMPT
(Returned by `ValidationPromptBuilder.build_next_steps_prompt()`)

This prompt generates personalized, actionable next steps based on validation results.

### SYSTEM PROMPT:
```
You are an expert startup advisor helping entrepreneurs move forward with their startup ideas.
Generate actionable, personalized next steps based on the user's profile, idea, validation results, and constraints.
Be specific, practical, and organized into clear timeframes.
```

### USER PROMPT Structure:

```
Generate personalized, actionable next steps for this startup idea.

**Your Response Must Include:**
1. **30-Day Actions**: Immediate, quick-win steps to start validation
2. **60-Day Actions**: Medium-term development and testing steps
3. **90-Day Actions**: Longer-term scaling and growth steps
4. **Skill Gaps & Resources**: Identify missing skills and where to acquire them
5. **Quick Wins**: Fast, low-effort actions to build momentum
6. **Early Customer Testing Steps**: Specific ways to test with real customers

Format your response as clear markdown with numbered/bulleted lists.

**Idea Details:**
Idea: [idea_details.explanation]
Business Type: [idea_details.category_answers.business_archetype or idea_details.category_answers.business_type or 'Not specified']
Delivery Channel: [idea_details.category_answers.delivery_channel or 'Not specified']

**Validation Results:**
Overall Score: [validation_results.overall_score]/10
Parameter Scores:
- [PARAMETER_NAME_1]: [validation_results.scores.param_key_1]/10
- [PARAMETER_NAME_2]: [validation_results.scores.param_key_2]/10
- [PARAMETER_NAME_N]: [validation_results.scores.param_key_n]/10
Analysis: [validation_results.recommendations - first 500 chars]...

**User Profile:**
[USER_PROFILE_CONTENT]
- [profile_key_1]: [profile_value_1]
- [profile_key_2]: [profile_value_2]
- [profile_key_n]: [profile_value_n]

**User Constraints & Resources:**
Budget: [user_constraints.budget_range]
Time Commitment: [user_constraints.time_commitment]
Risk Tolerance: [user_constraints.risk_tolerance]
Existing Skills: [user_constraints.skills - formatted as comma-separated list]

**Instructions:**
- Make recommendations specific to THIS idea and THIS user
- Consider their constraints (budget, time, skills)
- Prioritize validation and customer testing early
- Be practical and actionable
- Use markdown formatting with headers and lists
```

### Dynamic Inputs Explained:

#### From `idea_details` dictionary:
- `[idea_details.explanation]`: The startup idea explanation/description
- `[idea_details.category_answers.business_archetype]` or `[idea_details.category_answers.business_type]`: Business type
- `[idea_details.category_answers.delivery_channel]`: How the product/service is delivered

#### From `validation_results` dictionary:
- `[validation_results.overall_score]`: Overall validation score (0-10)
- `[validation_results.scores.param_key_1]`, etc.: Individual parameter scores (1-10)
- `[validation_results.recommendations]`: Summary recommendations (truncated to 500 chars)
- `[PARAMETER_NAME_1]`, etc.: Human-readable parameter names (e.g., "Market Opportunity")

#### From `user_profile` dictionary or string:
- If dict: Each key-value pair is formatted as `- [key_name]: [value]`
- If string: First 1000 characters are included directly
- Keys are formatted from snake_case to Title Case (e.g., "time_commitment" → "Time Commitment")

#### From `user_constraints` dictionary:
- `[user_constraints.budget_range]`: Budget range (e.g., "$5k-20k", "$20k-50k")
- `[user_constraints.time_commitment]`: Time commitment (e.g., "10-20 hrs/week", "Full-time")
- `[user_constraints.risk_tolerance]`: Risk tolerance level
- `[user_constraints.skills]`: Skills dictionary or list, formatted as comma-separated string
  - If dict: Extracts skills from all categories except "other"
  - If list: Joins directly

### Example with Real Values:

```
Generate personalized, actionable next steps for this startup idea.

**Your Response Must Include:**
1. **30-Day Actions**: Immediate, quick-win steps to start validation
2. **60-Day Actions**: Medium-term development and testing steps
3. **90-Day Actions**: Longer-term scaling and growth steps
4. **Skill Gaps & Resources**: Identify missing skills and where to acquire them
5. **Quick Wins**: Fast, low-effort actions to build momentum
6. **Early Customer Testing Steps**: Specific ways to test with real customers

Format your response as clear markdown with numbered/bulleted lists.

**Idea Details:**
Idea: A personalized meal prep service that delivers healthy, pre-portioned meals to busy professionals in urban areas.
Business Type: Service
Delivery Channel: Direct delivery

**Validation Results:**
Overall Score: 7.2/10
Parameter Scores:
- Market Opportunity: 8/10
- Target Audience Clarity: 7/10
- Go-to-Market Strategy: 6/10
- Problem-Solution Fit: 8/10
- Competitive Landscape: 7/10
- Technical Feasibility: 9/10
- Scalability Potential: 6/10
- Business Model Viability: 7/10
- Financial Sustainability: 7/10
- Risk Assessment: 6/10
Analysis: The idea shows strong market opportunity and problem-solution fit. The target audience is well-defined, and technical feasibility is high. However, go-to-market strategy needs refinement, and scalability concerns exist due to operational complexity. Competitive landscape is moderate with established players...

**User Profile:**
- Time Commitment: 10-20 hrs/week
- Budget Range: $5k-20k
- Work Style: Independent/Solo
- Startup Style: Home-based business

**User Constraints & Resources:**
Budget: $5k-20k
Time Commitment: 10-20 hrs/week
Risk Tolerance: Moderate
Existing Skills: Cooking / Food Prep, Marketing, Customer Service

**Instructions:**
- Make recommendations specific to THIS idea and THIS user
- Consider their constraints (budget, time, skills)
- Prioritize validation and customer testing early
- Be practical and actionable
- Use markdown formatting with headers and lists
```

---

## ✅ Fixed Issues

### 1. Duplication in Next Steps Prompt (FIXED)

**Problem**: There was potential for information duplication between the "User Profile" and "User Constraints & Resources" sections in the next steps prompt.

**Root Cause**: 
- The `user_profile` section was iterating through ALL key-value pairs in the `user_profile` dictionary
- The `user_constraints` section explicitly adds `budget_range`, `time_commitment`, `risk_tolerance`, and `skills`
- If the `user_profile` dict contained any of these fields, they would appear in both sections

**Solution Implemented**:
- Modified `build_next_steps_prompt()` to only display known profile analysis fields in the User Profile section:
  - `core_motivations`
  - `operating_constraints`
  - `strengths_and_capabilities`
  - `strategic_considerations`
  - `viability_red_flags`
  - `pathway_recommendation`
- Constraint-related fields (`budget_range`, `time_commitment`, `risk_tolerance`, `skills`, `preferred_work_style`, `startup_style`) are now only shown in the "User Constraints & Resources" section

**Result**: 
- Eliminates token waste
- Prevents LLM confusion from redundant information
- Keeps prompts focused and efficient

---

## Notes

1. **No System Prompt for Group Analysis**: The group analysis prompt is self-contained and doesn't use a separate system prompt. The LLM is called with structured output (JSON schema) only.

2. **System Prompt for Next Steps**: The next steps generation uses a dedicated system prompt (shown above) to set the advisor role and tone.

3. **Parallel Execution**: Group analysis prompts are executed in parallel for each parameter group (3 groups total), improving performance.

4. **Error Handling**: Both prompts have fallback mechanisms if LLM calls fail or timeout.

5. **Output Format**:
   - Group Analysis: JSON with `scores` and `details` objects
   - Next Steps: Markdown-formatted text with headers and lists

