@echo off
echo ========================================
echo   FIX MIDDLEWARE ERROR
echo ========================================
echo.

echo [1/3] Stopping any running dev server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Deleting middleware.ts...
if exist middleware.ts (
    del middleware.ts
    echo ✅ middleware.ts deleted
) else (
    echo ⚠ middleware.ts not found
)

echo.
echo [3/3] Clearing Next.js cache...
if exist .next (
    rmdir /s /q .next
    echo ✅ .next cache cleared
)

echo.
echo ========================================
echo   FIX COMPLETE!
echo ========================================
echo.
echo Now you can run: pnpm dev
echo.
pause
