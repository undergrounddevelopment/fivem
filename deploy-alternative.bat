@echo off
echo 🚀 ALTERNATIVE DEPLOYMENT METHOD
echo.

echo 📧 Step 1: Fix Git config
git config user.email "admin@fivemtools.net"
git config user.name "FiveM Tools Admin"

echo 📦 Step 2: Build project
call pnpm build

echo 🔗 Step 3: Deploy via GitHub
echo Creating new repository...
git init
git add .
git commit -m "FiveM Tools V7 - Production Ready"

echo.
echo 💡 MANUAL STEPS:
echo 1. Create new GitHub repository
echo 2. Push code: git remote add origin [YOUR_REPO_URL]
echo 3. Push: git push -u origin main
echo 4. Connect to Vercel via GitHub
echo.

echo 🔧 OR use Vercel CLI with different approach:
echo vercel --prod --force
echo.

pause