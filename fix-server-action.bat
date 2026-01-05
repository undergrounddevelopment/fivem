@echo off
echo ========================================
echo    FIXING SERVER ACTION ERROR
echo ========================================
echo.

echo 1. Clearing Next.js cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 2. Clearing build artifacts...
if exist .next\cache rmdir /s /q .next\cache

echo 3. Assets status check...
node test-assets-api.js

echo.
echo 4. Starting clean development server...
echo Assets should now be visible at: http://localhost:3000/assets
echo.

pnpm dev