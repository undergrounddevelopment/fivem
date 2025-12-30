@echo off
echo ========================================
echo   FiveM Tools V7 - Quick Fix Script
echo ========================================
echo.

echo [1/5] Clearing Next.js cache...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo ✓ .next folder cleared
) else (
    echo ✓ .next folder not found (already clean)
)

echo.
echo [2/5] Clearing node_modules cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache" 2>nul
    echo ✓ node_modules cache cleared
) else (
    echo ✓ node_modules cache not found (already clean)
)

echo.
echo [3/5] Clearing pnpm cache...
pnpm store prune >nul 2>&1
echo ✓ pnpm cache pruned

echo.
echo [4/5] Reinstalling dependencies...
pnpm install --force >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Dependencies reinstalled
) else (
    echo ✗ Failed to reinstall dependencies
    pause
    exit /b 1
)

echo.
echo [5/5] Testing build...
pnpm build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Build successful!
) else (
    echo ✗ Build failed - check errors above
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ ALL FIXES APPLIED SUCCESSFULLY!
echo ========================================
echo.
echo You can now run:
echo   pnpm dev     - Start development server
echo   pnpm build   - Build for production
echo   pnpm start   - Start production server
echo.
pause
