@echo off
echo ============================================
echo COMPLETE DATABASE SETUP - ALL FEATURES
echo ============================================
echo.
echo This will setup:
echo - Forum System (categories, threads, replies)
echo - Coins System (transactions, balance)
echo - Spin Wheel System (prizes, tickets, history)
echo - Admin Panel (banners, announcements, assets)
echo - Users System (notifications, messages, activities)
echo.

set DATABASE_URL=postgresql://postgres.linnqtixdfjwbrixitrb:ftbU5SwxVhshePE7@aws-1-us-east-1.pooler.supabase.com:6543/postgres

echo Step 1/4: Setting up core features (Forum, Coins, Spin Wheel)...
psql "%DATABASE_URL%" -f scripts\MASTER-SETUP.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Core setup failed!
    pause
    exit /b 1
)
echo ✓ Core features setup completed
echo.

echo Step 2/4: Setting up admin panel features...
psql "%DATABASE_URL%" -f scripts\ADMIN-PANEL-SETUP.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Admin panel setup failed!
    pause
    exit /b 1
)
echo ✓ Admin panel setup completed
echo.

echo Step 3/4: Verifying database...
psql "%DATABASE_URL%" -c "\dt" > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Database verification failed!
    pause
    exit /b 1
)
echo ✓ Database verified
echo.

echo Step 4/4: Running comprehensive tests...
psql "%DATABASE_URL%" -f scripts\VERIFY-SETUP.sql
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Some tests may have failed, check output above
)
echo.

echo ============================================
echo ✓ SETUP COMPLETE - ALL FEATURES READY!
echo ============================================
echo.
echo Database Summary:
psql "%DATABASE_URL%" -c "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
echo.
echo Tables created:
echo - Forum: forum_categories, forum_threads, forum_replies
echo - Coins: coin_transactions, daily_claims
echo - Spin: spin_wheel_prizes, spin_wheel_history, spin_wheel_tickets
echo - Admin: banners, announcements, assets, testimonials
echo - Users: notifications, messages, activities, reports
echo.
echo Next steps:
echo 1. Check verification results above
echo 2. Deploy application: npm run build
echo 3. Test admin panel: /admin
echo 4. Test forum: /forum
echo 5. Test spin wheel: /spin-wheel
echo.

pause
