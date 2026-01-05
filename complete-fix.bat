@echo off
echo ========================================
echo   FiveM Tools V7 - COMPLETE FIX
echo ========================================
echo.

echo [1/6] Stopping any running processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Clearing cache and build files...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .vercel rmdir /s /q .vercel

echo [3/6] Reinstalling dependencies...
call pnpm install --force

echo [4/6] Validating environment...
call pnpm run validate:env

echo [5/6] Building application...
call pnpm build

echo [6/6] Starting development server...
echo.
echo ✅ ALL FIXES APPLIED!
echo 🚀 Starting server at http://localhost:3000
echo.
call pnpm dev