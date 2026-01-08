# Testing Quick Start Guide

## What Was Created

I've set up **complete test automation** for your project:
- ✅ Backend unit tests (pytest)
- ✅ Backend integration tests (API endpoints)
- ✅ Frontend unit tests (Vitest)
- ✅ Frontend E2E tests (Playwright)
- ✅ CI/CD automation (GitHub Actions)

---

## Step 1: Install Dependencies

### Backend
```bash
cd backend_v2
pip install -r requirements.txt
```

This installs:
- `pytest` - Test framework
- `pytest-asyncio` - Async test support
- `pytest-cov` - Coverage reporting
- `httpx` - HTTP client for testing

### Frontend
```bash
cd frontend
npm install
```

This installs:
- `vitest` - Unit test framework
- `@testing-library/react` - React testing utilities
- `@playwright/test` - E2E testing (already installed)
- `@vitest/coverage-v8` - Coverage reporting

---

## Step 2: Run Your First Tests

### Backend - Quick Test
```bash
cd backend_v2

# Run all tests
pytest

# Run just unit tests (fast)
pytest tests/unit -v

# Run just integration tests
pytest tests/integration -v
```

**Expected Output:**
```
tests/unit/test_auth_service.py::TestAuthService::test_get_password_hash PASSED
tests/unit/test_auth_service.py::TestAuthService::test_verify_password PASSED
...
```

### Frontend - Quick Test
```bash
cd frontend

# Run unit tests
npm test

# Run E2E tests (requires dev server running)
npm run test:e2e
```

---

## Step 3: Understand Test Structure

### Backend Tests

```
backend_v2/tests/
├── conftest.py              # Shared fixtures (test DB, users, etc.)
├── unit/                    # Unit tests (fast, isolated)
│   ├── test_auth_service.py
│   └── test_user_service.py
└── integration/             # Integration tests (API endpoints)
    ├── test_auth_api.py
    ├── test_user_api.py
    ├── test_enhance_report.py
    ├── test_admin_api.py
    └── test_public_api.py
```

**What Each Test File Covers:**

1. **test_auth_service.py** - Tests password hashing, token generation, user authentication
2. **test_user_service.py** - Tests actions/notes CRUD, smart recommendations
3. **test_auth_api.py** - Tests `/api/auth/*` endpoints (register, login, logout, password reset)
4. **test_user_api.py** - Tests `/api/user/*` endpoints (actions, notes)
5. **test_enhance_report.py** - Tests `/api/enhance-report` endpoint
6. **test_admin_api.py** - Tests `/api/admin/*` endpoints
7. **test_public_api.py** - Tests `/api/public/usage-stats`

### Frontend Tests

```
frontend/tests/
├── setup.js                 # Test configuration
├── unit/                    # Component/hook unit tests
│   ├── hooks/
│   │   └── useAuth.test.js
│   └── components/
│       └── Account.test.jsx
└── e2e/                     # End-to-end tests
    ├── auth.spec.js
    ├── account.spec.js
    ├── report-enhancement.spec.js
    └── actions-notes.spec.js
```

---

## Step 4: Common Test Commands

### Backend Commands

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/unit/test_auth_service.py -v

# Run specific test
pytest tests/unit/test_auth_service.py::TestAuthService::test_login_success -v

# Run with coverage report
pytest --cov=app --cov-report=html
# Then open: backend_v2/htmlcov/index.html

# Run only unit tests
pytest tests/unit -v

# Run only integration tests
pytest tests/integration -v

# Skip slow tests
pytest -m "not slow"

# Run tests matching pattern
pytest -k "auth" -v
```

### Frontend Commands

```bash
# Run unit tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm test -- --watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
# Coverage report: frontend/coverage/index.html

# Run specific test file
npm test -- tests/unit/hooks/useAuth.test.js

# Run E2E tests
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui

# Run E2E in headed mode (see browser)
npm run test:e2e:headed
```

---

## Step 5: Fix Common Issues

### Backend Issues

**Issue: Database connection error**
```bash
# Set test database URL
export TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/test_db"
# Or use SQLite (default)
export TEST_DATABASE_URL="sqlite:///./test.db"
```

**Issue: Import errors**
```bash
# Make sure you're in backend_v2 directory
cd backend_v2
pytest
```

**Issue: Missing dependencies**
```bash
pip install -r requirements.txt
```

### Frontend Issues

**Issue: Module not found**
```bash
npm install
```

**Issue: E2E tests fail - server not running**
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

**Issue: Playwright browsers not installed**
```bash
npx playwright install
```

---

## Step 6: Add More Tests

### Adding a Backend Test

1. Create test file: `tests/unit/test_your_service.py`
2. Write test:
```python
import pytest
from app.services.your_service import YourService

@pytest.mark.unit
class TestYourService:
    def test_your_method(self, db_session):
        service = YourService(db_session)
        result = service.your_method()
        assert result is not None
```
3. Run: `pytest tests/unit/test_your_service.py -v`

### Adding a Frontend Test

1. Create test file: `tests/unit/components/YourComponent.test.jsx`
2. Write test:
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import YourComponent from '../../../src/components/YourComponent'

describe('YourComponent', () => {
  it('should render', () => {
    render(<YourComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```
3. Run: `npm test`

### Adding an E2E Test

1. Create test file: `tests/e2e/your-feature.spec.js`
2. Write test:
```javascript
import { test, expect } from '@playwright/test'

test('should do something', async ({ page }) => {
  await page.goto('/your-page')
  await expect(page.locator('text=Something')).toBeVisible()
})
```
3. Run: `npm run test:e2e`

---

## Step 7: View Test Results

### Coverage Reports

**Backend:**
```bash
pytest --cov=app --cov-report=html
# Open: backend_v2/htmlcov/index.html
```

**Frontend:**
```bash
npm run test:coverage
# Open: frontend/coverage/index.html
```

### Test Reports

**E2E Tests:**
```bash
npm run test:e2e
# Report: frontend/playwright-report/index.html
```

---

## Step 8: CI/CD (Automatic Testing)

Tests run automatically on GitHub when you:
- Push to `main` or `develop` branches
- Create a pull request

**View results:**
1. Go to your GitHub repo
2. Click "Actions" tab
3. See test results for each push/PR

**No action needed** - it's already configured in:
- `backend_v2/.github/workflows/tests.yml`
- `frontend/.github/workflows/tests.yml`

---

## Step 9: Daily Workflow

### Before Committing Code
```bash
# Backend
cd backend_v2
pytest tests/unit -v          # Quick check (fast)

# Frontend
cd frontend
npm test                       # Quick check
```

### Before Pushing to GitHub
```bash
# Backend - Full test suite
cd backend_v2
pytest                          # All tests

# Frontend - Full test suite
cd frontend
npm test                        # Unit tests
npm run test:e2e                # E2E tests (if critical)
```

### When Adding New Features
1. Write tests first (TDD) or after
2. Run tests: `pytest` or `npm test`
3. Fix any failures
4. Commit and push

---

## Step 10: Test Markers (Backend)

Use markers to organize tests:

```python
@pytest.mark.unit              # Unit test
@pytest.mark.integration        # Integration test
@pytest.mark.api                # API test
@pytest.mark.slow               # Slow test (skipped by default)
@pytest.mark.requires_db        # Needs database
@pytest.mark.requires_llm       # Needs LLM (skipped by default)
```

Run specific markers:
```bash
pytest -m unit                  # Only unit tests
pytest -m "not slow"            # Skip slow tests
pytest -m integration           # Only integration tests
```

---

## Quick Reference

### Most Common Commands

```bash
# Backend
pytest                          # Run all tests
pytest -v                       # Verbose output
pytest --cov=app                # With coverage

# Frontend
npm test                        # Run unit tests
npm run test:e2e                # Run E2E tests
npm run test:coverage           # With coverage
```

### Test Files Created

**Backend (8 test files):**
- ✅ `tests/unit/test_auth_service.py`
- ✅ `tests/unit/test_user_service.py`
- ✅ `tests/integration/test_auth_api.py`
- ✅ `tests/integration/test_user_api.py`
- ✅ `tests/integration/test_enhance_report.py`
- ✅ `tests/integration/test_admin_api.py`
- ✅ `tests/integration/test_public_api.py`
- ✅ `tests/conftest.py` (fixtures)

**Frontend (6 test files):**
- ✅ `tests/unit/hooks/useAuth.test.js`
- ✅ `tests/unit/components/Account.test.jsx`
- ✅ `tests/e2e/auth.spec.js`
- ✅ `tests/e2e/account.spec.js`
- ✅ `tests/e2e/report-enhancement.spec.js`
- ✅ `tests/e2e/actions-notes.spec.js`

---

## Next Steps

1. **Install dependencies** (Step 1)
2. **Run your first test** (Step 2)
3. **Add more tests** as you develop features
4. **Check coverage** regularly
5. **Fix failing tests** before committing

**That's it!** You now have full test automation. Tests will run automatically on GitHub, and you can run them locally anytime.

