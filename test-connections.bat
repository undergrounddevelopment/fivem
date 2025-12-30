@echo off
echo ========================================
echo Testing FiveM Tools Connections
echo ========================================
echo.

echo [1/4] Checking environment variables...
if not exist .env (
    echo ERROR: .env file not found!
    exit /b 1
)
echo OK: .env file exists
echo.

echo [2/4] Installing dependencies...
call pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)
echo OK: Dependencies installed
echo.

echo [3/4] Testing database connection...
node -e "const { testDatabaseConnection } = require('./lib/db-init.ts'); testDatabaseConnection();"
echo.

echo [4/4] Building project...
call pnpm build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    exit /b 1
)
echo OK: Build successful
echo.

echo ========================================
echo All connections verified successfully!
echo ========================================
echo.
echo You can now run: pnpm dev
pause
