# Static Engine Test Suite

Comprehensive test suite for the static_engine modules.

## Test Files

### `test_loader.py`
Tests for `loader.py` module:
- ✅ Schema validation strictness
- ✅ File loading functionality
- ✅ Industry name normalization
- ✅ Parameter mapping ID validation
- ✅ Error handling for invalid files

### `test_synthesizer.py`
Tests for `synthesizer.py` module:
- ✅ Idea synthesis produces 10-20 unique ideas
- ✅ Deterministic output with fixed seeds
- ✅ Different seeds produce different output
- ✅ All ideas have required fields
- ✅ Ideas use valid fragment IDs
- ✅ Parameter mapping ID resolution
- ✅ Fragment selection and weighting

### `test_report_builder.py`
Tests for `report_builder.py` module:
- ✅ Markdown report structure validation
- ✅ Ideas section formatting
- ✅ Profile formatting
- ✅ Industry context formatting
- ✅ Template placeholder replacement
- ✅ Deterministic output
- ✅ Valid markdown structure

## Running Tests

### Run all static_engine tests:
```bash
pytest tests/static_engine/
```

### Run specific test file:
```bash
pytest tests/static_engine/test_loader.py
pytest tests/static_engine/test_synthesizer.py
pytest tests/static_engine/test_report_builder.py
```

### Run with verbose output:
```bash
pytest tests/static_engine/ -v
```

### Run with coverage:
```bash
pytest tests/static_engine/ --cov=app.static_engine --cov-report=html
```

## Test Coverage

The test suite covers:

1. **Schema Strictness**: All required fields, correct types, valid structures
2. **ID Resolution**: All parameter mapping IDs exist in idea_fragments
3. **Idea Uniqueness**: 10-20 unique ideas per synthesis
4. **Determinism**: Fixed seeds produce identical output
5. **Markdown Structure**: Valid markdown with proper sections
6. **Error Handling**: Graceful handling of invalid inputs

## Requirements

- pytest
- All dependencies from `requirements.txt`

## Test Data

Tests use fixtures to create sample industry data, profiles, and ideas. These are defined in each test file and can be customized for specific test scenarios.

