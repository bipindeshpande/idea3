#!/bin/bash
# Test runner script for backend

set -e

echo "Running backend tests..."

# Unit tests
echo "Running unit tests..."
pytest tests/unit -v --cov=app --cov-report=term-missing

# Integration tests (skip slow/LLM tests by default)
echo "Running integration tests..."
pytest tests/integration -v --cov=app --cov-append --cov-report=term-missing -m "not slow and not requires_llm"

# Full test suite (uncomment to run all tests including slow ones)
# pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

echo "Tests completed!"

