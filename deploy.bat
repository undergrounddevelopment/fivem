@echo off
cd /d "%~dp0"
cls
echo ========================================
echo FiveM Tools V7 - DEPLOY
echo www.fivemtools.net
echo ========================================
echo.

echo [1/2] Building...
call pnpm build
if %errorlevel% neq 0 (
    echo Build FAILED!
    pause
    exit /b 1
)

echo.
echo [2/2] Deploying...
call vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Live: https://www.fivemtools.net
echo.
pause
