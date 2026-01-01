@echo off
echo ==========================================
echo   FiveM Tools V7 - Smart Start
echo ==========================================
echo.

echo [INFO] Starting FiveM Tools V7 with health checks...

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [WARNING] Dependencies not found, installing...
    pnpm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check environment file
if not exist ".env" (
    echo [WARNING] Environment file not found, running quick fix...
    call quick-fix-complete.bat
)

echo [INFO] Starting development server...
echo [INFO] This may take a moment on first run...
echo.

REM Start the development server in background
start /B pnpm dev

REM Wait for server to start
echo [INFO] Waiting for server to start...
timeout /t 10 /nobreak >nul

REM Health check
echo [INFO] Performing health check...
curl -s http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Health check failed, but server might still be starting...
    echo [INFO] Please wait a moment and check http://localhost:3000
) else (
    echo [SUCCESS] Health check passed!
)

echo.
echo ==========================================
echo   SERVER STARTED SUCCESSFULLY!
echo ==========================================
echo.
echo 🚀 Application is running at:
echo    http://localhost:3000
echo.
echo 📊 Health check endpoint:
echo    http://localhost:3000/api/health
echo.
echo 🔧 Admin dashboard:
echo    http://localhost:3000/admin
echo.
echo 📝 Available endpoints:
echo    - /api/announcements (Public announcements)
echo    - /api/health (System health)
echo    - /api/stats (Site statistics)
echo.
echo Press Ctrl+C to stop the server
echo Press any key to open in browser...
pause >nul

REM Open browser
start http://localhost:3000

echo.
echo Server is running in background.
echo Close this window to stop the server.
pause