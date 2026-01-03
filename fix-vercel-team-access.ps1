# Fix Vercel Team Access Error
# PowerShell Script

Write-Host "🔧 FIXING VERCEL TEAM ACCESS ERROR" -ForegroundColor Cyan
Write-Host ""

Write-Host "❌ Error: Git author must have access to the team FIVEM on Vercel" -ForegroundColor Red
Write-Host ""

Write-Host "🎯 SOLUSI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opsi 1: Deploy sebagai Personal Account (RECOMMENDED)" -ForegroundColor Green
Write-Host "Opsi 2: Invite email ke team FIVEM" -ForegroundColor Green
Write-Host "Opsi 3: Deploy via GitHub (Tidak perlu team access)" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Pilih opsi (1/2/3) [default: 1]"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📧 Setting Git config ke email personal Anda..." -ForegroundColor Yellow
        
        $email = Read-Host "Masukkan email Vercel account Anda"
        if ([string]::IsNullOrWhiteSpace($email)) {
            Write-Host "❌ Email tidak boleh kosong!" -ForegroundColor Red
            exit 1
        }
        
        git config user.email $email
        git config user.name "Your Name"
        
        Write-Host "✅ Git config updated" -ForegroundColor Green
        Write-Host ""
        Write-Host "🧹 Removing existing Vercel config..." -ForegroundColor Yellow
        if (Test-Path .vercel) {
            Remove-Item -Recurse -Force .vercel
            Write-Host "✅ Removed .vercel folder" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "🚀 Creating Vercel project (Personal Account)..." -ForegroundColor Yellow
        vercel --name fivem-tools-v7 --yes
        
        Write-Host ""
        Write-Host "🌐 Deploying to production..." -ForegroundColor Yellow
        vercel --prod --yes
    }
    
    "2" {
        Write-Host ""
        Write-Host "📋 Langkah-langkah invite email ke team:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Buka https://vercel.com/teams/FIVEM/settings/members" -ForegroundColor Cyan
        Write-Host "2. Klik 'Invite Member'" -ForegroundColor Cyan
        Write-Host "3. Masukkan email: admin@fivemtools.net" -ForegroundColor Cyan
        Write-Host "4. Set role: Member atau Developer" -ForegroundColor Cyan
        Write-Host "5. Klik 'Send Invitation'" -ForegroundColor Cyan
        Write-Host "6. Check email dan accept invitation" -ForegroundColor Cyan
        Write-Host "7. Jalankan script lagi setelah accept invitation" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Atau buka link ini:" -ForegroundColor Yellow
        Write-Host "https://vercel.com/teams/FIVEM/settings/members" -ForegroundColor Cyan
        Write-Host ""
    }
    
    "3" {
        Write-Host ""
        Write-Host "🚀 DEPLOY VIA GITHUB (RECOMMENDED)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Langkah 1: Push ke GitHub" -ForegroundColor Cyan
        Write-Host "  git init" -ForegroundColor White
        Write-Host "  git add ." -ForegroundColor White
        Write-Host "  git commit -m 'Initial commit'" -ForegroundColor White
        Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/fivem-tools-v7.git" -ForegroundColor White
        Write-Host "  git push -u origin main" -ForegroundColor White
        Write-Host ""
        Write-Host "Langkah 2: Import di Vercel" -ForegroundColor Cyan
        Write-Host "  1. Buka https://vercel.com/new" -ForegroundColor White
        Write-Host "  2. Klik 'Import Git Repository'" -ForegroundColor White
        Write-Host "  3. Pilih repository fivem-tools-v7" -ForegroundColor White
        Write-Host "  4. Set environment variables" -ForegroundColor White
        Write-Host "  5. Deploy!" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host ""
Write-Host "✅ Selesai!" -ForegroundColor Green
Write-Host ""

