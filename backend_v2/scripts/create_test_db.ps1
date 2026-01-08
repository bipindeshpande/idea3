# PowerShell script to create test database
# This script connects to PostgreSQL and creates the test database

$dbName = "startup_discovery_test"
$dbUser = "startup_discovery"
$dbPassword = "startup_discovery_dev"
$dbHost = "localhost"
$dbPort = "5432"

# Try to connect as postgres superuser first, then fall back to application user
$superUser = "postgres"
$superPassword = Read-Host "Enter PostgreSQL superuser (postgres) password (or press Enter to use application user): " -AsSecureString

if ($superPassword.Length -eq 0) {
    Write-Host "Using application user credentials..."
    $psqlUser = $dbUser
    $psqlPassword = $dbPassword
} else {
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($superPassword)
    $psqlPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    $psqlUser = $superUser
}

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "Error: psql command not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "Alternatively, run the SQL script manually:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres -f scripts/create_test_db.sql" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating test database: $dbName" -ForegroundColor Green

# Create database
$env:PGPASSWORD = $psqlPassword
$createDbCmd = "CREATE DATABASE $dbName;"
echo $createDbCmd | & psql -h $dbHost -p $dbPort -U $psqlUser -d postgres

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully!" -ForegroundColor Green
    
    # Grant privileges
    Write-Host "Granting privileges to $dbUser..." -ForegroundColor Green
    $grantCmd = "GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;"
    echo $grantCmd | & psql -h $dbHost -p $dbPort -U $psqlUser -d postgres
    
    # Grant schema privileges
    $schemaGrantCmd = "GRANT ALL ON SCHEMA public TO $dbUser;"
    echo $schemaGrantCmd | & psql -h $dbHost -p $dbPort -U $psqlUser -d $dbName
    
    Write-Host "Test database setup complete!" -ForegroundColor Green
    Write-Host "Database URL: postgresql://$dbUser`:$dbPassword@$dbHost`:$dbPort/$dbName" -ForegroundColor Cyan
} else {
    Write-Host "Error creating database. It may already exist." -ForegroundColor Red
    Write-Host "If the database already exists, you can skip this step." -ForegroundColor Yellow
}

$env:PGPASSWORD = ""

