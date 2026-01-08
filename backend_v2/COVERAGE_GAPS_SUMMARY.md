# Test Coverage Gaps Summary

**Current Overall Coverage: 50%** (3,611 / 7,252 statements)

## 🔴 Critical Priority (0-20% Coverage)

### 1. Static Engine (5-11% coverage)
**Impact: High | Estimated Time: 4-6 hours | Coverage Gain: +5-7%**

| File | Coverage | Missing Lines | Priority |
|------|----------|---------------|----------|
| `app/static_engine/synthesizer.py` | 5% | 426/448 | 🔴 Critical |
| `app/static_engine/report_builder.py` | 7% | 127/136 | 🔴 Critical |
| `app/static_engine/loader.py` | 11% | 64/72 | 🔴 Critical |

**Why:** Core business logic for generating reports without LLM calls.

**Action:** Create `tests/unit/static_engine/` directory and add tests for all three files.

---

### 2. Tool Service (8% coverage)
**Impact: High | Estimated Time: 2-3 hours | Coverage Gain: +3-4%**

| File | Coverage | Missing Lines | Priority |
|------|----------|---------------|----------|
| `app/services/tool_service.py` | 8% | 217/236 | 🔴 Critical |

**Why:** Handles dynamic tool execution for discovery workflow.

**Action:** Create `tests/unit/services/test_tool_service.py` with tests for tool execution, validation, and error handling.

---

### 3. Discovery Utils (13% coverage)
**Impact: Medium | Estimated Time: 1 hour | Coverage Gain: +1%**

| File | Coverage | Missing Lines | Priority |
|------|----------|---------------|----------|
| `app/services/discovery_utils.py` | 13% | 20/23 | 🟠 High |

**Why:** Utility functions used throughout discovery workflow.

**Action:** Create `tests/unit/services/test_discovery_utils.py`.

---

### 4. Profile Analysis (6-26% coverage)
**Impact: Medium | Estimated Time: 4-5 hours | Coverage Gain: +2-3%**

| File | Coverage | Missing Lines | Priority |
|------|----------|---------------|----------|
| `app/services/profile_analysis/profile_prompt_builder.py` | 6% | 120/127 | 🔴 Critical |
| `app/services/profile_analysis/profile_variable_extractor.py` | 14% | 139/162 | 🔴 Critical |
| `app/services/profile_analysis/profile_analysis_utils.py` | 19% | 48/59 | 🟠 High |
| `app/services/profile_analysis_service.py` | 26% | 57/77 | 🟠 High |

**Why:** Analyzes user profiles for personalized recommendations.

**Action:** Create `tests/unit/services/profile_analysis/` directory with tests for all components.

---

## 🟡 High Priority (20-50% Coverage)

### 5. API Routes - Discovery (49% coverage)
**Impact: High | Estimated Time: 3-4 hours | Coverage Gain: +5-7%**

| File | Coverage | Missing Lines | Priority |
|------|----------|---------------|----------|
| `app/api/routes/discovery.py` | 49% | 279/546 | 🟡 Medium |

**Missing:** Error handling paths, edge cases, streaming errors.

**Action:** Expand `tests/integration/test_discovery_api.py` with error handling and edge case tests.

---

### 6. API Routes - User (42% coverage)
**Impact: Medium | Estimated Time: 2-3 hours | Coverage Gain: +3-4%**

| File | Coverage | Missing Lines | Priority |
|------|----------|---------------|----------|
| `app/api/routes/user.py` | 42% | 128/222 | 🟡 Medium |

**Missing:** Additional endpoints, error handling, edge cases.

**Action:** Expand `tests/integration/test_user_api.py`.

---

### 7. User Service (59% coverage)
**Impact: Medium | Estimated Time: 2-3 hours | Coverage Gain: +2-3%**

| File | Coverage | Missing Lines | Priority |
|------|----------|---------------|----------|
| `app/services/user_service.py` | 59% | 98/238 | 🟡 Medium |

**Missing:** Additional CRUD operations, edge cases, error handling.

**Action:** Expand `tests/unit/services/test_user_service.py`.

---

## 📊 Quick Wins Summary

### Phase 1: Critical Files (Target: +9-12% coverage)
1. ✅ Static Engine tests (4-6 hours) → +5-7%
2. ✅ Tool Service tests (2-3 hours) → +3-4%
3. ✅ Discovery Utils tests (1 hour) → +1%

**Total: 7-10 hours → 59-62% coverage**

### Phase 2: High Priority Files (Target: +10-14% coverage)
4. ✅ Expand Discovery API tests (3-4 hours) → +5-7%
5. ✅ Expand User API tests (2-3 hours) → +3-4%
6. ✅ Expand User Service tests (2-3 hours) → +2-3%

**Total: 7-10 hours → 69-76% coverage**

### Phase 3: Profile Analysis (Target: +2-3% coverage)
7. ✅ Profile Analysis tests (4-5 hours) → +2-3%

**Total: 4-5 hours → 71-79% coverage**

---

## 🎯 Recommended Action Plan

### Week 1: Quick Wins
- [ ] Day 1-2: Static Engine tests (synthesizer, report_builder, loader)
- [ ] Day 3: Tool Service tests
- [ ] Day 4: Discovery Utils tests
- [ ] Day 5: Review and verify coverage increase

**Expected Result:** 59-62% coverage (+9-12%)

### Week 2: High Priority
- [ ] Day 1-2: Expand Discovery API tests
- [ ] Day 3: Expand User API tests
- [ ] Day 4: Expand User Service tests
- [ ] Day 5: Review and verify coverage increase

**Expected Result:** 69-76% coverage (+10-14%)

### Week 3: Profile Analysis
- [ ] Day 1-3: Profile Analysis tests (all components)
- [ ] Day 4-5: Review and verify coverage increase

**Expected Result:** 71-79% coverage (+2-3%)

---

## 📈 Coverage Goals

| Target | Coverage | Status |
|--------|----------|--------|
| Current | 50% | ✅ Achieved |
| Phase 1 | 55-60% | 🎯 Next |
| Phase 2 | 60-65% | 📋 Planned |
| Phase 3 | 65-70% | 📋 Planned |
| Phase 4 | 70-75% | 📋 Future |
| Phase 5 | 75-80% | 📋 Future |

---

## 🔧 Tools & Commands

### Check Current Coverage
```bash
# Run tests with coverage
pytest --cov=app --cov-report=term-missing --cov-report=html

# View HTML report
# Open htmlcov/index.html in browser
```

### Check Specific File Coverage
```bash
# Check coverage for a specific file
pytest --cov=app.static_engine.synthesizer --cov-report=term-missing tests/
```

### Find Lowest Coverage Files
```bash
# Run coverage and grep for low percentages
pytest --cov=app --cov-report=term | grep -E "\s+[0-2][0-9]%"
```

---

## 📚 Resources

- **Detailed Guide:** See `HOW_TO_INCREASE_TEST_COVERAGE.md`
- **Test Examples:** See existing tests in `tests/unit/` and `tests/integration/`
- **Coverage Report:** Open `htmlcov/index.html` after running tests

---

## 💡 Tips

1. **Start with business-critical code** - Static engine and discovery are core features
2. **Focus on high-impact files** - Files with most missing lines give biggest coverage boost
3. **Test behavior, not implementation** - Focus on what the code does, not how
4. **Use existing tests as templates** - Look at similar files for test patterns
5. **Run coverage frequently** - Check progress after each test file addition

---

**Last Updated:** Based on test run with 50% overall coverage (231 integration + 133 unit tests)

