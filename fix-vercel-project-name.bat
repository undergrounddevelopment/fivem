@echo off
echo 🔧 FIXING VERCEL PROJECT NAME
echo.

echo 📧 Setting Git config...
git config user.email "admin@fivemtools.net"
git config user.name "FiveM Tools Admin"

echo 🧹 Removing existing Vercel config...
if exist .vercel (
    rmdir /s /q .vercel
    echo ✅ Removed .vercel folder
)

echo.
echo 🚀 Creating Vercel project with valid name...
echo Project name: fivem-tools-v7
echo.

vercel --name fivem-tools-v7 --yes

echo.
echo ✅ Project created successfully!
echo.
echo 🌐 Deploying to production...
vercel --prod --yes

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo 🌐 Your site should be live at: https://fivem-tools-v7.vercel.app
echo.
pause

