# EZTest Setup Script for Windows PowerShell

Write-Host "Setting up EZTest..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again."
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "ERROR: Docker Compose is not available!" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    
    # Generate NEXTAUTH_SECRET
    $secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
    (Get-Content ".env") -replace 'NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32', "NEXTAUTH_SECRET=$secret" | Set-Content ".env"
    
    Write-Host "SUCCESS: .env file created with generated secret" -ForegroundColor Green
    Write-Host "WARNING: Please review and update .env file with your settings" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: .env file already exists" -ForegroundColor Green
}

# Clone EZTest source if not exists
if (-not (Test-Path "source")) {
    Write-Host "Cloning EZTest repository..." -ForegroundColor Yellow
    git clone https://github.com/houseoffoss/eztest.git source
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to clone repository" -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Repository cloned" -ForegroundColor Green
} else {
    Write-Host "SUCCESS: Source directory already exists" -ForegroundColor Green
}

# Copy necessary files from source to root for Docker build
Write-Host "Preparing files for Docker build..." -ForegroundColor Yellow
if (Test-Path "source/package.json") {
    Copy-Item "source/package.json" -Force
    Copy-Item "source/package-lock.json" -Force -ErrorAction SilentlyContinue
    Copy-Item "source/next.config.js" -Force -ErrorAction SilentlyContinue
    Copy-Item "source/tsconfig.json" -Force -ErrorAction SilentlyContinue
    Copy-Item "source/tailwind.config.js" -Force -ErrorAction SilentlyContinue
    Copy-Item "source/postcss.config.js" -Force -ErrorAction SilentlyContinue
    
    # Copy app and other necessary directories
    if (Test-Path "app") { Remove-Item "app" -Recurse -Force }
    if (Test-Path "public") { Remove-Item "public" -Recurse -Force }
    if (Test-Path "components") { Remove-Item "components" -Recurse -Force }
    if (Test-Path "lib") { Remove-Item "lib" -Recurse -Force }
    if (Test-Path "hooks") { Remove-Item "hooks" -Recurse -Force }
    if (Test-Path "types") { Remove-Item "types" -Recurse -Force }
    if (Test-Path "config") { Remove-Item "config" -Recurse -Force }
    
    Copy-Item "source/app" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "source/public" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "source/components" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "source/lib" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "source/hooks" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "source/types" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "source/config" -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "SUCCESS: Files prepared" -ForegroundColor Green
} else {
    Write-Host "WARNING: Source files not found. You may need to clone the repository manually." -ForegroundColor Yellow
}

# Build and start containers
Write-Host "Building and starting EZTest containers..." -ForegroundColor Yellow
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: EZTest setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Container status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "Access EZTest at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open http://localhost:3000 in your browser"
    Write-Host "2. Create your first test project"
    Write-Host "3. Start adding test cases for your LLM workflows"
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Yellow
    Write-Host "  View logs:    docker-compose logs -f"
    Write-Host "  Stop:         docker-compose down"
    Write-Host "  Restart:      docker-compose restart"
} else {
    Write-Host "ERROR: Failed to start containers" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
