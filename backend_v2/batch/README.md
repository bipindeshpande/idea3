# Industry Static Data Regeneration System

This batch system regenerates static industry JSON files using LLM-powered analysis. The system runs nightly to keep industry data up-to-date.

## Overview

The regeneration system:
- Generates comprehensive industry data for all supported industries
- Uses LLM to analyze market trends, opportunities, and competitive dynamics
- Validates data against a strict schema before saving
- Uses atomic file replacement for safety (tmp → validate → replace)

## Files

- `regenerate_industry_static_data.py` - Main regeneration script
- `static_schema.py` - Schema definition and validation helpers
- `run_regeneration.bat` - Windows batch runner
- `batch.log` - Execution logs (auto-generated)

## Supported Industries

- `ai` - AI / Automation
- `fintech` - Fintech
- `food_and_beverage` - Food & Beverage
- `restaurant` - Restaurant / Cafe
- `food_delivery` - Food Delivery
- `healthtech` - Health & Wellness Tech
- `healthcare` - Healthcare
- `ecommerce` - E-commerce
- `edtech` - EdTech
- `education` - Education
- `creator` - Creator Economy
- `sustainability` - Sustainability / Green Tech
- `travel` - Travel & Tourism
- `beauty` - Beauty & Wellness

## Manual Execution

### Single Industry (Dry Run)

Test regeneration for a single industry without writing files:

```bash
python batch\regenerate_industry_static_data.py --industry=ai --dry-run
```

### Single Industry (Actual Regeneration)

Regenerate a specific industry:

```bash
python batch\regenerate_industry_static_data.py --industry=ai
```

### All Industries (Dry Run)

Test regeneration for all industries without writing files:

```bash
python batch\regenerate_industry_static_data.py --dry-run
```

### All Industries (Actual Regeneration)

Regenerate all industries:

```bash
python batch\regenerate_industry_static_data.py
```

Or use the batch file:

```bash
batch\run_regeneration.bat
```

## Windows Task Scheduler Setup

To run regeneration nightly at 2 AM:

### Step 1: Open Task Scheduler
- Press `Win + R`, type `taskschd.msc`, press Enter

### Step 2: Create Basic Task
1. Click "Create Basic Task" in the right panel
2. Name: `Regenerate Industry Static Data`
3. Description: `Nightly regeneration of industry static JSON files`
4. Click Next

### Step 3: Set Trigger
1. Select "Daily"
2. Click Next
3. Start date: Today's date
4. Start time: `02:00:00` (2 AM)
5. Recur every: `1` days
6. Click Next

### Step 4: Set Action
1. Select "Start a program"
2. Click Next
3. Program/script: Browse to `backend_v2\batch\run_regeneration.bat`
4. Start in: `C:\path\to\project\backend_v2` (adjust to your project path)
5. Click Next

### Step 5: Finish
1. Review settings
2. Check "Open the Properties dialog for this task when I click Finish"
3. Click Finish

### Step 6: Configure Properties
1. In the Properties dialog:
   - **General tab**: 
     - Check "Run whether user is logged on or not"
     - Check "Run with highest privileges"
   - **Conditions tab**:
     - Uncheck "Start the task only if the computer is on AC power" (if you want it to run on battery)
   - **Settings tab**:
     - Check "Allow task to be run on demand"
     - Check "Run task as soon as possible after a scheduled start is missed"
   - **Actions tab**:
     - Verify the batch file path is correct
     - Start in: `C:\path\to\project\backend_v2` (adjust to your project path)

2. Click OK

### Step 7: Test
1. Right-click the task in Task Scheduler
2. Select "Run"
3. Check `backend_v2\batch\batch.log` for execution results

## Output Location

Generated files are written to:
```
backend_v2/app/tools/static_blocks/{industry}.json
```

Logs are written to:
```
backend_v2/batch/batch.log
```

## Schema

The generated JSON files follow this structure:

```json
{
  "business_models": ["model1", "model2", ...],
  "target_segments": ["segment1", "segment2", ...],
  "value_props": {
    "key1": "description1",
    "key2": "description2"
  },
  "skill_tags": {
    "tag1": "description1",
    "tag2": "description2"
  },
  "budget_bins": {
    "low": "description",
    "medium": "description",
    "high": "description"
  },
  "constraints_map": {
    "constraint1": "description1",
    "constraint2": "description2"
  },
  "trend_summary": ["trend1", "trend2", ...],
  "competitor_notes": ["note1", "note2", ...],
  "markdown_template": "# Industry Overview\n\n..."
}
```

## Safety Features

1. **Atomic File Replacement**: Files are written to `.tmp.json` first, validated, then atomically replaced
2. **Schema Validation**: All generated data is validated against the expected schema
3. **Dry Run Mode**: Test regeneration without modifying files
4. **Error Handling**: Failed generations don't corrupt existing files
5. **Logging**: All actions logged to `batch.log`

## Troubleshooting

### Python Not Found
- Ensure Python is in your system PATH
- Or use full path: `C:\Python39\python.exe batch\regenerate_industry_static_data.py`

### LLM API Errors
- Check that `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set in your environment
- Verify API keys are valid and have sufficient credits

### Permission Errors
- Ensure the script has write permissions to `app/tools/static_blocks/`
- Run Task Scheduler task with appropriate user permissions

### Validation Failures
- Check `batch.log` for specific validation errors
- LLM may have returned malformed JSON - the script will log the error

## Notes

- The script uses the existing `LLMService` from the backend
- Requires database connection (for LLMService initialization)
- Each industry requires one LLM API call
- Regenerating all industries may take 5-15 minutes depending on API response times

