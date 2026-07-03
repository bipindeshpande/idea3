# cleanup_v1_scope_pass2.ps1
# Run this from inside: C:\outsideonedrive\projects\ideaaidlcv1
# Second pass - removes remaining test scripts, dist artifacts, and blog/template leftovers
# NOTE: Migration files are intentionally NOT deleted - see explanation in chat

$root = "C:\outsideonedrive\projects\ideaaidlcv1"
Set-Location $root

Write-Host "=== Pass 2: Backend test/script cleanup ===" -ForegroundColor Cyan

$backendFiles = @(
    "backend_v2\scripts\create_test_founders.py",
    "backend_v2\scripts\create_admin.py",
    "backend_v2\scripts\set_admin.py",
    "backend_v2\tests\integration\test_founder_api.py",
    "backend_v2\tests\integration\test_psyche_api.py",
    "backend_v2\tests\integration\test_admin_api.py",
    "backend_v2\tests\integration\test_frameworks_api.py",
    "backend_v2\tests\unit\test_founder_service.py"
)

foreach ($f in $backendFiles) {
    $path = Join-Path $root $f
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "Deleted: $f" -ForegroundColor Yellow
    } else {
        Write-Host "Not found (skipped): $f" -ForegroundColor DarkGray
    }
}

Write-Host "`n=== Pass 2: Frontend cleanup ===" -ForegroundColor Cyan

$frontendFolders = @(
    "frontend\dist",
    "frontend\public\templates",
    "frontend\src\utils\blog"
)
foreach ($f in $frontendFolders) {
    $path = Join-Path $root $f
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force
        Write-Host "Deleted folder: $f" -ForegroundColor Yellow
    } else {
        Write-Host "Not found (skipped): $f" -ForegroundColor DarkGray
    }
}

$frontendFiles = @(
    "frontend\src\data\marketing\templates.js",
    "frontend\src\components\marketing\BlogCard.jsx",
    "frontend\src\components\account\FrameworkSettingsSection.jsx"
)
foreach ($f in $frontendFiles) {
    $path = Join-Path $root $f
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "Deleted: $f" -ForegroundColor Yellow
    } else {
        Write-Host "Not found (skipped): $f" -ForegroundColor DarkGray
    }
}

Write-Host "`n=== Pass 2 cleanup complete ===" -ForegroundColor Green
Write-Host "NOTE: Migration files (009, 010, 011, 013, a8b9077d4af1) were left in place intentionally." -ForegroundColor Cyan
Write-Host "frontend/dist deleted - it will regenerate automatically when you run 'npm run build'." -ForegroundColor Cyan
