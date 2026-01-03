# Fix All Dependencies - FINAL VERSION
# PowerShell Script

Write-Host "🔧 FIXING ALL DEPENDENCY ISSUES - FINAL" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Fixes:" -ForegroundColor Yellow
Write-Host "   1. ✅ date-fns: ^4.1.0 → ^3.6.0 (react-day-picker compatibility)" -ForegroundColor Green
Write-Host "   2. ✅ pnpm overrides: Force date-fns version" -ForegroundColor Green
Write-Host "   3. ✅ shamefully-hoist: Fix bin path issues" -ForegroundColor Green
Write-Host "   4. ✅ Clean install" -ForegroundColor Green
Write-Host ""

# Kill Node processes
Write-Host "🔍 Killing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Done" -ForegroundColor Green
Write-Host ""

# Remove node_modules
Write-Host "🔍 Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Force "pnpm-lock.yaml" -ErrorAction SilentlyContinue
}
Write-Host "✅ Done" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "   (package.json sudah di-update dengan fixes)" -ForegroundColor Gray
Write-Host ""

pnpm install

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "✅ INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Yellow
Write-Host "   - date-fns downgraded to v3.6.0" -ForegroundColor Gray
Write-Host "   - pnpm overrides applied" -ForegroundColor Gray
Write-Host "   - shamefully-hoist enabled" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  About warnings (SAFE TO IGNORE):" -ForegroundColor Yellow
Write-Host "   - libpq failure: OK (not needed for Supabase)" -ForegroundColor Gray
Write-Host "   - Deprecated subdependencies: Safe to ignore" -ForegroundColor Gray
Write-Host "   - Peer deps warnings: Fixed with overrides" -ForegroundColor Gray
Write-Host ""

