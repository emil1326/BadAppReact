# start.ps1 - launches BadAppReact frontend (Vite) + backend (Fastify)
# in a single Windows Terminal window with one tab per process.
#
# Usage:
#   .\start.ps1
# If execution policy blocks it:
#   powershell -ExecutionPolicy Bypass -File .\start.ps1

$ErrorActionPreference = 'Stop'

$root     = $PSScriptRoot
$frontend = Join-Path $root 'frontend'
$backend  = Join-Path $root 'backend'

if (-not (Test-Path $frontend)) { Write-Host "Frontend folder not found: $frontend" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $backend))  { Write-Host "Backend folder not found:  $backend"  -ForegroundColor Red; exit 1 }

if (-not (Get-Command wt -ErrorAction SilentlyContinue)) {
    Write-Host "Windows Terminal (wt.exe) not found. Install it from the Microsoft Store." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $frontend; npm install; Pop-Location
}
if (-not (Test-Path (Join-Path $backend 'node_modules'))) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location $backend; npm install; Pop-Location
}

Write-Host ""
Write-Host "Launching BadAppReact dev servers..." -ForegroundColor Cyan
Write-Host "  Frontend (Vite):    http://localhost:5173" -ForegroundColor Gray
Write-Host "  Backend  (Fastify): http://localhost:3001" -ForegroundColor Gray
Write-Host ""

# Open one wt window with two tabs. The backtick-semicolon (`;) escapes ;
# so PowerShell passes it to wt, which treats it as the tab separator.
wt new-tab --title "Frontend" -d "$frontend" powershell -NoExit -Command "npm run dev" `; new-tab --title "Backend" -d "$backend" powershell -NoExit -Command "npm run dev"
