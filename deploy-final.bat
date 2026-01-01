@echo off
echo 🚀 FINAL VERCEL DEPLOYMENT
echo.

echo 📧 Setting Git config...
git config user.email "admin@fivemtools.net"
git config user.name "FiveM Tools Admin"

echo 🧹 Cleaning Vercel config...
rmdir /s /q .vercel 2>nul

echo 🚀 Creating new Vercel project...
echo | vercel --name fivem-tools-v7 --yes

echo 🌐 Deploying to production...
vercel --prod --yes

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo 🌐 Your site should be live at: https://fivem-tools-v7.vercel.app
echo.
pause