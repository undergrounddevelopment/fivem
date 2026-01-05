@echo off
echo ========================================
echo    FIXING ASSETS PROBLEMS
echo ========================================
echo.

echo 1. Checking current assets data...
node check-assets-data.js
echo.

echo 2. Please run the SQL script in Supabase:
echo    - Open Supabase Dashboard
echo    - Go to SQL Editor
echo    - Copy and run: fix-assets-schema.sql
echo.

echo 3. After running SQL, press any key to test...
pause

echo 4. Testing assets after fix...
node check-assets-data.js
echo.

echo 5. Starting development server to test...
echo    - Open http://localhost:3000/assets
echo    - Check if assets are now visible
echo.

pnpm dev