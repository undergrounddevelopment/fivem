@echo off
cls
echo ================================================
echo   MIGRATE SUPABASE - AUTOMATIC
echo ================================================
echo.
echo FROM: linnqtixdfjwbrixitrb.supabase.co
echo TO:   peaulqbbvgzpnwshtbok.supabase.co
echo.
echo ================================================
echo.
echo Starting migration in 3 seconds...
timeout /t 3 /nobreak >nul
echo.

node MIGRATE_NOW.js

echo.
echo ================================================
echo   MIGRATION COMPLETE!
echo ================================================
echo.
pause
