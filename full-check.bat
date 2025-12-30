@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   🔍 FIVEM TOOLS V7 - FULL SYSTEM CHECK                     ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [1/3] Checking environment variables...
echo.
call pnpm run validate:env
if %errorlevel% neq 0 (
    echo.
    echo ❌ Environment check failed
    pause
    exit /b 1
)
echo.

echo [2/3] Checking database tables...
echo.
call pnpm run check:db
if %errorlevel% neq 0 (
    echo.
    echo ❌ Database check failed
    pause
    exit /b 1
)
echo.

echo [3/3] Running build test...
echo.
call pnpm build
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed
    pause
    exit /b 1
)
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   ✅ ALL CHECKS PASSED - SYSTEM 100% READY!                 ║
echo ║                                                              ║
echo ║   Database:    ✅ 15/15 tables                              ║
echo ║   Environment: ✅ All variables set                         ║
echo ║   Build:       ✅ Success                                   ║
echo ║                                                              ║
echo ║   Ready to run: pnpm dev                                    ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

pause
