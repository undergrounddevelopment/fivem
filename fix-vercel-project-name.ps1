# Fix Vercel Project Name Error
# PowerShell Script

Write-Host "🔧 FIXING VERCEL PROJECT NAME" -ForegroundColor Cyan
Write-Host ""

# Set Git config
Write-Host "📧 Setting Git config..." -ForegroundColor Yellow
git config user.email "admin@fivemtools.net"
git config user.name "FiveM Tools Admin"

# Remove existing Vercel config
Write-Host "🧹 Removing existing Vercel config..." -ForegroundColor Yellow
if (Test-Path .vercel) {
    Remove-Item -Recurse -Force .vercel
    Write-Host "✅ Removed .vercel folder" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Creating Vercel project with valid name..." -ForegroundColor Yellow
Write-Host "Project name: fivem-tools-v7" -ForegroundColor Cyan
Write-Host ""

# Create project with explicit name
vercel --name fivem-tools-v7 --yes

Write-Host ""
Write-Host "✅ Project created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Deploying to production..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Your site should be live at: https://fivem-tools-v7.vercel.app" -ForegroundColor Cyan
Write-Host ""

