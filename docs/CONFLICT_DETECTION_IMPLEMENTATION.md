# Conflict Detection & Soft Adjustment Implementation

## Overview

Implemented a soft conflict detection system that identifies uncommon or risky input combinations (e.g., non-technical + tech-heavy industries) and adjusts recommendations accordingly without blocking or erroring.

## Key Principles

✅ **Never block users** - All inputs are accepted
✅ **Never show errors** - Conflicts are signals, not mistakes
✅ **Always produce useful recommendations** - Adjust, don't reject
✅ **Transparent communication** - Explain adjustments friendly
✅ **Optional clarifications** - Never force changes

## Implementation

### Backend Components

#### 1. Conflict Detector (`backend_v2/app/services/conflict_detector.py`)

**Purpose:** Detects soft conflicts and provides adjustment guidance.

**Conflict Patterns Detected:**
- Non-technical + Tech-heavy industries
- Non-technical + Food with tech expectations
- Low budget + High-capital industries
- Part-time + Time-intensive industries
- Solo work + Team-required models
- Low risk tolerance + High-risk industries
- Remote preference + Location-dependent businesses

**Key Methods:**
- `detect_conflicts(inputs)` - Detects conflicts in user inputs
- `build_adjustment_instructions(conflicts, inputs)` - Creates prompt instructions
- `build_user_message(conflicts, inputs)` - Creates user-friendly message

**Example Conflict Detection:**
```python
# Detects: Non-technical + Food business
conflicts = ConflictDetector.detect_conflicts({
    "skill_strength": "non_technical",
    "industry_interest": "food_and_beverage"
})
# Returns adjustment guidance focusing on operations, branding, services
```

#### 2. Prompt Builder Integration (`backend_v2/app/services/prompt_builder.py`)

**Changes:**
- Added conflict detection import
- Integrated conflict instructions into recommendation prompt
- Instructions guide LLM to focus on appropriate areas and avoid mismatches

**Example Prompt Addition:**
```
RECOMMENDATION ADJUSTMENT GUIDANCE (IMPORTANT):
The user's inputs suggest some uncommon combinations. Adjust your recommendations accordingly:

- Focus on: operations, branding, services, marketplace, distribution
- Avoid: software_development, deep_tech, engineering

CRITICAL: Still generate valuable recommendations that fit their constraints.
Reframe ideas to work within their preferences - don't reject the combination.
```

#### 3. Discovery Service Integration (`backend_v2/app/services/discovery_service.py`)

**Changes:**
- Added conflict detection after results assembly
- Adds `conflict_adjustment` message to final outputs
- Message is included in results sent to frontend

**Code Flow:**
```python
# Detect conflicts
conflicts = ConflictDetector.detect_conflicts(inputs)
conflict_message = ConflictDetector.build_user_message(conflicts, inputs)

# Add to final outputs
if conflict_message:
    final_outputs["conflict_adjustment"] = conflict_message
```

### Frontend Components

#### Recommendations Report (`frontend/src/pages/discovery/RecommendationsReport.jsx`)

**Changes:**
- Extracts `conflict_adjustment` from results
- Displays friendly message above recommendations
- Shows optional clarification if provided

**UI Display:**
- Info box with indigo styling
- Lightbulb icon (💡)
- Main message in readable text
- Optional clarification in italic (if present)

**Example Display:**
```
💡 Based on your preference for non-technical work, we focused on Food & Beverage 
   ideas that rely more on operations, branding, and partnerships rather than 
   software development.
   
   If you're open to light tech (no coding required), you'll see more options.
```

## User Experience Flow

1. **User Submits Inputs**
   - User selects: Non-technical skills + Food & Beverage industry
   - System accepts all inputs (no blocking)

2. **Conflict Detection**
   - Backend detects soft conflict
   - Generates adjustment instructions for LLM
   - Creates user-friendly message

3. **Recommendation Generation**
   - LLM receives adjustment instructions
   - Generates ideas focusing on operations, branding, services
   - Avoids suggesting software development ideas

4. **Results Display**
   - Frontend shows friendly adjustment message
   - Recommendations reflect the adjustment
   - User understands why ideas are tailored this way
   - Optional clarification offers path to more options (if relevant)

## Example Messages

### Non-Technical + Food Business
**Message:** "Based on your preference for non-technical work, we focused on Food & Beverage ideas that rely more on operations, branding, and partnerships rather than software development."

**Optional Clarification:** "If you're open to light tech (no coding required), you'll see more options."

### Low Budget + Capital-Intensive Industry
**Message:** "Given your budget constraints, we focused on Manufacturing ideas that have lower startup costs and faster paths to revenue."

**Optional Clarification:** "If your budget increases, you'll see more capital-intensive options."

### Part-Time + Time-Intensive Industry
**Message:** "Based on your part-time commitment, we focused on Restaurant ideas that can be run with flexible hours and minimal daily operations."

**Optional Clarification:** "If you can commit more time, you'll see more hands-on options."

## Language Guidelines

✅ **Use:**
- "Based on your preferences..."
- "Given your [constraint]..."
- "To best match your goals..."
- "We focused on..."
- "You'll see more [X] if..."

❌ **Never Use:**
- "Conflicting inputs"
- "Error"
- "Invalid combination"
- "Can't process"
- "Please change"

## Technical Details

### Conflict Pattern Structure

Each pattern includes:
```python
{
    "conditions": {
        "field1": "value1",
        "field2": ["value2a", "value2b"]
    },
    "conflict_type": "skill_industry_mismatch",
    "adjustment": {
        "focus_areas": ["area1", "area2"],
        "avoid_areas": ["area3", "area4"],
        "message": "Template with {industry} placeholder",
        "optional_clarification": "Optional suggestion"
    }
}
```

### Normalization Logic

Inputs are normalized for pattern matching:
- Lowercase conversion
- Underscore/space normalization
- Partial matching for industry names
- Flexible matching for work styles

### Integration Points

1. **Prompt Generation** - Adjustments added to LLM prompt
2. **Result Assembly** - Messages added to final outputs
3. **Frontend Display** - Messages extracted and displayed
4. **Caching** - Messages included in cached results

## Testing Examples

### Test Case 1: Non-Technical + Food
**Inputs:**
- skill_strength: "non_technical"
- industry_interest: "food_and_beverage"
- startup_category: "tech"

**Expected:**
- Conflict detected: category_industry_mismatch
- Focus areas: operations, branding, services
- Avoid areas: food_tech, delivery_apps
- Message about focusing on operations/branding

### Test Case 2: Low Budget + Manufacturing
**Inputs:**
- budget_range: "$5k-20k"
- industry_interest: "manufacturing"

**Expected:**
- Conflict detected: budget_industry_mismatch
- Focus areas: services, consulting, marketplace
- Avoid areas: manufacturing, capital_intensive
- Message about lower startup costs

## Future Enhancements

1. **More Conflict Patterns** - Add additional uncommon combinations
2. **Severity Levels** - Track conflict severity (currently all "medium")
3. **Learning System** - Track which adjustments lead to better outcomes
4. **A/B Testing** - Test different message phrasings
5. **Analytics** - Track conflict frequency and user responses

## Files Modified

### Backend
- `backend_v2/app/services/conflict_detector.py` (NEW)
- `backend_v2/app/services/prompt_builder.py` (MODIFIED)
- `backend_v2/app/services/discovery_service.py` (MODIFIED)

### Frontend
- `frontend/src/pages/discovery/RecommendationsReport.jsx` (MODIFIED)

## Documentation
- This file: `docs/CONFLICT_DETECTION_IMPLEMENTATION.md`

