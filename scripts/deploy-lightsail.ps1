# AWS Lightsail Deployment Script (PowerShell)
# Run this script on your Lightsail instance after initial setup (via WSL or Linux)

Write-Host "🚀 Starting deployment to AWS Lightsail..." -ForegroundColor Green

$ErrorActionPreference = "Stop"

# Check if running as root
if ($env:USER -eq "root") {
    Write-Host "❌ Please don't run as root. Use your ubuntu user." -ForegroundColor Red
    exit 1
}

# Navigate to app directory
$APP_DIR = "$HOME/app"
$BACKEND_DIR = "$APP_DIR/backend_v2"
$FRONTEND_DIR = "$APP_DIR/frontend"

if (-not (Test-Path $APP_DIR)) {
    Write-Host "⚠️  App directory not found. Creating..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $APP_DIR -Force | Out-Null
}

Set-Location $APP_DIR

# Check if production.env exists
if (-not (Test-Path "$BACKEND_DIR/production.env")) {
    Write-Host "❌ production.env not found!" -ForegroundColor Red
    Write-Host "Please create it from production.env.example first:"
    Write-Host "  cd $BACKEND_DIR"
    Write-Host "  cp production.env.example production.env"
    Write-Host "  nano production.env"
    exit 1
}

# Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Green
if (Test-Path $FRONTEND_DIR) {
    Set-Location $FRONTEND_DIR
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing npm dependencies..."
        npm install
    }
    
    Write-Host "Building production bundle..."
    npm run build
    
    if (-not (Test-Path "dist")) {
        Write-Host "❌ Frontend build failed! dist/ directory not found." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend directory not found. Skipping frontend build." -ForegroundColor Yellow
}

# Navigate to backend
Set-Location $BACKEND_DIR

# Check Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker or check your installation."
    exit 1
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml down 2>&1 | Out-Null

# Start PostgreSQL first
Write-Host "🗄️  Starting PostgreSQL..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
Start-Sleep -Seconds 10

# Check if PostgreSQL is healthy
$postgresReady = $false
for ($i = 1; $i -le 30; $i++) {
    $result = docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U startup_discovery 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
        $postgresReady = $true
        break
    }
    Start-Sleep -Seconds 2
}

if (-not $postgresReady) {
    Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
}

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# Start Redis
Write-Host "📦 Starting Redis..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d redis

# Wait for Redis
Start-Sleep -Seconds 5

# Start all services
Write-Host "🚀 Starting all services..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 15

# Check health
Write-Host "🏥 Checking service health..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend health check failed. Check logs:" -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml logs backend | Select-Object -Last 20
}

# Show container status
Write-Host "📊 Container status:" -ForegroundColor Green
docker-compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Check logs: cd $BACKEND_DIR && docker-compose -f docker-compose.prod.yml logs -f"
Write-Host "2. Test API: curl http://localhost:8000/health"
Write-Host "3. Configure firewall in Lightsail console (ports 80, 443)"
Write-Host "4. Set up domain and SSL certificate"

