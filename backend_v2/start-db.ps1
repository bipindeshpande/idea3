# PowerShell script to start PostgreSQL Docker container
# Checks port availability and sets POSTGRES_PORT accordingly

Write-Host "Checking port availability..."

$port = 5432
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "Port 5432 is occupied. Using port 5433 instead."
    $env:POSTGRES_PORT = "5433"
} else {
    Write-Host "Port 5432 is available."
    $env:POSTGRES_PORT = "5432"
}

Write-Host "Starting PostgreSQL container on port $env:POSTGRES_PORT..."
docker-compose up -d postgres

Write-Host "Waiting for database to be ready..."
Start-Sleep -Seconds 5

# Check if container is running
$containerStatus = docker ps --filter "name=idea3_postgres" --format "{{.Status}}"
if ($containerStatus) {
    Write-Host "✓ PostgreSQL container is running: $containerStatus"
    Write-Host "✓ Database URL: postgresql://startup_discovery:startup_discovery_dev@localhost:$env:POSTGRES_PORT/startup_discovery"
} else {
    Write-Host "✗ Container failed to start. Check logs with: docker-compose logs idea3_postgres"
}

