# Deploy langsung ke Vercel CLI
# PowerShell Script

Write-Host "🚀 DEPLOY KE VERCEL CLI" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelCheck = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCheck) {
    Write-Host "❌ Vercel CLI tidak ditemukan!" -ForegroundColor Red
    Write-Host "📥 Install dengan: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Vercel CLI ditemukan" -ForegroundColor Green
Write-Host ""

# Get current Git email or ask for Vercel email
Write-Host "📧 Setting Git config..." -ForegroundColor Yellow
$currentEmail = git config user.email
if ($currentEmail -and $currentEmail -ne "admin@fivemtools.net") {
    Write-Host "✅ Using Git email: $currentEmail" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git email tidak ditemukan atau menggunakan admin@fivemtools.net" -ForegroundColor Yellow
    $vercelEmail = Read-Host "Masukkan email Vercel account Anda"
    if ($vercelEmail) {
        git config user.email $vercelEmail
        git config user.name "FiveM Tools"
        Write-Host "✅ Git config updated" -ForegroundColor Green
    }
}
Write-Host ""

# Remove existing Vercel config to start fresh
Write-Host "🧹 Cleaning Vercel config..." -ForegroundColor Yellow
if (Test-Path .vercel) {
    Remove-Item -Recurse -Force .vercel
    Write-Host "✅ Removed .vercel folder" -ForegroundColor Green
} else {
    Write-Host "✅ No existing config" -ForegroundColor Green
}
Write-Host ""

# Check Vercel login
Write-Host "🔐 Checking Vercel login..." -ForegroundColor Yellow
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Vercel" -ForegroundColor Yellow
    Write-Host "🔑 Logging in..." -ForegroundColor Yellow
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Logged in as: $vercelWhoami" -ForegroundColor Green
}
Write-Host ""

# Create/Deploy project
Write-Host "🚀 Creating/Updating Vercel project..." -ForegroundColor Yellow
Write-Host "Project name: fivem-tools-v7" -ForegroundColor Cyan
Write-Host ""

# Deploy (will create project if not exists)
vercel --name fivem-tools-v7 --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Project created/updated successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Deploy to production
    Write-Host "🌐 Deploying to production..." -ForegroundColor Yellow
    vercel --prod --yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=" * 50 -ForegroundColor Green
        Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host "=" * 50 -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Your site is live at:" -ForegroundColor Cyan
        Write-Host "   https://fivem-tools-v7.vercel.app" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📝 Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Set environment variables in Vercel dashboard" -ForegroundColor White
        Write-Host "   2. Go to: https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "   3. Select project: fivem-tools-v7" -ForegroundColor White
        Write-Host "   4. Go to Settings → Environment Variables" -ForegroundColor White
        Write-Host "   5. Add all required variables" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Production deployment failed!" -ForegroundColor Red
        Write-Host "Check error above for details" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Project creation failed!" -ForegroundColor Red
    Write-Host "Check error above for details" -ForegroundColor Yellow
}

Write-Host ""

