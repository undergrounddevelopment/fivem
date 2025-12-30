@echo off
echo ========================================
echo   DEPLOYING TO PRODUCTION
echo   Domain: fivemtools.net
echo ========================================
echo.

echo [1/3] Cleaning build cache...
if exist .next rmdir /s /q .next
if exist .vercel\.output rmdir /s /q .vercel\.output

echo [2/3] Installing dependencies...
call pnpm install

echo [3/3] Deploying to Vercel...
call vercel --prod --yes

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Site: https://fivemtools.net
echo Health: https://fivemtools.net/api/health
echo.
pause
