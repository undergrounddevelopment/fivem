# Fix pnpm EPERM Error
# PowerShell Script (Run as Administrator)

Write-Host "🔧 FIXING pnpm EPERM ERROR" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Script ini lebih baik dijalankan sebagai Administrator" -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit
    }
    Write-Host ""
}

Write-Host "🔍 Step 1: Killing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node.exe" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Node processes killed" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Step 2: Killing pnpm processes..." -ForegroundColor Yellow
Get-Process -Name pnpm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "✅ pnpm processes killed" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Step 3: Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    try {
        Remove-Item -Recurse -Force "node_modules" -ErrorAction Stop
        Write-Host "✅ node_modules removed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not remove node_modules (might be in use)" -ForegroundColor Yellow
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Try closing all terminals and editors, then run this script again" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ node_modules not found (already removed)" -ForegroundColor Green
}
Write-Host ""

Write-Host "🔍 Step 4: Removing .pnpm-store..." -ForegroundColor Yellow
if (Test-Path ".pnpm-store") {
    Remove-Item -Recurse -Force ".pnpm-store" -ErrorAction SilentlyContinue
    Write-Host "✅ .pnpm-store removed" -ForegroundColor Green
} else {
    Write-Host "✅ .pnpm-store not found" -ForegroundColor Green
}
Write-Host ""

Write-Host "🔍 Step 5: Clearing pnpm cache..." -ForegroundColor Yellow
pnpm store prune 2>&1 | Out-Null
Write-Host "✅ pnpm cache cleared" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Step 6: Removing lock file..." -ForegroundColor Yellow
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Force "pnpm-lock.yaml" -ErrorAction SilentlyContinue
    Write-Host "✅ pnpm-lock.yaml removed" -ForegroundColor Green
} else {
    Write-Host "✅ pnpm-lock.yaml not found" -ForegroundColor Green
}
Write-Host ""

Write-Host "🔍 Step 7: Checking for file locks on lightningcss..." -ForegroundColor Yellow
$lightningPath = "node_modules\.pnpm\lightningcss-win32-x64-msvc@1.30.2\node_modules\lightningcss-win32-x64-msvc\lightningcss.win32-x64-msvc.node"
if (Test-Path $lightningPath) {
    Write-Host "⚠️  lightningcss file still exists, trying to remove..." -ForegroundColor Yellow
    try {
        Remove-Item -Force -Path $lightningPath -ErrorAction Stop
        Write-Host "✅ lightningcss file removed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not remove lightningcss file" -ForegroundColor Yellow
        Write-Host "   This is OK if node_modules will be removed" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "=" * 50 -ForegroundColor Green
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Now you can reinstall:" -ForegroundColor Yellow
Write-Host "   pnpm install" -ForegroundColor Cyan
Write-Host ""

$reinstall = Read-Host "Install now? (Y/N)"
if ($reinstall -eq "Y" -or $reinstall -eq "y") {
    Write-Host ""
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Installation successful!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Installation failed. Try running as Administrator." -ForegroundColor Red
    }
}

Write-Host ""

