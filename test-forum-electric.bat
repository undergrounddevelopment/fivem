@echo off
echo ========================================
echo   TESTING FORUM ELECTRIC BORDER DESIGN
echo ========================================
echo.

echo [1/3] Checking CSS file...
if exist "styles\electric-card.css" (
    echo ✅ Electric CSS file exists
) else (
    echo ❌ Electric CSS file missing
    goto :error
)

echo.
echo [2/3] Checking forum page...
if exist "app\forum\page.tsx" (
    echo ✅ Forum page exists
) else (
    echo ❌ Forum page missing
    goto :error
)

echo.
echo [3/3] Starting development server...
echo 🚀 Running: pnpm dev
echo.
echo ⚡ Forum with Electric Border should be available at:
echo 📍 http://localhost:3000/forum
echo.
echo Press Ctrl+C to stop the server
echo.

pnpm dev

goto :end

:error
echo.
echo ❌ Error: Missing files detected!
echo Please check the file structure.
pause
goto :end

:end