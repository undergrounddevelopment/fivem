@echo off
echo.
echo ========================================
echo   FIVEM TOOLS V7 - MASTER CHECK ^& FIX
echo ========================================
echo.

echo [1/4] Running Full System Check...
node full-system-check.js
if errorlevel 1 (
    echo.
    echo [!] Issues found. Running auto-fix...
    echo.
    echo [2/4] Running Auto-Fix...
    node auto-fix-system.js
    echo.
    echo [3/4] Re-checking system...
    node full-system-check.js
) else (
    echo.
    echo [OK] No issues found!
)

echo.
echo [4/4] Testing Assets API...
node test-assets-quick.js

echo.
echo ========================================
echo   CHECK COMPLETE!
echo ========================================
echo.
echo Reports generated:
echo   - SYSTEM_CHECK_REPORT.json
echo   - FULL_SYSTEM_REPORT.md
echo.
echo Ready to start? Run: pnpm dev
echo.
pause
