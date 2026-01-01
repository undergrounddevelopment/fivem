@echo off
cls
echo ========================================
echo   FiveM Tools V7 - Quick Deploy
echo ========================================
echo.
echo Pilih metode deployment:
echo.
echo 1. Auto Deploy (via script)
echo 2. Manual Deploy (via Supabase Dashboard)
echo 3. Cancel
echo.
set /p choice="Pilih (1/2/3): "

if "%choice%"=="1" goto auto
if "%choice%"=="2" goto manual
if "%choice%"=="3" goto end

:auto
echo.
echo 🚀 Starting auto deployment...
echo.
node deploy-auto.mjs
echo.
echo ✅ Done! Check results above.
goto end

:manual
echo.
echo 📋 Opening files for manual deployment...
echo.
notepad complete-schema.sql
start https://supabase.com/dashboard/project/linnqtixdfjwbrixitrb/editor
echo.
echo INSTRUKSI:
echo 1. Copy isi complete-schema.sql dari Notepad
echo 2. Paste ke Supabase SQL Editor
echo 3. Klik Run atau Ctrl+Enter
echo 4. Tunggu sampai selesai
echo.
goto end

:end
pause
