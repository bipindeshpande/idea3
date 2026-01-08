# Test runner script for backend (PowerShell)

Write-Host "Running backend tests..." -ForegroundColor Green

# Unit tests
Write-Host "Running unit tests..." -ForegroundColor Yellow
pytest tests/unit -v --cov=app --cov-report=term-missing

# Integration tests (skip slow/LLM tests by default)
Write-Host "Running integration tests..." -ForegroundColor Yellow
pytest tests/integration -v --cov=app --cov-append --cov-report=term-missing -m "not slow and not requires_llm"

Write-Host "Tests completed!" -ForegroundColor Green

