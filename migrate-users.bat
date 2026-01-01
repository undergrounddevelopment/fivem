@echo off
echo ========================================
echo   FiveM Tools - User Migration
echo ========================================
echo.
echo Migrating 600+ users to Supabase...
echo.

cd /d "%~dp0"

echo [1/3] Installing dependencies...
call pnpm install

echo.
echo [2/3] Compiling TypeScript...
call npx tsx scripts/migrate-users.ts

echo.
echo [3/3] Done!
echo.
pause
