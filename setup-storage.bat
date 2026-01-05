@echo off
echo.
echo ========================================
echo   SUPABASE STORAGE SETUP
echo ========================================
echo.

echo [1/2] Setting up storage bucket...
call pnpm storage:setup

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Storage bucket "uploads" is ready!
echo Max file size: 5MB
echo Allowed types: Images only
echo.
echo You can now upload images in forum replies!
echo.
pause
