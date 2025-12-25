@echo off
echo ========================================
echo PULL ENVIRONMENT VARIABLES FROM VERCEL
echo ========================================
echo.

echo Checking Vercel CLI...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
)

echo.
echo Logging in to Vercel...
vercel login

echo.
echo Linking project...
vercel link

echo.
echo Pulling environment variables...
vercel env pull .env.local

echo.
echo ========================================
echo DONE! Environment variables saved to .env.local
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run verify-setup
echo 2. Run: npm run dev
echo 3. Test: http://localhost:3000
echo.
pause
