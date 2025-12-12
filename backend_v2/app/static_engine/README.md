# Static Industry Engine

A deterministic, non-LLM system for generating business ideas from industry data.

## Overview

The Static Industry Engine loads pre-generated industry JSON files, synthesizes ideas using parameter mappings, and builds markdown reports - all without LLM calls. This provides fast, consistent, and cost-effective idea generation.

## Architecture

### Modules

1. **`loader.py`** - Loads and validates industry JSON files
   - `load_industry_data(industry_key: str)` - Main entry point
   - Validates schema structure
   - Handles industry name normalization

2. **`synthesizer.py`** - Combines fragments into unique ideas
   - `synthesize_ideas(user_params, industry_data, num_ideas=15)` - Main entry point
   - Uses parameter mappings to filter and weight fragments
   - Generates 10-20 unique idea combinations
   - Controlled randomness for variety

3. **`report_builder.py`** - Builds markdown reports
   - `build_markdown_report(profile, idea_list, industry_data)` - Main entry point
   - Uses industry template as skeleton
   - Fills with synthesized ideas and context
   - Fully deterministic output

## Usage

### In Discovery Service

The static engine is automatically used when industry data is available:

```python
from app.static_engine.loader import load_industry_data
from app.static_engine.synthesizer import synthesize_ideas
from app.static_engine.report_builder import build_markdown_report

# Load industry data
industry_data = load_industry_data("ai")

if industry_data:
    # Synthesize ideas
    ideas = synthesize_ideas(
        user_params={
            "time_commitment": "<5",
            "budget_range": "$0-1k",
            "risk_tolerance": "Very Low",
            "skill_strength": "Beginner",
            "goal_type": "Extra Income",
            "work_style": "Solo"
        },
        industry_data=industry_data,
        num_ideas=15
    )
    
    # Build report
    report = build_markdown_report(
        profile=profile_data,
        idea_list=ideas,
        industry_data=industry_data
    )
```

### Industry Data Structure

Industry JSON files must be located in `static/industries/{industry_key}.json` and contain:

- `business_models` - List of business model strings
- `target_segments` - List of target customer segments
- `value_props` - Dictionary mapping value props to arrays of descriptions
- `skill_tags` - Dictionary mapping skills to arrays of applications
- `budget_bins` - Dictionary of budget ranges
- `constraints_map` - Dictionary of constraints
- `trend_summary` - List of trend strings
- `competitor_notes` - List of competitor insights
- `markdown_template` - Template string for reports
- `idea_fragments` - Dictionary with:
  - `problems` - Array of {id, text} objects
  - `solutions` - Array of {id, text} objects
  - `delivery_modes` - Array of {id, text} objects
  - `revenue_patterns` - Array of {id, text} objects
  - `automation_patterns` - Array of {id, text} objects
- `parameter_mappings` - Dictionary mapping user parameters to fragment references
- `archetypes` - Array of {id, label} objects
- `difficulty_levels` - Array of difficulty strings
- `revenue_potential` - Array of revenue tier strings
- `operational_models` - Array of operational model strings

## Regeneration

### Manual Regeneration

Run the validation script:

```bash
python -m app.static_engine.regenerate_industries
```

Or use the Windows batch script:

```bash
scripts\regenerate_static_industries.bat
```

### Automated Regeneration

The batch regeneration system in `/batch/` can be used to regenerate industry files using LLM. See `batch/README.md` for details.

## Fallback Behavior

If static engine fails or industry data is not available, the system automatically falls back to the LLM-based approach in `discovery_service.py`.

## File Locations

- Industry data: `app/static_engine/static/industries/`
- Logs: `app/static_engine/static/logs/regenerate.log`
- Batch regeneration: `batch/` (optional, for LLM-based regeneration)

