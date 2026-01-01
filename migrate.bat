@echo off
echo ========================================
echo MIGRATE SUPABASE - OLD TO NEW
echo ========================================
echo.
echo From: linnqtixdfjwbrixitrb.supabase.co
echo To: peaulqbbvgzpnwshtbok.supabase.co
echo.
echo ========================================

set /p SUPABASE_KEY="Enter NEW Supabase ANON KEY: "

echo.
echo Starting migration...
echo.

node migrate-full.js

echo.
echo ========================================
echo DONE!
echo ========================================
pause
