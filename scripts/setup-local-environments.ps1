# Setup Local Multi-Environment Configuration
# This script creates environment files for Dev, QA, and UAT

Write-Host "🚀 Setting up local multi-environment configuration..." -ForegroundColor Green
Write-Host ""

$backendDir = "..\backend_v2"
$frontendDir = "..\frontend"

# Check if directories exist
if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Backend directory not found: $backendDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Frontend directory not found: $frontendDir" -ForegroundColor Red
    exit 1
}

# Backend environment files
Write-Host "📝 Creating backend environment files..." -ForegroundColor Yellow

# .env.dev
$envDev = @"
# Development Environment Variables
# DO NOT commit this file to version control

# Application
APP_NAME=Startup Discovery SaaS - DEV
APP_VERSION=2.0.0
ENVIRONMENT=development
DEBUG=true

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=dev_password_123
POSTGRES_DB=startup_discovery_dev
DATABASE_URL=postgresql://startup_discovery:dev_password_123@localhost:5432/startup_discovery_dev

# Redis
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379/0
REDIS_ENABLED=true

# LLM API Keys (replace with your actual keys)
OPENAI_API_KEY=sk-your-dev-key-here
ANTHROPIC_API_KEY=sk-ant-your-dev-key-here

# Default LLM Settings
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
MAX_TOKENS_STAGE1=2000
MAX_TOKENS_STAGE2=4000

# Security
SECRET_KEY=dev-secret-key-change-in-production-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOW_UNAUTHENTICATED=true

# CORS - Frontend domain
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:5175"]
FRONTEND_DOMAIN=http://localhost:5173

# Cache
CACHE_TTL_DISCOVERY=3600
CACHE_TTL_PROFILE=1800

# Pipeline
PARALLEL_EXECUTION=true
STAGE1_TIMEOUT=300

# Rate Limiting
RATE_LIMIT_ENABLED=false

# Logging
LOG_LEVEL=DEBUG
"@

# .env.qa
$envQa = @"
# QA Environment Variables
# DO NOT commit this file to version control

# Application
APP_NAME=Startup Discovery SaaS - QA
APP_VERSION=2.0.0
ENVIRONMENT=qa
DEBUG=false

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=qa_password_123
POSTGRES_DB=startup_discovery_qa
DATABASE_URL=postgresql://startup_discovery:qa_password_123@localhost:5433/startup_discovery_qa

# Redis
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6380/0
REDIS_ENABLED=true

# LLM API Keys (replace with your actual keys)
OPENAI_API_KEY=sk-your-qa-key-here
ANTHROPIC_API_KEY=sk-ant-your-qa-key-here

# Default LLM Settings
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
MAX_TOKENS_STAGE1=2000
MAX_TOKENS_STAGE2=4000

# Security
SECRET_KEY=qa-secret-key-generate-strong-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOW_UNAUTHENTICATED=false

# CORS - Frontend domain
CORS_ORIGINS=["http://localhost:5174"]
FRONTEND_DOMAIN=http://localhost:5174

# Cache
CACHE_TTL_DISCOVERY=604800
CACHE_TTL_PROFILE=86400

# Pipeline
PARALLEL_EXECUTION=true
STAGE1_TIMEOUT=300

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=INFO
"@

# .env.uat
$envUat = @"
# UAT Environment Variables
# DO NOT commit this file to version control

# Application
APP_NAME=Startup Discovery SaaS - UAT
APP_VERSION=2.0.0
ENVIRONMENT=uat
DEBUG=false

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=uat_password_123
POSTGRES_DB=startup_discovery_uat
DATABASE_URL=postgresql://localhost:5434/startup_discovery_uat

# Redis
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6381/0
REDIS_ENABLED=true

# LLM API Keys (replace with your actual keys)
OPENAI_API_KEY=sk-your-uat-key-here
ANTHROPIC_API_KEY=sk-ant-your-uat-key-here

# Default LLM Settings
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
MAX_TOKENS_STAGE1=2000
MAX_TOKENS_STAGE2=4000

# Security
SECRET_KEY=uat-secret-key-generate-strong-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOW_UNAUTHENTICATED=false

# CORS - Frontend domain
CORS_ORIGINS=["http://localhost:5175"]
FRONTEND_DOMAIN=http://localhost:5175

# Cache
CACHE_TTL_DISCOVERY=604800
CACHE_TTL_PROFILE=86400

# Pipeline
PARALLEL_EXECUTION=true
STAGE1_TIMEOUT=300

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=INFO
"@

# Write backend files
$backendDevPath = Join-Path $backendDir ".env.dev"
$backendQaPath = Join-Path $backendDir ".env.qa"
$backendUatPath = Join-Path $backendDir ".env.uat"

if (-not (Test-Path $backendDevPath)) {
    $envDev | Out-File -FilePath $backendDevPath -Encoding utf8
    Write-Host "✅ Created $backendDevPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  File exists: $backendDevPath (skipping)" -ForegroundColor Yellow
}

if (-not (Test-Path $backendQaPath)) {
    $envQa | Out-File -FilePath $backendQaPath -Encoding utf8
    Write-Host "✅ Created $backendQaPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  File exists: $backendQaPath (skipping)" -ForegroundColor Yellow
}

if (-not (Test-Path $backendUatPath)) {
    $envUat | Out-File -FilePath $backendUatPath -Encoding utf8
    Write-Host "✅ Created $backendUatPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  File exists: $backendUatPath (skipping)" -ForegroundColor Yellow
}

# Frontend environment files
Write-Host ""
Write-Host "📝 Creating frontend environment files..." -ForegroundColor Yellow

$frontendDev = "VITE_API_URL=http://localhost:8000`nVITE_ENVIRONMENT=development"
$frontendQa = "VITE_API_URL=http://localhost:8001`nVITE_ENVIRONMENT=qa"
$frontendUat = "VITE_API_URL=http://localhost:8002`nVITE_ENVIRONMENT=uat"

$frontendDevPath = Join-Path $frontendDir ".env.dev"
$frontendQaPath = Join-Path $frontendDir ".env.qa"
$frontendUatPath = Join-Path $frontendDir ".env.uat"

if (-not (Test-Path $frontendDevPath)) {
    $frontendDev | Out-File -FilePath $frontendDevPath -Encoding utf8
    Write-Host "✅ Created $frontendDevPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  File exists: $frontendDevPath (skipping)" -ForegroundColor Yellow
}

if (-not (Test-Path $frontendQaPath)) {
    $frontendQa | Out-File -FilePath $frontendQaPath -Encoding utf8
    Write-Host "✅ Created $frontendQaPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  File exists: $frontendQaPath (skipping)" -ForegroundColor Yellow
}

if (-not (Test-Path $frontendUatPath)) {
    $frontendUat | Out-File -FilePath $frontendUatPath -Encoding utf8
    Write-Host "✅ Created $frontendUatPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  File exists: $frontendUatPath (skipping)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit the .env files and add your actual API keys" -ForegroundColor White
Write-Host "2. Create docker-compose files (see docs/LOCAL_MULTI_ENVIRONMENT_SETUP.md)" -ForegroundColor White
Write-Host "3. Start your environments:" -ForegroundColor White
Write-Host "   - Dev:   docker-compose -f docker-compose.dev.yml --env-file .env.dev up" -ForegroundColor Gray
Write-Host "   - QA:    docker-compose -f docker-compose.qa.yml --env-file .env.qa up" -ForegroundColor Gray
Write-Host "   - UAT:   docker-compose -f docker-compose.uat.yml --env-file .env.uat up" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 See docs/LOCAL_MULTI_ENVIRONMENT_SETUP.md for full instructions" -ForegroundColor Cyan

