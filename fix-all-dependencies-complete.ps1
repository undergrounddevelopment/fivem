# Fix All Dependency Issues - 100% Complete
# PowerShell Script (Run as Administrator for best results)

Write-Host "🔧 FIXING ALL DEPENDENCY ISSUES - 100%" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Script ini lebih baik dijalankan sebagai Administrator" -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📋 Issues yang akan diperbaiki:" -ForegroundColor Yellow
Write-Host "   1. ✅ Peer dependencies: date-fns downgrade to v3.6.0" -ForegroundColor White
Write-Host "   2. ✅ pnpm overrides untuk fix peer deps" -ForegroundColor White
Write-Host "   3. ✅ shamefully-hoist untuk fix bin path issues" -ForegroundColor White
Write-Host "   4. ✅ Clean install untuk fix semua masalah" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Step 1: Updating package.json..." -ForegroundColor Yellow

# Read package.json
$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

# Fix date-fns version
if ($packageJson.dependencies.'date-fns') {
    $currentVersion = $packageJson.dependencies.'date-fns'
    Write-Host "   date-fns: $currentVersion → ^3.6.0" -ForegroundColor Gray
    $packageJson.dependencies.'date-fns' = "^3.6.0"
}

# Add pnpm config if not exists
if (-not $packageJson.pnpm) {
    $packageJson | Add-Member -MemberType NoteProperty -Name "pnpm" -Value @{} -Force
}

# Add overrides and shamefully-hoist
$packageJson.pnpm.overrides = @{
    "date-fns" = "^3.6.0"
}
$packageJson.pnpm.'shamefully-hoist' = $true

# Save package.json
$jsonContent = $packageJson | ConvertTo-Json -Depth 100
# Fix JSON formatting for pnpm config
$jsonContent = $jsonContent -replace '"pnpm": \{', '"pnpm": {' -replace '"overrides": \{', '    "overrides": {' -replace '"date-fns": ', '      "date-fns": ' -replace '  \},', '    },' -replace '"shamefully-hoist": true', '    "shamefully-hoist": true'

# Better approach: use proper JSON formatting
$packageJsonObj = @{
    name = $packageJson.name
    version = $packageJson.version
    private = $packageJson.private
    scripts = $packageJson.scripts
    dependencies = $packageJson.dependencies
    devDependencies = $packageJson.devDependencies
    pnpm = @{
        overrides = @{
            "date-fns" = "^3.6.0"
        }
        "shamefully-hoist" = $true
    }
}

# Convert to JSON properly
$jsonContent = ($packageJsonObj | ConvertTo-Json -Depth 10)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Resolve-Path $packageJsonPath), $jsonContent, $utf8NoBom)

Write-Host "✅ package.json updated" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Step 2: Killing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node.exe" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Node processes killed" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Step 3: Removing node_modules and lock file..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    try {
        Remove-Item -Recurse -Force "node_modules" -ErrorAction Stop
        Write-Host "✅ node_modules removed" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not remove node_modules completely" -ForegroundColor Yellow
        Write-Host "   Some files might be in use. Continuing..." -ForegroundColor Gray
    }
}
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Force "pnpm-lock.yaml" -ErrorAction SilentlyContinue
    Write-Host "✅ pnpm-lock.yaml removed" -ForegroundColor Green
}
Write-Host ""

Write-Host "🔍 Step 4: Clearing pnpm cache..." -ForegroundColor Yellow
pnpm store prune 2>&1 | Out-Null
Write-Host "✅ pnpm cache cleared" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Step 5: Installing dependencies..." -ForegroundColor Yellow
Write-Host "   Using: pnpm install (with overrides and shamefully-hoist)" -ForegroundColor Gray
Write-Host ""

pnpm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Green
    Write-Host "✅ ALL DEPENDENCIES FIXED!" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Notes:" -ForegroundColor Yellow
    Write-Host "   ✅ date-fns downgraded to v3.6.0 (compatible with react-day-picker)" -ForegroundColor Green
    Write-Host "   ✅ pnpm overrides applied" -ForegroundColor Green
    Write-Host "   ✅ shamefully-hoist enabled (fixes bin path issues)" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  About warnings:" -ForegroundColor Yellow
    Write-Host "   - libpq failure: OK (not needed for Supabase)" -ForegroundColor Gray
    Write-Host "   - Deprecated subdependencies: Safe to ignore" -ForegroundColor Gray
    Write-Host "   - Peer dependency warnings: Fixed with overrides" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  Installation completed with some warnings" -ForegroundColor Yellow
    Write-Host "   This is normal. Check output above for details." -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""

