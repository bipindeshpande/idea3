# Test Automation Guide

## Quick Start

### Backend Tests

```bash
cd backend_v2

# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run unit tests only
pytest tests/unit -v

# Run integration tests only
pytest tests/integration -v

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_auth_service.py -v

# Run tests matching pattern
pytest -k "test_login" -v
```

### Frontend Tests

```bash
cd frontend

# Install dependencies
npm install

# Run unit tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui
```

## Test Structure

### Backend
- `tests/unit/` - Unit tests for services
- `tests/integration/` - API endpoint integration tests
- `pytest.ini` - Test configuration
- `conftest.py` - Shared fixtures

### Frontend
- `tests/unit/` - Component and hook unit tests
- `tests/e2e/` - End-to-end tests
- `vitest.config.js` - Unit test configuration
- `playwright.config.js` - E2E test configuration

## CI/CD Automation

Tests run automatically on:
- Push to main/develop branches
- Pull requests

See `.github/workflows/tests.yml` for configuration.

## Test Markers

Backend tests use markers:
- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.integration` - Integration tests
- `@pytest.mark.api` - API tests
- `@pytest.mark.slow` - Slow tests (skipped by default)
- `@pytest.mark.requires_db` - Requires database
- `@pytest.mark.requires_llm` - Requires LLM (skipped by default)

Run specific markers:
```bash
pytest -m unit
pytest -m integration
pytest -m "not slow"
```

