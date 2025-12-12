# Tech/Non-Tech Intake Bifurcation Changes

This folder contains all files modified or created for the tech/non-tech startup category bifurcation feature.

## Summary

This feature adds a clear separation between TECH and NON-TECH startups in the intake flow, with filtering for:
- Interest areas
- Subcategories
- Skills
- Generated ideas

## Files Changed

### Frontend Files (5 files)

#### New Files:
1. **`frontend/src/utils/startupCategoryConfig.js`**
   - Defines TECH vs NON-TECH categorization for interest areas, subcategories, and skills
   - Provides filtering functions: `filterInterestAreas()`, `filterSubcategories()`, `filterSkillCategories()`
   - All values are static/hardcoded - no API calls

#### Modified Files:
2. **`frontend/src/pages/discovery/IntakeScreen.jsx`**
   - Added `startup_category` field at the top (required)
   - Filters interest areas and subcategories based on selection
   - Filters skills based on selection
   - Clears invalid selections when category changes

3. **`frontend/src/pages/discovery/IntakeScreenTwo.jsx`**
   - Added `startup_category` field at the top (required)
   - Filters interest areas and subcategories based on selection
   - Clears invalid selections when category changes

4. **`frontend/src/pages/discovery/Home.jsx`**
   - Added `startup_category` to required fields validation

5. **`frontend/src/context/ReportsContext.jsx`**
   - Added `startup_category` to default inputs schema

### Backend Files (4 files)

#### New Files:
1. **`backend_v2/app/utils/startup_category_filter.py`**
   - Analyzes ideas to determine if they're tech or non-tech
   - Filters ideas based on `startup_category` after generation
   - Uses keyword matching on title, summary, target_market, revenue_model

#### Modified Files:
2. **`backend_v2/app/services/prompt_builder.py`**
   - Added `startup_category` to user inputs section
   - Added STARTUP CATEGORY RULE with explicit instructions:
     - `tech`: Only tech/software/AI/digital businesses
     - `non_tech`: Only physical/offline/service-based businesses
     - `both`: Any mix

3. **`backend_v2/app/services/discovery_service.py`**
   - Added filtering in `_run_stage2()` after idea cleaning
   - Added filtering in `workflow_stream()` for static engine path
   - Logs warnings if fewer than 3 ideas remain after filtering

4. **`backend_v2/app/api/routes/discovery.py`**
   - Added `startup_category` to `RunRequest` model
   - Added `startup_category` to required fields validation
   - Added default value "both" in `ensure_defaults()`

## Features Implemented

1. **Frontend Filtering**: Interest areas, subcategories, and skills filter based on `startup_category`
2. **Prompt-Level Filtering**: LLM prompts include explicit tech/non-tech instructions
3. **Backend Post-Filtering**: Ideas filtered after generation to ensure compliance
4. **Validation**: `startup_category` is required in both frontend and backend
5. **Default Behavior**: Defaults to "both" if not specified (backward compatible)

## How It Works

1. User selects `startup_category` first (Tech/Non-Tech/Both)
2. Interest areas filter based on selection
3. Subcategories filter based on selection and parent interest area
4. Skills filter based on selection
5. LLM receives explicit instructions in the prompt
6. Backend filters ideas after generation using keyword analysis
7. Final ideas match the selected category

## Skill Categorization

- **TECH Skills**: Coding, AI & Automation, AI Tools, Web Building, Automation, Data Analysis, Low-code/No-code, SEO/Blogging
- **NON-TECH Skills**: Cooking/Food Prep, Crafting/Handmade, Beauty Services, Fitness Coaching, Customer Interaction, Community Building, Budgeting, Inventory Management, Logistics, Teaching/Coaching
- **MIXED Skills**: Photography/Videography, Writing/Content, Graphic Design, Social Media, Marketing/Advertising, Time Management, Project Management
- **NEUTRAL Skills**: Empathy, Leadership, Problem Solving, Team Building, Persuasion (shown for both)

## Interest Area Categorization

- **TECH**: AI & Automation, Software / SaaS, Education (EdTech)
- **NON-TECH**: Food & Beverage, Retail & E-commerce, Fitness & Sports, Kids & Parenting, Beauty & Wellness, Home Services, Travel & Tourism, Manufacturing / Crafts, Finance / Accounting, Freelancing / Consulting, Agriculture / Gardening, Social Impact, Local Services
- **MIXED**: Other (user-defined)

All changes are backward compatible (defaults to "both" if not specified) and include comprehensive error handling and logging.

