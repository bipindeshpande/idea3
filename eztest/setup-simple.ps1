# Simple EZTest Setup Script - Uses Official Docker Compose

Write-Host "Setting up EZTest using official configuration..." -ForegroundColor Green

# Navigate to source directory
Set-Location source

# Check if .env exists, create from example if not
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    if (Test-Path ".env.docker.example") {
        Copy-Item ".env.docker.example" ".env"
        Write-Host "SUCCESS: .env file created from example" -ForegroundColor Green
        Write-Host "Please edit .env file and set APP_PORT=3000 and DB_PORT=5433" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: .env.docker.example not found" -ForegroundColor Red
        exit 1
    }
}

# Set default ports if not set
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "APP_PORT=") {
    Add-Content ".env" "`nAPP_PORT=3000"
}
if ($envContent -notmatch "DB_PORT=") {
    Add-Content ".env" "`nDB_PORT=5433"
}

Write-Host "Starting EZTest containers..." -ForegroundColor Yellow
Write-Host "This may take several minutes on first run..." -ForegroundColor Yellow

docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: EZTest is starting up!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Container status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "Access EZTest at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Note: It may take 1-2 minutes for the app to be ready" -ForegroundColor Yellow
    Write-Host "Check logs with: docker-compose logs -f" -ForegroundColor Yellow
} else {
    Write-Host "ERROR: Failed to start containers" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

# Return to original directory
Set-Location ..

