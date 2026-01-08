# How to Increase Test Coverage

## Current Status
- **Overall Coverage**: 50% (3,611 / 7,252 statements)
- **Unit Tests**: 133 tests (33% coverage)
- **Integration Tests**: 231 tests (50% coverage with integration)

## Priority Areas (Lowest Coverage First)

### 🔴 Critical Priority (0-20% Coverage)

#### 1. **Static Engine** (5-11% coverage)
**Files:**
- `app/static_engine/synthesizer.py` - 5% (426/448 lines uncovered)
- `app/static_engine/report_builder.py` - 7% (127/136 lines uncovered)
- `app/static_engine/loader.py` - 11% (64/72 lines uncovered)

**Why it matters:** Core business logic for generating reports without LLM calls.

**How to test:**
```python
# tests/unit/static_engine/test_synthesizer.py
def test_synthesize_discovery_result():
    """Test synthesizing discovery results into report format"""
    result = synthesizer.synthesize_discovery_result(mock_data)
    assert result is not None
    assert "recommendations" in result

def test_synthesize_with_missing_data():
    """Test handling of missing data gracefully"""
    result = synthesizer.synthesize_discovery_result({})
    assert result is not None  # Should not crash

# tests/integration/test_static_engine_api.py
def test_get_static_report_success():
    """Test retrieving a static report"""
    response = client.get("/api/reports/static/123")
    assert response.status_code == 200
```

**Estimated impact:** +5-7% overall coverage

---

#### 2. **Tool Service** (8% coverage)
**File:** `app/services/tool_service.py` - 8% (217/236 lines uncovered)

**Why it matters:** Handles dynamic tool execution for discovery workflow.

**How to test:**
```python
# tests/unit/services/test_tool_service.py
def test_execute_tool_success():
    """Test successful tool execution"""
    result = tool_service.execute_tool("tool_name", {"param": "value"})
    assert result is not None

def test_execute_tool_not_found():
    """Test handling of non-existent tool"""
    with pytest.raises(ToolNotFoundError):
        tool_service.execute_tool("nonexistent", {})

def test_validate_tool_parameters():
    """Test parameter validation"""
    assert tool_service.validate_parameters("tool_name", valid_params)
    assert not tool_service.validate_parameters("tool_name", invalid_params)
```

**Estimated impact:** +3-4% overall coverage

---

#### 3. **Discovery Utils** (13% coverage)
**File:** `app/services/discovery_utils.py` - 13% (20/23 lines uncovered)

**Why it matters:** Utility functions used throughout discovery workflow.

**How to test:**
```python
# tests/unit/services/test_discovery_utils.py
def test_format_discovery_input():
    """Test formatting discovery inputs"""
    formatted = discovery_utils.format_input(raw_input)
    assert isinstance(formatted, dict)

def test_validate_discovery_params():
    """Test validation of discovery parameters"""
    assert discovery_utils.validate_params(valid_params)
    assert not discovery_utils.validate_params(invalid_params)
```

**Estimated impact:** +1% overall coverage

---

#### 4. **Profile Analysis** (6-26% coverage)
**Files:**
- `app/services/profile_analysis/profile_prompt_builder.py` - 6%
- `app/services/profile_analysis/profile_variable_extractor.py` - 14%
- `app/services/profile_analysis/profile_analysis_utils.py` - 19%
- `app/services/profile_analysis_service.py` - 26%

**Why it matters:** Analyzes user profiles for personalized recommendations.

**How to test:**
```python
# tests/unit/services/profile_analysis/test_profile_analysis_service.py
def test_analyze_profile_success():
    """Test successful profile analysis"""
    profile = {"skills": ["python"], "experience": 5}
    result = profile_analysis_service.analyze(profile)
    assert result is not None
    assert "variables" in result

def test_analyze_profile_empty():
    """Test analysis with empty profile"""
    result = profile_analysis_service.analyze({})
    assert result is not None  # Should handle gracefully
```

**Estimated impact:** +2-3% overall coverage

---

### 🟡 Medium Priority (20-50% Coverage)

#### 5. **API Routes - Discovery** (49% coverage)
**File:** `app/api/routes/discovery.py` - 49% (279/546 lines uncovered)

**Missing tests:**
- Error handling paths
- Edge cases (empty inputs, invalid formats)
- Authentication edge cases
- Streaming response edge cases

**How to test:**
```python
# tests/integration/test_discovery_api.py (add these)
def test_create_run_invalid_json_format():
    """Test discovery with invalid JSON format"""
    response = client.post("/api/discovery/run", json={"invalid": "data"})
    assert response.status_code == 400

def test_create_run_streaming_error():
    """Test handling of streaming errors"""
    # Mock streaming to raise error
    with patch('app.services.discovery_service.workflow_stream') as mock:
        mock.side_effect = Exception("Stream error")
        response = client.post("/api/discovery/run?format=sse")
        assert response.status_code == 500
```

**Estimated impact:** +5-7% overall coverage

---

#### 6. **API Routes - User** (42% coverage)
**File:** `app/api/routes/user.py` - 42% (128/222 lines uncovered)

**Missing tests:**
- Error handling
- Edge cases
- Additional endpoints

**How to test:**
```python
# tests/integration/test_user_api.py (add these)
def test_get_user_profile_success():
    """Test getting user profile"""
    response = client.get("/api/user/profile")
    assert response.status_code == 200

def test_update_user_profile():
    """Test updating user profile"""
    response = client.put("/api/user/profile", json={"name": "New Name"})
    assert response.status_code == 200
```

**Estimated impact:** +3-4% overall coverage

---

#### 7. **User Service** (59% coverage)
**File:** `app/services/user_service.py` - 59% (98/238 lines uncovered)

**Missing tests:**
- Additional CRUD operations
- Edge cases
- Error handling

**How to test:**
```python
# tests/unit/services/test_user_service.py (add these)
def test_get_user_profile():
    """Test getting user profile"""
    profile = user_service.get_profile(user_id)
    assert profile is not None

def test_update_user_preferences():
    """Test updating user preferences"""
    result = user_service.update_preferences(user_id, prefs)
    assert result is not None
```

**Estimated impact:** +2-3% overall coverage

---

## Strategies by Code Type

### 1. **Testing API Routes**

**Best Practices:**
- Test all HTTP methods (GET, POST, PUT, DELETE)
- Test authentication (with/without auth, wrong user)
- Test validation (missing fields, invalid data, edge cases)
- Test error responses (404, 401, 403, 500)
- Test success responses with different data

**Template:**
```python
def test_endpoint_success():
    """Test successful request"""
    response = client.post("/api/endpoint", json=valid_data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_endpoint_missing_auth():
    """Test without authentication"""
    response = client.post("/api/endpoint", json=valid_data)
    assert response.status_code == 401

def test_endpoint_invalid_data():
    """Test with invalid data"""
    response = client.post("/api/endpoint", json=invalid_data, headers=auth_headers)
    assert response.status_code == 400

def test_endpoint_not_found():
    """Test with non-existent resource"""
    response = client.get("/api/endpoint/99999", headers=auth_headers)
    assert response.status_code == 404
```

---

### 2. **Testing Services**

**Best Practices:**
- Test happy paths
- Test error handling
- Test edge cases (empty inputs, None values, boundary conditions)
- Test with mocked dependencies
- Test return value structure

**Template:**
```python
def test_service_method_success():
    """Test successful service method"""
    with patch('dependency') as mock_dep:
        mock_dep.return_value = expected_result
        result = service.method(input_data)
        assert result == expected_result
        mock_dep.assert_called_once()

def test_service_method_error():
    """Test error handling"""
    with patch('dependency') as mock_dep:
        mock_dep.side_effect = Exception("Error")
        with pytest.raises(ServiceError):
            service.method(input_data)

def test_service_method_edge_case():
    """Test edge case (empty input, None, etc.)"""
    result = service.method(None)
    assert result is not None  # Should handle gracefully
```

---

### 3. **Testing Utilities**

**Best Practices:**
- Test all code paths (if/else, try/except)
- Test with different input types
- Test boundary conditions
- Test error cases

**Template:**
```python
def test_utility_function_normal():
    """Test normal usage"""
    result = utility_function(valid_input)
    assert result == expected_output

def test_utility_function_edge_case():
    """Test edge case"""
    result = utility_function(edge_case_input)
    assert result is not None

def test_utility_function_error():
    """Test error handling"""
    with pytest.raises(ValueError):
        utility_function(invalid_input)
```

---

## Tools and Techniques

### 1. **Identify Coverage Gaps**

```bash
# Generate detailed coverage report
pytest --cov=app --cov-report=term-missing --cov-report=html

# View HTML report
# Open htmlcov/index.html in browser

# Find files with lowest coverage
pytest --cov=app --cov-report=term | grep -E "^\w.*\s+\d+%\s*$" | sort -k2 -n
```

### 2. **Coverage Configuration**

Add to `pytest.ini`:
```ini
[pytest]
# Focus on specific modules
addopts = 
    --cov=app
    --cov-report=term-missing
    --cov-report=html
    --cov-report=xml
    --cov-fail-under=60  # Fail if coverage below 60%
```

### 3. **Coverage Exclusions**

Add to `.coveragerc` or `setup.cfg`:
```ini
[coverage:run]
omit = 
    */tests/*
    */migrations/*
    */__pycache__/*
    */venv/*
    */env/*
    app/main.py  # If needed
```

---

## Step-by-Step Action Plan

### Phase 1: Quick Wins (Target: 55% coverage)

1. **Add Static Engine Tests** (+5-7%)
   - Create `tests/unit/static_engine/test_synthesizer.py`
   - Create `tests/unit/static_engine/test_report_builder.py`
   - Create `tests/unit/static_engine/test_loader.py`
   - **Time estimate:** 4-6 hours

2. **Add Tool Service Tests** (+3-4%)
   - Create `tests/unit/services/test_tool_service.py`
   - Test tool execution, validation, error handling
   - **Time estimate:** 2-3 hours

3. **Add Discovery Utils Tests** (+1%)
   - Create `tests/unit/services/test_discovery_utils.py`
   - Test utility functions
   - **Time estimate:** 1 hour

**Total Phase 1:** +9-12% coverage, ~7-10 hours

---

### Phase 2: Medium Priority (Target: 60% coverage)

4. **Expand Discovery API Tests** (+5-7%)
   - Add error handling tests
   - Add edge case tests
   - Add streaming error tests
   - **Time estimate:** 3-4 hours

5. **Expand User API Tests** (+3-4%)
   - Add missing endpoint tests
   - Add error handling
   - **Time estimate:** 2-3 hours

6. **Expand User Service Tests** (+2-3%)
   - Add missing method tests
   - Add edge cases
   - **Time estimate:** 2-3 hours

**Total Phase 2:** +10-14% coverage, ~7-10 hours

---

### Phase 3: Profile Analysis (Target: 65% coverage)

7. **Add Profile Analysis Tests** (+2-3%)
   - Create `tests/unit/services/profile_analysis/`
   - Test all profile analysis components
   - **Time estimate:** 4-5 hours

**Total Phase 3:** +2-3% coverage, ~4-5 hours

---

## Testing Best Practices

### 1. **Test Structure**
```python
# Arrange
setup_data = create_test_data()
mock_dependency.return_value = expected_value

# Act
result = function_under_test(setup_data)

# Assert
assert result == expected_result
assert mock_dependency.called_once()
```

### 2. **Test Naming**
- Use descriptive names: `test_function_name_scenario_expected_result`
- Examples:
  - `test_create_user_success`
  - `test_create_user_duplicate_email_returns_error`
  - `test_get_user_not_found_returns_404`

### 3. **Test Organization**
- Group related tests in classes
- Use fixtures for common setup
- Use parametrize for similar test cases

### 4. **Mocking Strategy**
- Mock external dependencies (database, APIs, LLM)
- Don't mock code you're testing
- Use `unittest.mock` or `pytest-mock`

---

## Coverage Goals

| Phase | Target Coverage | Priority Areas |
|-------|----------------|----------------|
| Current | 50% | - |
| Phase 1 | 55-60% | Static Engine, Tool Service, Utils |
| Phase 2 | 60-65% | Discovery API, User API, User Service |
| Phase 3 | 65-70% | Profile Analysis, Remaining Services |
| Phase 4 | 70-75% | Edge Cases, Error Handling |
| Phase 5 | 75-80% | Integration Tests, E2E Scenarios |

---

## Quick Reference Commands

```bash
# Run tests with coverage
pytest --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/unit/services/test_tool_service.py -v

# Run tests matching pattern
pytest -k "test_tool" -v

# Run with coverage for specific module
pytest --cov=app.services.tool_service tests/

# Generate HTML coverage report
pytest --cov=app --cov-report=html
# Then open htmlcov/index.html

# Check coverage for specific file
pytest --cov=app.services.tool_service --cov-report=term-missing tests/
```

---

## Common Pitfalls to Avoid

1. **Don't test implementation details** - Test behavior, not internals
2. **Don't over-mock** - Only mock external dependencies
3. **Don't write tests that always pass** - Make sure tests can fail
4. **Don't ignore edge cases** - Test None, empty, boundary values
5. **Don't skip error handling** - Test error paths too

---

## Next Steps

1. **Start with Phase 1** - Quick wins with highest impact
2. **Run coverage after each addition** - Track progress
3. **Focus on business-critical code first** - Static engine, discovery, validation
4. **Don't aim for 100%** - 70-80% is usually sufficient
5. **Maintain test quality** - Better to have fewer good tests than many bad ones

---

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [coverage.py documentation](https://coverage.readthedocs.io/)
- [Testing Best Practices](https://docs.python-guide.org/writing/tests/)
- [Mocking in Python](https://docs.python.org/3/library/unittest.mock.html)

