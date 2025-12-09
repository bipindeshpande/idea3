# Production deployment script for Windows PowerShell

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting production deployment..." -ForegroundColor Green

# Check if production.env exists
if (-not (Test-Path "production.env")) {
    Write-Host "❌ Error: production.env file not found!" -ForegroundColor Red
    Write-Host "   Please copy production.env.example to production.env and fill in values." -ForegroundColor Yellow
    exit 1
}

# Check if SSL certificates exist
if (-not (Test-Path "nginx/ssl/fullchain.pem") -or -not (Test-Path "nginx/ssl/privkey.pem")) {
    Write-Host "⚠️  Warning: SSL certificates not found in nginx/ssl/" -ForegroundColor Yellow
    Write-Host "   Using self-signed certificates for testing (NOT for production!)" -ForegroundColor Yellow
    Write-Host "   For production, use Let's Encrypt certbot or place your certificates." -ForegroundColor Yellow
    
    # Create self-signed cert for testing (remove in production)
    if (-not (Test-Path "nginx/ssl/fullchain.pem")) {
        New-Item -ItemType Directory -Force -Path "nginx/ssl" | Out-Null
        # Note: Windows doesn't have openssl by default, so this is a placeholder
        Write-Host "   Please generate SSL certificates manually or use certbot" -ForegroundColor Yellow
    }
}

# Build frontend (if frontend directory exists)
if (Test-Path "../frontend") {
    Write-Host "📦 Building frontend..." -ForegroundColor Cyan
    Push-Location "../frontend"
    npm run build
    Pop-Location
    
    # Ensure dist directory exists
    New-Item -ItemType Directory -Force -Path "frontend/dist" | Out-Null
    Copy-Item -Path "../frontend/dist/*" -Destination "frontend/dist/" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Frontend build copied" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend directory not found. Skipping frontend build." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "frontend/dist" | Out-Null
}

# Pull latest images
Write-Host "📥 Pulling latest images..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml pull

# Build images
Write-Host "🔨 Building images..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml build --no-cache

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check health
Write-Host "🏥 Checking service health..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  - Backend: http://localhost/api/health"
Write-Host "  - Frontend: https://localhost"
Write-Host "  - Admin: https://localhost/api/admin/metrics"
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.prod.yml logs -f"

