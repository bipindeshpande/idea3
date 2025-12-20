# Color Restore Script
# This script restores original color values from backup files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Color Restore Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backupDir = "frontend\src\styles\backup"
$stylesDir = "frontend\src\styles"

# Check if backup directory exists
if (-not (Test-Path $backupDir)) {
    Write-Host "ERROR: Backup directory not found!" -ForegroundColor Red
    Write-Host "Location: $backupDir" -ForegroundColor Yellow
    exit 1
}

# Restore files
$files = @(
    @{Source = "theme.css.backup"; Target = "theme.css"},
    @{Source = "marketing-tokens.css.backup"; Target = "marketing-tokens.css"},
    @{Source = "marketing.css.backup"; Target = "marketing.css"}
)

Write-Host "Restoring color files..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    $sourcePath = Join-Path $backupDir $file.Source
    $targetPath = Join-Path $stylesDir $file.Target
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $targetPath -Force
        Write-Host "✓ Restored: $($file.Target)" -ForegroundColor Green
    } else {
        Write-Host "✗ Backup not found: $($file.Source)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restore Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: If you're on a git branch, you can also use:" -ForegroundColor Yellow
Write-Host "  git checkout master" -ForegroundColor White
Write-Host ""

