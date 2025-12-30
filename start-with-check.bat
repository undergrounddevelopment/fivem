@echo off
echo.
echo ========================================
echo   FiveM Tools V7 - Quick Start
echo ========================================
echo.
echo Checking database data...
echo.
call pnpm db:check
echo.
echo ========================================
echo   Starting Development Server...
echo ========================================
echo.
echo Website will open at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
call pnpm dev
