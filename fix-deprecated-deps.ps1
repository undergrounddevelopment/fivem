# Fix Deprecated Dependencies Warning
# PowerShell Script

Write-Host "🔍 CHECKING DEPRECATED DEPENDENCIES" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  Warning: whatwg-encoding@3.1.1 is deprecated" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Info:" -ForegroundColor Cyan
Write-Host "   - This is a SUBDEPENDENCY (dependency dari package lain)" -ForegroundColor White
Write-Host "   - NOT a direct dependency of your project" -ForegroundColor White
Write-Host "   - Warning ini AMAN untuk diabaikan" -ForegroundColor Green
Write-Host "   - Aplikasi masih bisa berjalan normal" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 OPTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ignore (RECOMMENDED)" -ForegroundColor Green
Write-Host "   → Warning ini tidak mempengaruhi aplikasi" -ForegroundColor Gray
Write-Host "   → Akan hilang sendiri saat package parent di-update" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update all dependencies" -ForegroundColor Cyan
Write-Host "   → Update semua packages ke versi terbaru" -ForegroundColor Gray
Write-Host "   → Mungkin fix warning, tapi bisa breaking changes" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check which package uses it" -ForegroundColor Cyan
Write-Host "   → Lihat dependency tree" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Pilih opsi (1/2/3) [default: 1]"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "✅ OK - Warning ini aman untuk diabaikan" -ForegroundColor Green
        Write-Host "   Aplikasi akan berjalan normal" -ForegroundColor Gray
        Write-Host "   Warning akan hilang saat package parent di-update" -ForegroundColor Gray
    }
    
    "2" {
        Write-Host ""
        Write-Host "📦 Updating all dependencies..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check for outdated packages
        Write-Host "🔍 Checking outdated packages..." -ForegroundColor Cyan
        pnpm outdated
        
        Write-Host ""
        $updateChoice = Read-Host "Update semua dependencies? (Y/N)"
        if ($updateChoice -eq "Y" -or $updateChoice -eq "y") {
            Write-Host ""
            Write-Host "⚠️  Warning: Updating all dependencies may cause breaking changes!" -ForegroundColor Yellow
            Write-Host ""
            $confirm = Read-Host "Continue? (Y/N)"
            if ($confirm -eq "Y" -or $confirm -eq "y") {
                Write-Host ""
                Write-Host "📦 Updating..." -ForegroundColor Yellow
                pnpm update --latest --recursive
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host ""
                    Write-Host "✅ Dependencies updated!" -ForegroundColor Green
                    Write-Host "🧪 Test your application to make sure everything works" -ForegroundColor Yellow
                }
            }
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔍 Checking dependency tree..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check which package uses whatwg-encoding
        pnpm why whatwg-encoding
        
        Write-Host ""
        Write-Host "💡 Tip: Package di atas adalah yang menggunakan whatwg-encoding" -ForegroundColor Cyan
        Write-Host "   Update package tersebut untuk fix warning" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Green
Write-Host "✅ DONE!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host ""

