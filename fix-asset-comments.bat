@echo off
chcp 65001 >nul
color 0C
title 🔧 FIX ASSET COMMENTS - Quick Fix

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🔧 FIX ASSET COMMENTS SYSTEM                      ║
echo ║                   Quick Fix Script                             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [PROBLEM] Comment system tidak berfungsi
echo [CAUSE] Table structure atau API issue
echo.

echo ════════════════════════════════════════════════════════════════
echo                    DIAGNOSIS
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ API endpoint exists: /api/assets/[id]/comments
echo ✅ Frontend dialog implemented
echo ❌ Table structure mungkin salah
echo ❌ Column name mismatch (comment vs content)
echo.

echo ════════════════════════════════════════════════════════════════
echo                    SOLUTION
echo ════════════════════════════════════════════════════════════════
echo.
echo Step 1: Fix database table
echo Step 2: Update API (DONE)
echo Step 3: Test comment system
echo.

set /p fix="Fix sekarang? (Y/N): "
if /i not "%fix%"=="Y" goto END

echo.
echo [INFO] Opening SQL fix script...
echo.

if exist "scripts\FIX-ASSET-COMMENTS.sql" (
    start notepad "scripts\FIX-ASSET-COMMENTS.sql"
    echo ✅ SQL script opened
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo                    INSTRUCTIONS
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo 1. Copy SQL script dari Notepad
    echo 2. Buka Supabase Dashboard
    echo 3. Go to SQL Editor
    echo 4. Paste script
    echo 5. Click RUN
    echo 6. Wait for success message
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo.
    
    set /p done="Press ENTER setelah SQL dijalankan..."
    
    echo.
    echo ════════════════════════════════════════════════════════════════
    echo                    TESTING
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo [INFO] Testing comment system...
    echo.
    echo 1. Buka browser: http://localhost:3000
    echo 2. Login dengan Discord
    echo 3. Buka asset detail page
    echo 4. Click Download (free asset)
    echo 5. Comment dialog harus muncul
    echo 6. Tulis comment (min 3 karakter)
    echo 7. Click "Post & Download"
    echo 8. Download harus mulai
    echo.
    
    set /p test="Apakah comment berhasil? (Y/N): "
    if /i "%test%"=="Y" (
        echo.
        echo ✅ SUCCESS! Comment system fixed!
        echo.
    ) else (
        echo.
        echo ❌ Still not working. Check:
        echo    - Supabase logs
        echo    - Browser console
        echo    - Network tab
        echo.
    )
) else (
    echo ❌ SQL script not found!
    echo [INFO] File: scripts\FIX-ASSET-COMMENTS.sql
)

:END
echo.
echo ════════════════════════════════════════════════════════════════
echo                    SUMMARY
echo ════════════════════════════════════════════════════════════════
echo.
echo Fixed:
echo   ✅ API updated to support both 'comment' and 'content'
echo   ✅ SQL script created for table fix
echo   ✅ Minimum length changed to 3 characters
echo.
echo Files:
echo   - scripts\FIX-ASSET-COMMENTS.sql
echo   - app\api\assets\[id]\comments\route.ts (updated)
echo.
echo Next:
echo   1. Run SQL script in Supabase
echo   2. Test comment system
echo   3. Check browser console for errors
echo.
echo Press any key to exit...
pause >nul
