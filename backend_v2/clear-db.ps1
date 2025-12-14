# PowerShell script to clear all database data and restart

Write-Host "⚠️  WARNING: This will delete ALL database data!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to cancel, or Enter to continue..."
Read-Host

Write-Host "Stopping containers..." -ForegroundColor Cyan
docker-compose down

Write-Host "Removing PostgreSQL volume..." -ForegroundColor Cyan
docker volume rm idea2_postgres_data 2>$null
if ($LASTEXITCODE -ne 0) {
    docker volume rm backend_v2_postgres_data 2>$null
}

Write-Host "Removing Redis volume (optional)..." -ForegroundColor Cyan
docker volume rm idea2_redis_data 2>$null
if ($LASTEXITCODE -ne 0) {
    docker volume rm backend_v2_redis_data 2>$null
}

Write-Host "Starting containers..." -ForegroundColor Cyan
docker-compose up -d postgres redis

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "Running migrations..." -ForegroundColor Cyan
Set-Location backend_v2
alembic upgrade head

Write-Host "✅ Database cleared and restarted!" -ForegroundColor Green
Write-Host "You can now start the backend: uvicorn app.main:app --reload" -ForegroundColor Green

