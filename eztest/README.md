# EZTest Setup Guide

EZTest is an open-source, self-hosted test management platform designed for LLM-based applications. This guide will help you set up EZTest for managing your test cases, test runs, and LLM testing workflows.

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the EZTest repository)
- At least 2GB of free disk space
- Port 3000 available (or change in docker-compose.yml)

## Quick Start

### Option 1: Using Pre-built Setup (Recommended)

1. **Clone EZTest Repository**:
   ```bash
   cd eztest
   git clone https://github.com/houseoffoss/eztest.git source
   ```

2. **Copy Configuration**:
   ```bash
   cp .env.example .env
   ```

3. **Generate Secret Key**:
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # On Windows PowerShell:
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
   Add the generated key to `.env` as `NEXTAUTH_SECRET`

4. **Start EZTest**:
   ```bash
   docker-compose up -d --build
   ```

5. **Access EZTest**:
   Open your browser and navigate to: `http://localhost:3000`

### Option 2: Manual Setup

If you prefer to set up EZTest manually:

1. Clone the repository:
   ```bash
   git clone https://github.com/houseoffoss/eztest.git
   cd eztest
   ```

2. Follow the official setup instructions in the repository's README.

## Configuration

### Environment Variables

Edit the `.env` file to configure:

- **POSTGRES_PASSWORD**: Database password (change from default)
- **NEXTAUTH_SECRET**: Authentication secret (generate a secure random string)
- **NEXTAUTH_URL**: Your EZTest URL (default: http://localhost:3000)
- **AWS_ACCESS_KEY_ID** / **AWS_SECRET_ACCESS_KEY**: Optional, for S3 file storage

### Port Configuration

By default, EZTest runs on port 3000. To change it:

1. Edit `docker-compose.yml`
2. Change the port mapping: `"3000:3000"` to `"YOUR_PORT:3000"`
3. Update `NEXTAUTH_URL` in `.env`

## Using EZTest for LLM Testing

### Setting Up Test Projects

1. **Create a Project**:
   - Log in to EZTest
   - Create a new project (e.g., "Idea3 LLM Tests")

2. **Organize Test Suites**:
   - Create test suites for different LLM scenarios:
     - "OpenAI Tests"
     - "Anthropic Tests"
     - "Prompt Versioning"
     - "Model Comparison"

3. **Create Test Cases**:
   - For each LLM test scenario, create test cases with:
     - Test name
     - Description
     - Steps (prompt, model, parameters)
     - Expected results

### Managing LLM Test Runs

1. **Create Test Runs**:
   - Create test runs for different prompt versions
   - Track results for OpenAI vs Anthropic comparisons
   - Document token usage and costs

2. **Track Results**:
   - Record actual LLM outputs
   - Compare against expected results
   - Track pass/fail status

3. **Version Control**:
   - Use test suites to track different prompt versions
   - Compare results across versions

## Integration with Your Test Suite

### Linking EZTest with pytest

You can integrate EZTest with your existing pytest tests:

```python
# Example: test_llm_integration.py
import pytest
from app.services.llm_service import LLMService

def test_llm_generation_with_eztest_tracking():
    """
    Test LLM generation and track results in EZTest
    """
    service = LLMService(db_session)
    result = service.generate(
        prompt="Test prompt",
        provider="openai",
        model="gpt-4o-mini"
    )
    
    # Assert result
    assert result["content"] is not None
    
    # TODO: Add EZTest API integration to log test results
    # This would require EZTest API access
```

## Maintenance

### View Logs

```bash
docker-compose logs -f eztest
```

### Stop EZTest

```bash
docker-compose down
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U eztest eztest > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U eztest eztest < backup_YYYYMMDD.sql
```

### Update EZTest

```bash
cd source
git pull
cd ..
docker-compose up -d --build
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
1. Change the port in `docker-compose.yml`
2. Update `NEXTAUTH_URL` in `.env`

### Database Connection Issues

1. Check if PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check logs:
   ```bash
   docker-compose logs postgres
   ```

### Application Won't Start

1. Check logs:
   ```bash
   docker-compose logs eztest
   ```

2. Verify environment variables:
   ```bash
   docker-compose config
   ```

3. Rebuild containers:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Resources

- **Official Repository**: https://github.com/houseoffoss/eztest
- **Documentation**: https://www.houseoffoss.com/post/eztest-a-simple-open-source-test-management-platform-built-for-real-teams
- **Issues**: https://github.com/houseoffoss/eztest/issues

## Next Steps

1. Set up your first test project
2. Create test suites for your LLM workflows
3. Start tracking test cases and runs
4. Integrate with your existing test automation

For questions or issues, refer to the official EZTest documentation or GitHub repository.

