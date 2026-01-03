@echo off
cls
echo ========================================
echo   🎮 FiveM Tools V7 - Database Setup
echo ========================================
echo.
echo 🚀 Starting FULL database schema execution...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

REM Check pnpm
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing pnpm...
    npm install -g pnpm
)

REM Install dependencies
echo 📦 Installing required packages...
pnpm add @supabase/supabase-js dotenv --silent

echo.
echo 🔧 Method 1: Direct execution...
node execute-schema-direct.js

echo.
echo ========================================
echo   📋 Manual Method (if needed)
echo ========================================
echo.
echo If direct execution failed, use this method:
echo.
echo 1. Open: https://supabase.com/dashboard/project/linnqtixdfjwbrixitrb/sql
echo 2. Copy content from: EXECUTE_IN_SUPABASE.sql
echo 3. Paste in SQL Editor and click "Run"
echo.

REM Check if schema file exists
if exist "EXECUTE_IN_SUPABASE.sql" (
    echo ✅ EXECUTE_IN_SUPABASE.sql is ready for manual execution
) else (
    echo 📝 Creating manual execution file...
    node create-supabase-script.js
)

echo.
echo 🎯 After database setup:
echo 1. Run: pnpm dev
echo 2. Visit: http://localhost:3000
echo 3. Test Discord login
echo.
echo ✅ Database setup process completed!
echo.
pause