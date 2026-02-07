# 🛸 ORBIT Installer (Windows PowerShell)
# Installs ORBIT globally using npm link

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🛸 ORBIT Installer" -ForegroundColor Cyan
Write-Host "=================="
Write-Host ""

# Check Node.js
try {
    $nodeVersion = (node -v) -replace 'v', '' -split '\.' | Select-Object -First 1
    if ([int]$nodeVersion -lt 16) {
        Write-Host "❌ Node.js $nodeVersion found, requires 16+" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found. Install Node.js 16+ first:" -ForegroundColor Red
    Write-Host "   https://nodejs.org/"
    exit 1
}

$orbitDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $orbitDir

Write-Host "📦 Installing dependencies..."
npm install

Write-Host "🔨 Building..."
npm run build

Write-Host "🔗 Linking globally..."
npm link

# Check if npm global bin is in PATH
$npmBin = (npm config get prefix) + "\node_modules\.bin"
$npmPrefix = npm config get prefix
if (-not ($env:Path -like "*$npmPrefix*")) {
    Write-Host ""
    Write-Host "⚠️  npm global bin may not be in your PATH." -ForegroundColor Yellow
    Write-Host "   Add this to your PATH:" -ForegroundColor Yellow
    Write-Host "   $npmPrefix" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "✅ ORBIT installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Run: " -NoNewline
Write-Host "orbit --help" -ForegroundColor Green
