@echo off
echo 🚀 VERCEL FULL DEPLOYMENT - 100%
echo.

echo 📧 Setting Git config...
git config user.email "admin@fivemtools.net"
git config user.name "FiveM Tools Admin"

echo 🧹 Cleaning build cache...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo 📦 Installing dependencies...
call pnpm install --force

echo 🔨 Building project...
call pnpm build

echo 🔗 Removing old Vercel config...
rmdir /s /q .vercel 2>nul

echo 🚀 Deploying to Vercel...
call vercel --prod --force --yes

echo.
echo ✅ DEPLOYMENT COMPLETE!
echo 🌐 Check your Vercel dashboard for the live URL
echo.
pause