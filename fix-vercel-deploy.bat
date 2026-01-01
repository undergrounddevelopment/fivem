@echo off
echo 🔧 FIXING VERCEL DEPLOYMENT ERROR...
echo.

echo 📧 Setting up Git configuration...
git config --global user.email "admin@fivemtools.net"
git config --global user.name "FiveM Tools Admin"

echo 🔗 Linking to correct Vercel project...
vercel link --yes

echo 📋 Setting up environment variables...
vercel env pull .env.vercel

echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo ✅ Deployment fix complete!
pause