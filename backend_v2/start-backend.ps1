# Start Backend Server
Write-Host "=== Starting Backend Server ===" -ForegroundColor Green
Write-Host "Server will run on: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
cd $PSScriptRoot
python run.py

