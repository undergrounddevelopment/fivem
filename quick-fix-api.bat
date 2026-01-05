@echo off
echo ========================================
echo   QUICK FIX - API & SERVER RESTART
echo ========================================
echo.

echo [1/4] Stopping server...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Clearing cache...
if exist .next rmdir /s /q .next

echo [3/4] Checking database connection...
call pnpm db:check

echo [4/4] Starting server...
echo.
echo ✅ Quick fix applied!
echo 🚀 Server starting at http://localhost:3000
echo.
start http://localhost:3000
call pnpm dev