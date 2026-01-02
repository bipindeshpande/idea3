# Start Frontend Server
Write-Host "=== Starting Frontend Dev Server ===" -ForegroundColor Green
Write-Host "Server will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
cd $PSScriptRoot
npm run dev

