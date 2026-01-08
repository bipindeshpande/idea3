# Reset Database Script - Clears all data (preserves schema) and optionally seeds with test data
# Usage: .\reset-db.ps1 [--seed]

param(
    [switch]$Seed = $false
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Database Reset Script (Data Only - Schema Preserved)" -ForegroundColor Cyan
Write-Host ""

# Check if docker-compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: docker-compose not found. Please install Docker first." -ForegroundColor Red
    exit 1
}

# Check if containers are running
$containersRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "postgres|redis|backend"
if ($containersRunning) {
    Write-Host "WARNING: This will delete ALL database data (schema will be preserved)!" -ForegroundColor Yellow
    Write-Host "Press Enter to continue, or Ctrl+C to cancel..." -ForegroundColor Yellow
    Read-Host
} else {
    Write-Host "INFO: Starting database containers..." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Step 1: Ensuring database is running..." -ForegroundColor Cyan
docker-compose up -d postgres redis

Write-Host "Step 2: Waiting for database to be ready..." -ForegroundColor Cyan
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
    Write-Host "ERROR: Database failed to start. Please check logs: docker-compose logs postgres" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Database is ready!" -ForegroundColor Green

Write-Host "Step 3: Clearing all data (preserving schema)..." -ForegroundColor Cyan

# Create Python script to truncate all tables (except alembic_version)
$clearDataScript = @'
from app.core.database import engine
from sqlalchemy import text, inspect

# Get all table names
inspector = inspect(engine)
table_names = inspector.get_table_names()

# Exclude alembic_version table to preserve migration state
data_tables = [t for t in table_names if t != 'alembic_version']

if not data_tables:
    print('No data tables found in database.')
else:
    with engine.begin() as conn:
        # Disable foreign key checks temporarily (PostgreSQL)
        conn.execute(text('SET session_replication_role = replica;'))
        
        # Truncate all data tables (preserving alembic_version)
        for table_name in data_tables:
            try:
                conn.execute(text(f'TRUNCATE TABLE "{table_name}" RESTART IDENTITY CASCADE;'))
                print(f'Cleared table: {table_name}')
            except Exception as e:
                print(f'Warning: Could not clear {table_name}: {e}')
        
        # Re-enable foreign key checks
        conn.execute(text('SET session_replication_role = DEFAULT;'))
    
    print(f'SUCCESS: Cleared {len(data_tables)} table(s) (alembic_version preserved)')
'@

# Write script to temp file
$tempClearFile = Join-Path $PSScriptRoot "temp_clear_data.py"
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

Write-Host "SUCCESS: All data cleared (schema preserved)!" -ForegroundColor Green

Write-Host "Step 4: Checking migration state..." -ForegroundColor Cyan

# Check if alembic_version table exists and has a version
$checkMigrationScript = @'
from app.core.database import engine
from sqlalchemy import text, inspect

try:
    with engine.connect() as conn:
        # Check if alembic_version table exists
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        # Filter out alembic_version from user tables
        user_tables = [t for t in tables if t != 'alembic_version']
        
        if 'alembic_version' in tables:
            # Check if there's a version recorded
            result = conn.execute(text('SELECT version_num FROM alembic_version LIMIT 1;'))
            row = result.fetchone()
            if row:
                print(f'Current migration version: {row[0]}')
                print('MIGRATION_VERSION_EXISTS')
            else:
                if user_tables:
                    print('Alembic version table exists but is empty, and user tables exist')
                    print('NEEDS_STAMP')
                else:
                    print('Alembic version table exists but is empty, no user tables')
                    print('NO_STAMP_NEEDED')
        else:
            if user_tables:
                print(f'Alembic version table does not exist, but {len(user_tables)} user table(s) exist')
                print('NEEDS_STAMP')
            else:
                print('Alembic version table does not exist, no user tables')
                print('NO_STAMP_NEEDED')
except Exception as e:
    print(f'Error checking migration state: {e}')
    print('NEEDS_STAMP')
'@

$tempCheckFile = Join-Path $PSScriptRoot "temp_check_migration.py"
$checkMigrationScript | Out-File -FilePath $tempCheckFile -Encoding utf8

$migrationState = ""
try {
    # Suppress error output and capture stdout only
    $ErrorActionPreference = "Continue"
    $output = Get-Content $tempCheckFile -Raw | docker-compose run --rm -T backend python - 2>$null
    
    # Check for migration state markers in output
    if ($output -match "MIGRATION_VERSION_EXISTS") {
        $migrationState = "EXISTS"
    } elseif ($output -match "NEEDS_STAMP") {
        $migrationState = "NEEDS_STAMP"
    } elseif ($output -match "NO_STAMP_NEEDED") {
        $migrationState = "NO_STAMP_NEEDED"
    } else {
        # Default to checking if we need to stamp
        $migrationState = "NEEDS_STAMP"
    }
    
    # Display relevant output (filter out empty lines)
    $lines = $output -split "`n" | Where-Object { $_.Trim() -ne "" }
    foreach ($line in $lines) {
        if ($line -match "Current migration version|Alembic|table|Error checking|SUCCESS|WARNING") {
            Write-Host $line
        }
    }
} catch {
    # If there's an actual error, default to needing stamp
    Write-Host "Warning: Could not check migration state, will attempt to stamp if needed" -ForegroundColor Yellow
    $migrationState = "NEEDS_STAMP"
} finally {
    $ErrorActionPreference = "Stop"
    if (Test-Path $tempCheckFile) {
        Remove-Item $tempCheckFile -ErrorAction SilentlyContinue
    }
}

Write-Host "Step 5: Ensuring migrations are up to date..." -ForegroundColor Cyan

if ($migrationState -eq "NEEDS_STAMP") {
    # Stamp the database with the current head version (tables already exist but no version recorded)
    Write-Host "Stamping database with current migration version..." -ForegroundColor Yellow
    docker-compose run --rm backend alembic stamp head
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Failed to stamp database. Trying upgrade anyway..." -ForegroundColor Yellow
    }
} elseif ($migrationState -eq "NO_STAMP_NEEDED") {
    Write-Host "No tables exist yet. Migrations will create them..." -ForegroundColor Cyan
}

# Run upgrade (should be idempotent if already at head)
docker-compose run --rm backend alembic upgrade head

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Migrations failed. Please check logs." -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Migrations completed!" -ForegroundColor Green

if ($Seed) {
    Write-Host ""
    Write-Host "Step 6: Seeding database with test data..." -ForegroundColor Cyan
    
    # Check if seed script exists
    $seedScriptPath = Join-Path $PSScriptRoot "scripts\seed-db.ps1"
    if (Test-Path $seedScriptPath) {
        & $seedScriptPath
    } else {
        Write-Host "WARNING: Seed script not found. Creating basic test user..." -ForegroundColor Yellow
        
        # Create a simple test user via Python script
        # Write Python script line by line using single quotes to avoid PowerShell parsing
        $tempFile = Join-Path $PSScriptRoot "temp_seed.py"
        $pythonLines = @(
            'from app.core.database import SessionLocal',
            'from app.models.user import User',
            'from app.services.auth_service import AuthService',
            'import uuid',
            '',
            'db = SessionLocal()',
            'try:',
            '    # Check if test user exists',
            "    test_user = db.query(User).filter(User.email == 'test@example.com').first()",
            '    if not test_user:',
            '        user = User(',
            '            user_id=str(uuid.uuid4()),',
            "            email='test@example.com',",
            "            hashed_password=AuthService.get_password_hash('test123'),",
            "            full_name='Test User',",
            '            is_active=True,',
            '            is_verified=True,',
            "            subscription_type='premium',",
            "            role='user'",
            '        )',
            '        db.add(user)',
            '        db.commit()',
            "        print('Test user created: test@example.com / test123')",
            '    else:',
            "        print('Test user already exists')",
            'finally:',
            '    db.close()'
        )
        $pythonLines | Out-File -FilePath $tempFile -Encoding utf8
        
        try {
            # Execute Python script via stdin
            Get-Content $tempFile -Raw | docker-compose run --rm -T backend python -
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "ERROR: Seeding failed. Please check logs." -ForegroundColor Red
                exit 1
            }
        } finally {
            # Clean up temp file
            if (Test-Path $tempFile) {
                Remove-Item $tempFile -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host ""
Write-Host "SUCCESS: Database reset complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend: docker-compose up -d backend" -ForegroundColor White
Write-Host "  2. View logs: docker-compose logs -f backend" -ForegroundColor White
if ($Seed) {
    Write-Host "  3. Test login: test@example.com / test123" -ForegroundColor White
}
Write-Host ""

