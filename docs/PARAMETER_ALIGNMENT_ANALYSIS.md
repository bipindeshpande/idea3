# Parameter Alignment Analysis: Discovery vs Validation

## Executive Summary

The **Discovery** and **Validation** endpoints use **intentionally different parameter schemas** because they serve **fundamentally different use cases**:

- **Discovery**: Helps users **find new ideas** based on their situation, preferences, and capabilities
- **Validation**: Evaluates an **existing idea** that the user already has

This design is **correct and intentional** - the parameters differ because:
1. Discovery needs **user context** (who they are, what they can do) → generates ideas
2. Validation needs **idea context** (what the idea is, how it works) → evaluates viability

The different schemas are **by design**, not a misalignment.

---

## Discovery Parameters (`/discovery`)

**Purpose**: Generate startup ideas based on user profile and preferences

**Request Model**: `RunRequest` (backend_v2/app/api/models/discovery_models.py)

### Parameters:

#### About the USER (Screen 1):
- `startup_category` - "tech", "non_tech", or "both"
- `time_commitment` - "< 5 hrs/week", "5–10 hrs/week", "10–20 hrs/week", "Full-time"
- `budget_range` - "Free / Sweat-equity only", "< $1 K", "Up to $5 K", etc.
- `risk_tolerance` - User's risk preference
- `preferred_work_style` - How user prefers to work
- `startup_style` - Type of startup approach
- `skills` - Dict with technical, creative, etc. skills
- `customer_interaction` - How user wants to interact with customers
- `location_context` - Location preferences
- `business_region` - Target business region

#### About Goals & Interests (Screen 2):
- `industry_interest` - Industry preference
- `sub_interest_area` - Sub-industry preference
- `business_type` - Type of business
- `earnings_timeline` - When user wants to earn
- `founder_ambition` - User's ambition level
- `experience_summary` - User's experience

**Focus**: **USER-CENTRIC** - "Tell me about YOU so I can recommend ideas"

---

## Validation Parameters (`/validate-idea`)

**Purpose**: Evaluate and score a specific startup idea

**Request Model**: `ValidateIdeaRequest` (backend_v2/app/api/routes/validation.py)

### Parameters:

#### About the IDEA (Screen 1 - "About Your Idea"):
- `category_answers.industry` - What industry the IDEA belongs to
- `category_answers.geography` - Which region the IDEA targets
- `category_answers.stage` - What stage the IDEA is in ("Raw Idea", "Early Research", "Prototype", etc.)
- `category_answers.commitment` - How serious about THIS IDEA ("Side Hustle", "Lifestyle Business", etc.)

#### About How the IDEA Works (Screen 2):
- `category_answers.problem_category` - What problem the IDEA solves
- `category_answers.solution_type` - How the IDEA solves it
- `category_answers.user_type` - Who uses THIS IDEA
- `category_answers.revenue_model` - How THIS IDEA makes money
- `category_answers.unique_moat` - What makes THIS IDEA unique
- `category_answers.business_archetype` - Type of business THIS IDEA is

#### Optional Fields:
- `category_answers.initial_budget` - Budget for THIS IDEA
- `category_answers.delivery_channel` - How customers interact with THIS IDEA
- `category_answers.constraints` - Constraints for THIS IDEA
- `category_answers.competitors` - Competitors for THIS IDEA

#### Additional:
- `idea_explanation` - **Required** text description of the idea
- `idea_id` - Optional: for validating recommendation ideas
- `idea_metadata` - Optional: idea title, summary, etc.
- `include_next_steps` - Optional: whether to generate next_steps

**Focus**: **IDEA-CENTRIC** - "Tell me about YOUR IDEA so I can evaluate it"

---

## Key Design Differences (Intentional)

### 1. **Different Use Cases (By Design)**
- **Discovery**: "Who are you? What's your situation? → Here are ideas that match you"
- **Validation**: "What is your idea? → Here's how viable it is"

These are **complementary but distinct** workflows:
- User starts with Discovery when they **don't have an idea yet**
- User uses Validation when they **already have an idea** to evaluate

### 2. **Overlapping But Conceptually Different Fields**

These fields appear similar but serve different purposes:

| Discovery Field | Validation Field | Why They're Different |
|----------------|------------------|----------------------|
| `budget_range` | `category_answers.initial_budget` | Discovery: user's available budget. Validation: budget needed for THIS specific idea |
| `customer_interaction` | `category_answers.delivery_channel` | Discovery: how user wants to interact. Validation: how THIS idea's customers interact |
| `industry_interest` | `category_answers.industry` | Discovery: user's preference. Validation: idea's actual industry |
| `time_commitment` | `category_answers.commitment` | Discovery: user's available time. Validation: seriousness about THIS specific idea |

**These differences are intentional** - a user might have $10k available (Discovery) but their idea might need $50k (Validation).

### 3. **Different Information Requirements (By Design)**
- Discovery doesn't ask about **idea-specific** details because the user doesn't have an idea yet
- Validation doesn't ask about **user profile** details because it's evaluating the idea, not the user

This separation is **correct** - each endpoint only asks for what it needs.

### 4. **Field Name Inconsistencies**
- Discovery uses snake_case: `time_commitment`, `budget_range`, `risk_tolerance`
- Validation uses snake_case in `category_answers` dict: `initial_budget`, `delivery_channel`
- But validation wraps everything in `category_answers` dict, while discovery uses flat structure

### 5. **Different Data Structures**
- **Discovery**: Flat structure with optional fields
  ```python
  {
    "startup_category": "tech",
    "time_commitment": "Full-time",
    "budget_range": "Up to $10 K",
    ...
  }
  ```

- **Validation**: Nested structure with `category_answers` dict
  ```python
  {
    "category_answers": {
      "industry": "SaaS / Software",
      "geography": "US",
      "stage": "Raw Idea",
      ...
    },
    "idea_explanation": "My idea is..."
  }
  ```

### 6. **Authentication Requirements**
- **Discovery**: Requires authentication (`get_current_user`)
- **Validation**: Optional authentication (`get_current_user_or_none`)

---

## Examples of Intentional Design Differences

### Example 1: Budget Field
**Discovery**: `budget_range` = "Up to $10 K" (user's available budget)
**Validation**: `category_answers.initial_budget` = "$1k–$10k" (budget needed for THIS idea)

**Why different**: A user might have $10k available (Discovery) but their idea might need $50k (Validation). These are different questions with different answers.

### Example 2: Industry Field
**Discovery**: `industry_interest` = "Food & Beverage" (user is interested in this industry)
**Validation**: `category_answers.industry` = "Food & Beverage" (the idea IS in this industry)

**Why different**: Discovery asks "What interests you?" (preference), Validation asks "What industry is your idea in?" (fact).

### Example 3: Commitment/Time
**Discovery**: `time_commitment` = "10–20 hrs/week" (user's available time)
**Validation**: `category_answers.commitment` = "Side Hustle" (seriousness about THIS idea)

**Why different**: A user might have 20 hrs/week available (Discovery) but be fully committed to their idea (Validation). These measure different things.

---

## Potential Enhancements (Optional)

While the current design is correct, here are optional improvements that could enhance the user experience:

### Option 1: Keep Separate (Current State - Recommended)
**Pros**: 
- Clear separation of concerns
- Each endpoint optimized for its specific purpose
- No confusion about what data is needed when

**Cons**: 
- Users must re-enter some similar information if they validate a recommended idea

**Verdict**: ✅ **This is the correct approach** - the use cases are different, so the parameters should be different.

### Option 2: Add Optional Cross-Reference (Enhancement)
When a user validates an idea that came from Discovery, optionally pass `user_profile` to Validation:
- Could help Validation provide more personalized feedback
- Could pre-fill some fields (e.g., if user said they have $10k budget, suggest ideas that fit that budget)

### Option 3: Create Mapping Utility (Enhancement)
Create a utility to help pre-fill Validation form when validating a Discovery-recommended idea:
- Map `industry_interest` → `category_answers.industry`
- Map `budget_range` → `category_answers.initial_budget` (as a suggestion)
- This is a UX enhancement, not a requirement

---

## Conclusion

The parameter differences are **intentional and correct**:

✅ **Discovery** = User situation → Idea recommendations  
✅ **Validation** = Idea details → Viability assessment

These are **complementary workflows** for different stages of the startup journey:
1. **Discovery**: "I don't have an idea yet, help me find one"
2. **Validation**: "I have an idea, tell me if it's viable"

The different schemas reflect these different use cases. This is **good design**, not a problem to fix.

### Optional Future Enhancements:
- Consider adding optional `user_profile` to Validation for more personalized feedback
- Create mapping utilities to pre-fill Validation when validating Discovery-recommended ideas
- Document the relationship between the two flows for developers

But the **core design is correct** - keep the parameters separate because the use cases are different.

