# How to Verify Static Engine is Working

## Quick Verification

Run the verification script:

```bash
python verify_static_engine.py
```

This will test:
1. ✅ Industry data loading
2. ✅ Parameter mapping ID resolution
3. ✅ Idea synthesis (10-20 unique ideas)
4. ✅ Markdown report generation
5. ✅ Deterministic output

## Test Suite

Run the full test suite:

```bash
# All tests
pytest tests/static_engine/ -v

# Specific test file
pytest tests/static_engine/test_loader.py -v
pytest tests/static_engine/test_synthesizer.py -v
pytest tests/static_engine/test_report_builder.py -v

# Integration test
pytest tests/static_engine/test_integration.py -v
```

**Expected Result**: 45+ tests passing

## Manual Testing

### 1. Check Industry Data Exists

```bash
# Verify industry file exists
ls app/static_engine/static/industries/ai.json

# Or in PowerShell
Test-Path app\static_engine\static\industries\ai.json
```

### 2. Test Loading

```python
from app.static_engine.loader import load_industry_data

data = load_industry_data("ai")
assert data is not None
print(f"Loaded {len(data['idea_fragments']['problems'])} problems")
```

### 3. Test Synthesis

```python
from app.static_engine.synthesizer import synthesize_ideas

ideas = synthesize_ideas(
    user_params={
        "time_commitment": "<5",
        "budget_range": "$0-1k",
        "risk_tolerance": "Very Low",
        "skill_strength": "Beginner",
        "goal_type": "Extra Income",
        "work_style": "Solo"
    },
    industry_data=data,
    num_ideas=15,
    seed=42
)

assert 10 <= len(ideas) <= 20
print(f"Generated {len(ideas)} unique ideas")
```

### 4. Test Report Building

```python
from app.static_engine.report_builder import build_markdown_report

report = build_markdown_report(
    profile={"core_motivations": "Test profile"},
    idea_list=ideas,
    industry_data=data
)

assert len(report) > 100
assert "Idea" in report or "idea" in report.lower()
print(f"Report generated: {len(report)} characters")
```

## Integration with Discovery Service

The static engine is automatically used in `discovery_service.py` when:

1. Industry data exists in `app/static_engine/static/industries/{industry_key}.json`
2. `load_industry_data()` returns valid data
3. No exceptions occur during synthesis/report building

### Check if Static Engine is Being Used

Look for these log messages:

```
INFO - Static engine: Generated 15 ideas for 'ai'
```

If you see this, the static engine is working!

### Fallback to LLM

If static engine fails or industry data is missing, you'll see:

```
WARNING - Static engine failed for 'ai': ..., falling back to LLM
```

This is expected behavior - the system gracefully falls back to LLM.

## Verification Checklist

- [ ] `verify_static_engine.py` runs successfully
- [ ] All pytest tests pass (45+ tests)
- [ ] Industry data file exists: `app/static_engine/static/industries/ai.json`
- [ ] Can load industry data programmatically
- [ ] Can synthesize 10-20 unique ideas
- [ ] Can build markdown reports
- [ ] Deterministic output with same seed
- [ ] Integration test passes

## Troubleshooting

### Issue: "Could not load industry data"

**Solution**: 
- Check file exists: `app/static_engine/static/industries/{industry_key}.json`
- Verify JSON is valid: `python -m json.tool app/static_engine/static/industries/ai.json`
- Check schema validation errors in logs

### Issue: "Invalid fragment ID references"

**Solution**:
- Run validation: `python -m app.static_engine.regenerate_industries`
- Check parameter_mappings reference valid IDs from idea_fragments
- Regenerate industry file if needed

### Issue: "Tests failing"

**Solution**:
- Run with verbose output: `pytest tests/static_engine/ -v`
- Check specific test: `pytest tests/static_engine/test_loader.py::TestSchemaValidation::test_valid_schema_passes -v`
- Verify test data fixtures are correct

## Success Indicators

✅ **Static Engine is Working When:**
- Verification script passes all checks
- Tests pass (45+ tests)
- Can generate 10-20 unique ideas
- Reports are generated successfully
- Same inputs produce same output (deterministic)
- No errors in logs

✅ **Integration is Working When:**
- Discovery service uses static engine for existing industries
- Logs show "Static engine: Generated X ideas"
- Reports are returned quickly (no LLM delay)
- Falls back to LLM gracefully for missing industries


