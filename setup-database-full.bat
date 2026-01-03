@echo off
echo ========================================
echo   FiveM Tools V7 - Database Setup
echo ========================================
echo.

echo 🚀 Starting database schema setup...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

REM Check if pnpm is available
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pnpm not found! Installing pnpm...
    npm install -g pnpm
)

REM Install dependencies if needed
if not exist node_modules (
    echo 📦 Installing dependencies...
    pnpm install
)

REM Install required packages for database setup
echo 📦 Installing database dependencies...
pnpm add @supabase/supabase-js dotenv

REM Run the database schema
echo 🔧 Executing database schema...
node run-database-schema.js

if errorlevel 1 (
    echo.
    echo ❌ Database setup failed!
    echo 💡 Try these solutions:
    echo 1. Check your .env file has correct Supabase credentials
    echo 2. Make sure your Supabase project is active
    echo 3. Verify your database password is correct
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Database setup completed successfully!
echo.
echo 🎯 Next steps:
echo 1. Run: pnpm dev
echo 2. Visit: http://localhost:3000
echo 3. Test your application
echo.
pause