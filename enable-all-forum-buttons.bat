@echo off
chcp 65001 >nul
color 0A
title ✅ ENABLE ALL FORUM BUTTONS

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           ✅ ENABLE ALL FORUM BUTTONS - 100%%                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Mengaktifkan SEMUA tombol di forum...
echo.

echo ════════════════════════════════════════════════════════════════
echo                    TOMBOL YANG DIAKTIFKAN
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ Like button (sudah aktif)
echo ✅ Dislike button (NEW!)
echo ✅ Reply button (sudah aktif)
echo ✅ Report button (sudah aktif)
echo ✅ Share button (sudah aktif)
echo ✅ Save/Bookmark button (sudah aktif)
echo ✅ Refresh button (sudah aktif)
echo ✅ Image lightbox (sudah aktif)
echo.

set /p fix="Aktifkan sekarang? (Y/N): "
if /i not "%fix%"=="Y" goto END

echo.
echo [1/3] Opening SQL script...
if exist "scripts\ENABLE-ALL-FORUM-BUTTONS.sql" (
    start notepad "scripts\ENABLE-ALL-FORUM-BUTTONS.sql"
    echo ✅ SQL opened
) else (
    echo ❌ SQL not found
)

echo.
echo [2/3] Instructions:
echo   1. Copy SQL dari Notepad
echo   2. Buka Supabase Dashboard
echo   3. Go to SQL Editor
echo   4. Paste and RUN
echo.

set /p done="Press ENTER setelah SQL dijalankan..."

echo.
echo [3/3] Restart dev server...
echo.
echo Run: pnpm dev
echo.

echo ════════════════════════════════════════════════════════════════
echo                    TOMBOL YANG AKTIF
echo ════════════════════════════════════════════════════════════════
echo.
echo Thread Page:
echo   ✅ Like thread
echo   ✅ Dislike thread (NEW!)
echo   ✅ Save/Bookmark
echo   ✅ Report
echo   ✅ Share
echo   ✅ More options
echo   ✅ Like reply
echo   ✅ Reply to reply
echo   ✅ Report reply
echo   ✅ Post reply
echo   ✅ Image lightbox
echo   ✅ Refresh real-time
echo.
echo Forum Index:
echo   ✅ New thread
echo   ✅ Search (frontend)
echo   ✅ Category links
echo   ✅ Thread links
echo   ✅ Top badges
echo   ✅ Online users
echo.

:END
echo.
echo ════════════════════════════════════════════════════════════════
echo                    FILES CREATED
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ app\api\dislikes\route.ts - Dislike API
echo ✅ scripts\ENABLE-ALL-FORUM-BUTTONS.sql - Database setup
echo ✅ app\forum\thread\[id]\page.tsx - Updated with dislike
echo.
echo Next: Restart server dan test semua tombol!
echo.
pause
