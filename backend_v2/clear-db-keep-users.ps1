# Clear Database Script - Clears all data except users table
# Usage: .\clear-db-keep-users.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Clearing Database (Preserving Users)" -ForegroundColor Cyan
Write-Host ""

# Check if database is running
$dbRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "postgres"
if (-not $dbRunning) {
    Write-Host "ERROR: Database is not running. Please start it first:" -ForegroundColor Red
    Write-Host "   docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Waiting for database to be ready..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts -and -not $dbReady) {
    Start-Sleep -Seconds 1
    $attempt++
    try {
        docker-compose exec -T postgres pg_isready -U startup_discovery 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
        }
    } catch {
        # Continue waiting
    }
}

if (-not $dbReady) {
    Write-Host "ERROR: Database is not ready. Please check logs: docker-compose logs postgres" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Database is ready!" -ForegroundColor Green

Write-Host "Step 2: Clearing all data (preserving users table and schema)..." -ForegroundColor Cyan

# Create Python script to truncate all tables except users and alembic_version
$clearDataScript = @'
from app.core.database import engine
from sqlalchemy import text, inspect

# Get all table names
inspector = inspect(engine)
table_names = inspector.get_table_names()

# Exclude users table and alembic_version table
preserved_tables = ['users', 'alembic_version']
data_tables = [t for t in table_names if t not in preserved_tables]

if not data_tables:
    print('No data tables to clear (only preserved tables found).')
else:
    with engine.begin() as conn:
        # Disable foreign key checks temporarily (PostgreSQL)
        conn.execute(text('SET session_replication_role = replica;'))
        
        # Truncate all data tables except users
        for table_name in data_tables:
            try:
                conn.execute(text(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE;'))
                print(f'Cleared table: {table_name}')
            except Exception as e:
                print(f'Warning: Could not clear {table_name}: {e}')
        
        # Re-enable foreign key checks
        conn.execute(text('SET session_replication_role = DEFAULT;'))
    
    print(f'SUCCESS: Cleared {len(data_tables)} table(s) (users and alembic_version preserved)')
    print(f'Preserved tables: {", ".join(preserved_tables)}')
'@

# Write script to temp file
$tempClearFile = Join-Path $PSScriptRoot "temp_clear_keep_users.py"
$clearDataScript | Out-File -FilePath $tempClearFile -Encoding utf8

try {
    # Execute Python script via stdin
    Get-Content $tempClearFile -Raw | docker-compose run --rm -T backend python -
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to clear data. Please check logs." -ForegroundColor Red
        exit 1
    }
} finally {
    # Clean up temp file
    if (Test-Path $tempClearFile) {
        Remove-Item $tempClearFile -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "SUCCESS: Database cleared! Users table and schema preserved." -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next Step: Clear LocalStorage in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Open the clear tool in your browser:" -ForegroundColor Cyan
Write-Host "   Navigate to: http://localhost:5173/clear-localStorage.html" -ForegroundColor White
Write-Host "   (Make sure frontend dev server is running)" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Use browser console (F12) and run:" -ForegroundColor Cyan
Write-Host "   clearAppLocalStorage()" -ForegroundColor White
Write-Host ""
Write-Host "Option 3: Manually clear in browser DevTools:" -ForegroundColor Cyan
Write-Host "   Press F12 > Application tab > Local Storage > Clear All" -ForegroundColor White
Write-Host ""

