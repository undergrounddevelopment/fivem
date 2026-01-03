@echo off
echo 🔧 FIXING pnpm EPERM ERROR
echo ==================================================
echo.

echo ⚠️  Script ini lebih baik dijalankan sebagai Administrator
echo    Right-click CMD → Run as Administrator
echo.
pause

echo 🔍 Step 1: Killing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ Node processes killed
echo.

echo 🔍 Step 2: Killing pnpm processes...
taskkill /F /IM pnpm.cmd >nul 2>&1
timeout /t 1 /nobreak >nul
echo ✅ pnpm processes killed
echo.

echo 🔍 Step 3: Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules 2>nul
    if errorlevel 1 (
        echo ⚠️  Could not remove node_modules (might be in use)
        echo 💡 Try closing all terminals and editors, then run this script again
    ) else (
        echo ✅ node_modules removed
    )
) else (
    echo ✅ node_modules not found (already removed)
)
echo.

echo 🔍 Step 4: Removing .pnpm-store...
if exist .pnpm-store (
    rmdir /s /q .pnpm-store 2>nul
    echo ✅ .pnpm-store removed
) else (
    echo ✅ .pnpm-store not found
)
echo.

echo 🔍 Step 5: Clearing pnpm cache...
pnpm store prune >nul 2>&1
echo ✅ pnpm cache cleared
echo.

echo 🔍 Step 6: Removing lock file...
if exist pnpm-lock.yaml (
    del /f pnpm-lock.yaml >nul 2>&1
    echo ✅ pnpm-lock.yaml removed
) else (
    echo ✅ pnpm-lock.yaml not found
)
echo.

echo ==================================================
echo ✅ CLEANUP COMPLETE!
echo ==================================================
echo.
echo 🚀 Now you can reinstall:
echo    pnpm install
echo.

set /p REINSTALL="Install now? (Y/N): "
if /i "%REINSTALL%"=="Y" (
    echo.
    echo 📦 Installing dependencies...
    pnpm install
    if errorlevel 1 (
        echo.
        echo ❌ Installation failed. Try running as Administrator.
    ) else (
        echo.
        echo ✅ Installation successful!
    )
)

echo.
pause

