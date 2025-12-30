@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   🚀 FIVEM TOOLS V7 - QUICK START                           ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [1/4] Checking environment...
if not exist .env (
    echo ❌ ERROR: .env file not found!
    echo Please make sure .env file exists
    pause
    exit /b 1
)
echo ✅ .env file found
echo.

echo [2/4] Validating environment variables...
call pnpm run validate:env
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Some optional variables are missing
    echo This is OK for development
    echo.
)
echo.

echo [3/4] Installing dependencies...
echo This may take a few minutes...
call pnpm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo [4/4] Starting development server...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   ✅ Setup complete! Starting server...                     ║
echo ║                                                              ║
echo ║   Server will be available at:                              ║
echo ║   → http://localhost:3000                                   ║
echo ║                                                              ║
echo ║   Press Ctrl+C to stop the server                           ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

call pnpm dev
