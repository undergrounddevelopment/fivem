@echo off
echo ========================================
echo   FIX DISCORD LOGIN - AUTO REPAIR
echo ========================================
echo.

echo Running fix script...
node fix-discord-login.js

echo.
echo ========================================
echo   CLEARING CACHE...
echo ========================================
if exist .next (
    rmdir /s /q .next
    echo Cache cleared!
) else (
    echo No cache to clear
)

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Press any key to restart dev server...
pause > nul

pnpm dev
