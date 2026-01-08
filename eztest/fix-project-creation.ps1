# Fix EZTest Project Creation Issue
# This script diagnoses and fixes common issues preventing project creation

Write-Host "🔍 Diagnosing EZTest Project Creation Issue..." -ForegroundColor Cyan
Write-Host ""

# Check if containers are running
Write-Host "1. Checking Docker containers..." -ForegroundColor Yellow
docker ps --filter "name=eztest" --format "table {{.Names}}\t{{.Status}}"

Write-Host ""
Write-Host "2. Checking database migrations..." -ForegroundColor Yellow
docker exec eztest-app npx prisma migrate status

Write-Host ""
Write-Host "3. Checking if database needs seeding (RBAC roles/permissions)..." -ForegroundColor Yellow
Write-Host "   Checking if roles exist in database..."

# Check if roles exist
$rolesCheck = docker exec eztest-postgres psql -U eztest -d eztest -t -c 'SELECT COUNT(*) FROM "Role";' 2>&1
$rolesCount = ($rolesCheck -replace '\s', '')
if ($rolesCount -eq "0") {
    Write-Host "   ⚠️  No roles found in database. Seeding may not have run." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Running database seed..." -ForegroundColor Yellow
    docker exec -e SEED_DATABASE=true eztest-app npx tsx prisma/seed.ts 2>&1 | Select-Object -Last 10
    
    Write-Host ""
    Write-Host "   Running RBAC seed..." -ForegroundColor Yellow
    docker exec eztest-app npx tsx prisma/seed-rbac.ts 2>&1 | Select-Object -Last 10
    
    Write-Host ""
    Write-Host "   Running dropdown options seed..." -ForegroundColor Yellow
    docker exec eztest-app npx tsx prisma/seed-dropdown-options.ts 2>&1 | Select-Object -Last 10
} else {
    Write-Host "   ✅ Roles exist in database" -ForegroundColor Green
}

Write-Host ""
Write-Host "5. Checking application logs for detailed errors..." -ForegroundColor Yellow
Write-Host "   Recent errors from app container:" -ForegroundColor Gray
docker logs eztest-app --tail=30 2>&1 | Select-String -Pattern "Error|error|Failed|failed" | Select-Object -Last 5

Write-Host ""
Write-Host "6. Checking environment variables..." -ForegroundColor Yellow
docker exec eztest-app printenv | Select-String -Pattern "DATABASE_URL|NEXTAUTH" | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

Write-Host ""
Write-Host "✅ Diagnostic complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Common fixes:" -ForegroundColor Cyan
Write-Host "1. If roles are missing, the seeding above should fix it." -ForegroundColor White
Write-Host "2. Restart the app container: docker restart eztest-app" -ForegroundColor White
Write-Host "3. Check browser console for detailed error messages." -ForegroundColor White
Write-Host "4. Ensure you're logged in with a user that has projects:create permission." -ForegroundColor White
Write-Host ""

