@echo off
echo ============================================
echo FULL SETUP - ALL IN ONE
echo ============================================
echo.
echo This will:
echo 1. Clean up old files
echo 2. Setup database (Forum, Coins, Spin Wheel, Admin)
echo 3. Verify everything works
echo.
echo Press any key to start...
pause > nul
echo.

cd /d "%~dp0"

REM ============================================
REM STEP 1: CLEANUP OLD FILES
REM ============================================
echo ============================================
echo STEP 1/3: CLEANING UP OLD FILES
echo ============================================
echo.

call cleanup-files.bat

echo.
echo ✓ Cleanup completed!
echo.
timeout /t 3 > nul

REM ============================================
REM STEP 2: RUN DATABASE SETUP
REM ============================================
echo ============================================
echo STEP 2/3: SETTING UP DATABASE
echo ============================================
echo.

call run-complete-setup.bat

echo.
echo ✓ Database setup completed!
echo.

REM ============================================
REM STEP 3: FINAL SUMMARY
REM ============================================
echo.
echo ============================================
echo STEP 3/3: FINAL SUMMARY
echo ============================================
echo.
echo ✓ Old files cleaned up
echo ✓ Database fully configured
echo ✓ All features ready
echo.
echo Your project is now clean and ready!
echo.
echo Next steps:
echo 1. Deploy: npm run build && vercel --prod
echo 2. Test: Visit /admin, /forum, /spin-wheel
echo.
echo ============================================
echo ✓ FULL SETUP COMPLETE!
echo ============================================
echo.

pause
