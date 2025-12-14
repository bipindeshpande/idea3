# Profile Analysis System Upgrade

## Overview
Comprehensive upgrade to the Profile Analysis system to produce deeply personalized, cross-referenced, premium advisor-style reports with improved UI, tone, and structured reasoning.

## Backend Enhancements

### 1. Enhanced Variable Extraction (`_extract_user_variables()`)

Added 5 new inferred variables:

- **`estimated_skill_seniority`**: `"junior" | "mid" | "senior"`
  - Inference: Analyzes experience_summary for years and keywords
  - >10 years or senior keywords → "senior"
  - >5 years → "mid"
  - Junior/entry keywords → "junior"

- **`industry_fit_score`**: `0-10` score
  - Calculates match between industry_background and idea_type
  - Keyword matching for tech, business, ecommerce domains
  - High match (8), medium match (7), low match (4)

- **`monetization_preference`**: `"subscription" | "one-time" | "services" | "ads" | "not-specified"`
  - Inferred from business_type keywords
  - SaaS/software → "subscription"
  - Service/consulting → "services"
  - Product/physical → "one-time"
  - Content/media → "ads"

- **`timeline_urgency_score`**: `0-10` score
  - Based on earnings_timeline keywords
  - "immediately/ASAP" → 9
  - "3 months" → 8
  - "6 months" → 7
  - "1 year" → 6
  - Adjusted upward if low budget + low time but wants fast results

- **`entrepreneurial_risk_profile`**: `"conservative" | "moderate" | "aggressive"`
  - Directly mapped from risk_tolerance
  - "low/conservative" → "conservative"
  - "high/aggressive" → "aggressive"
  - Default: "moderate"

### 2. Cross-Section Variable Injection

- User Variables dictionary (JSON) is now injected at the top of both user prompt and system prompt
- Ensures LLM has full context of all inferred variables

### 3. Enhanced Prompt Builder

#### Cross-Referencing Requirements
Each section now includes explicit cross-referencing instructions:
- **Section 2** (Operating Constraints): References Section 1 motivations
- **Section 3** (Strengths): References Section 2 constraints
- **Section 4** (Strategic): References Section 3 gaps
- **Section 5** (Red Flags): Used by Section 6
- **Section 6** (Pathway): References Section 5 red flags and Section 1 motivations

#### Section-Specific Variable Mapping

1. **Core Motivations**: `experience_level`, `goal_timeline`, `idea_type`, `timeline_urgency_score`
2. **Operating Constraints**: `time_commitment`, `budget`, `risk_tolerance`, `entrepreneurial_risk_profile`, `biggest_constraint`
3. **Strengths & Capabilities**: `technical_strength`, `business_strength`, `industry_background`, `estimated_skill_seniority`
4. **Strategic Considerations**: `market_readiness`, `industry_fit_score`, `risk_tolerance`, `experience_level`
5. **Viability Red Flags**: `technical_strength`, `business_strength`, `time_commitment`, `budget`, `entrepreneurial_risk_profile`, `industry_fit_score`
6. **Pathway Recommendations**: `timeline_urgency_score`, `time_commitment`, `budget`, `idea_type`

#### Tone Requirements (Global)

- Advisor-like: confident, direct, analytical, non-generic
- No filler lines like "in summary" or "in conclusion"
- Every sentence must reference user's actual variables
- Dense personalization: connect multiple variables in single sentences
- Cross-reference other sections when relevant

## Frontend Enhancements

### 1. Typography & Spacing

- Updated to: `className="text-[15px] leading-relaxed text-gray-700"`
- Card headers: `className="text-lg font-semibold text-gray-900 flex items-center gap-2"`
- Increased section padding: `className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7"`

### 2. Dynamic Icons Per Section

| Section | Icon |
|---------|------|
| Core Motivations | 🎯 |
| Operating Constraints | 📋 |
| Strengths & Capabilities | 💪 |
| Strategic Considerations | 🧭 |
| Viability Red Flags | ⚠️ |
| Pathway Recommendation | 🚀 |

### 3. Color Coding with Opacity

Background colors with `opacity-10` for subtle, professional look:

- **Core Motivations**: `bg-indigo-50` (opacity-10)
- **Operating Constraints**: `bg-blue-50` (opacity-10)
- **Strengths & Capabilities**: `bg-purple-50` (opacity-10)
- **Strategic Considerations**: `bg-sky-50` (opacity-10)
- **Viability Red Flags**: `bg-amber-50` (opacity-10)
- **Pathway Recommendation**: `bg-green-50` (opacity-10)

### 4. Mobile Responsiveness

- Added `className="flex flex-col gap-2 w-full"` to section containers
- Responsive padding: `p-6 md:p-7`
- Proper dark mode support maintained

## Testing Scenarios

Test with these profiles to verify personalization:

1. **Low budget + High ambition**
   - Expected: Different red flags (budget constraints), pathway respects urgency

2. **High budget + Low experience**
   - Expected: Different recommendations (learning curve), different red flags

3. **Strong technical but weak business**
   - Expected: Strengths highlight technical, red flags mention business gaps

4. **Weak technical but strong execution**
   - Expected: Strengths highlight execution, red flags mention technical needs

5. **Low time commitment**
   - Expected: Pathway phases fit within time constraints, red flags for time-intensive ideas

## Expected Improvements

✅ Different red flags based on actual user constraints
✅ Different recommendations aligned with urgency and constraints
✅ Cross-section references (e.g., "Despite ambitions in Section 1...")
✅ Personalized tone with variable references in every sentence
✅ Dense personalization (multiple variables per sentence)
✅ Premium advisor consultation feel

## Backward Compatibility

- All existing profile analysis outputs continue to work
- Frontend gracefully handles both old and new formats
- No breaking changes to API contracts

