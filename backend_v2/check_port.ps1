# PowerShell script to check if port 5432 is available and set POSTGRES_PORT
$port = 5432
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "Port 5432 is occupied. Using port 5433 instead."
    $env:POSTGRES_PORT = "5433"
} else {
    Write-Host "Port 5432 is available."
    $env:POSTGRES_PORT = "5432"
}

Write-Host "POSTGRES_PORT set to: $env:POSTGRES_PORT"

