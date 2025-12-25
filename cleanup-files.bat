@echo off
echo ============================================
echo CLEANING UP UNUSED FILES
echo ============================================
echo.

cd /d "%~dp0"

echo Deleting old/unused SQL scripts...

REM Delete old setup scripts (replaced by MASTER-SETUP.sql)
del /f /q "scripts\000-complete-database-setup.sql" 2>nul
del /f /q "scripts\000-complete-forum-setup.sql" 2>nul
del /f /q "scripts\000_create_exec_sql_function.sql" 2>nul
del /f /q "scripts\001-add-missing-columns.sql" 2>nul
del /f /q "scripts\001-create-admin-tables.sql" 2>nul
del /f /q "scripts\001-create-database-schema.sql" 2>nul
del /f /q "scripts\002-add-thread-images.sql" 2>nul
del /f /q "scripts\002-enable-rls-policies.sql" 2>nul
del /f /q "scripts\002-seed-data.sql" 2>nul
del /f /q "scripts\002-seed-default-data.sql" 2>nul
del /f /q "scripts\003-add-asset-reviews.sql" 2>nul
del /f /q "scripts\003-enable-rls.sql" 2>nul
del /f /q "scripts\003-seed-initial-data.sql" 2>nul
del /f /q "scripts\003_spin_wheel_force_wins.sql" 2>nul
del /f /q "scripts\004-add-realtime.sql" 2>nul
del /f /q "scripts\004-realtime-setup.sql" 2>nul
del /f /q "scripts\004_complete_spin_wheel_setup.sql" 2>nul
del /f /q "scripts\005-seed-sample-data.sql" 2>nul
del /f /q "scripts\005_fix_spin_wheel_final.sql" 2>nul
del /f /q "scripts\006_complete_admin_setup.sql" 2>nul
del /f /q "scripts\007_final_complete_setup.sql" 2>nul
del /f /q "scripts\008_testimonials_table.sql" 2>nul
del /f /q "scripts\009_complete_auto_setup.sql" 2>nul
del /f /q "scripts\010-admin-features-complete.sql" 2>nul
del /f /q "scripts\015-add-rating-to-assets.sql" 2>nul
del /f /q "scripts\016-add-asset-details-columns.sql" 2>nul
del /f /q "scripts\100-fix-admin-access.sql" 2>nul
del /f /q "scripts\101-ensure-admin-user.sql" 2>nul
del /f /q "scripts\200-complete-setup.sql" 2>nul
del /f /q "scripts\create-admin-tables.sql" 2>nul
del /f /q "scripts\FINAL-forum-setup.sql" 2>nul
del /f /q "scripts\FIX-forum-categories.sql" 2>nul
del /f /q "scripts\forum-functions.sql" 2>nul
del /f /q "scripts\migrate-order-column.sql" 2>nul

REM Delete old documentation
del /f /q "ADMIN_FEATURE_STATUS.md" 2>nul
del /f /q "ANALISIS_ADMIN_FEATURE.md" 2>nul
del /f /q "ANALISIS_DAN_PERBAIKAN_LENGKAP.md" 2>nul
del /f /q "ANALISIS_DATABASE_SUPABASE.md" 2>nul
del /f /q "ANALISIS_FITUR_LENGKAP.md" 2>nul
del /f /q "ANALISIS_FULL_100_PERSEN.md" 2>nul
del /f /q "DATABASE_READY.txt" 2>nul
del /f /q "DATABASE_SETUP_COMPLETE.md" 2>nul
del /f /q "DEPLOYMENT_FINAL_SECURE.md" 2>nul
del /f /q "ERROR_LOGGING_COMPLETE.md" 2>nul
del /f /q "FEATURES_STATUS.md" 2>nul
del /f /q "FINAL_CHECKLIST_100.md" 2>nul
del /f /q "FINAL_VERIFICATION.md" 2>nul
del /f /q "FIX_ADMIN_SIMPLE.html" 2>nul
del /f /q "GUNAKAN_ENV_VERCEL.md" 2>nul
del /f /q "INDEX_DOKUMENTASI.md" 2>nul
del /f /q "JAWABAN_ADMIN.md" 2>nul
del /f /q "MIGRATE_TO_NEON.md" 2>nul
del /f /q "QUICK_START.md" 2>nul
del /f /q "README_LENGKAP.md" 2>nul
del /f /q "RINGKASAN_SETUP.md" 2>nul
del /f /q "SETUP_CHECKLIST.md" 2>nul
del /f /q "SETUP_DISCORD_OAUTH.md" 2>nul
del /f /q "SOLUSI_CEPAT.md" 2>nul
del /f /q "START_HERE.md" 2>nul
del /f /q "SUPABASE_MIGRATION_SUCCESS.md" 2>nul
del /f /q "SUPABASE_MIGRATION.md" 2>nul
del /f /q "UPDATE_VERCEL_ENV.md" 2>nul
del /f /q "FORUM_FIXES_COMPLETE.md" 2>nul
del /f /q "DEPLOYMENT_GUIDE.md" 2>nul
del /f /q "FINAL_DEPLOYMENT.md" 2>nul
del /f /q "COMPLETE_DEPLOYMENT.md" 2>nul
del /f /q "VERIFICATION_COMPLETE.md" 2>nul
del /f /q "QUICK_FIX.md" 2>nul

REM Delete old scripts
del /f /q "check-admin.ts" 2>nul
del /f /q "force-admin.ts" 2>nul
del /f /q "pull-vercel-env.bat" 2>nul
del /f /q "run-db-setup.js" 2>nul
del /f /q "seed-production.ts" 2>nul
del /f /q "set-admin.ts" 2>nul
del /f /q "setup-database.js" 2>nul
del /f /q "setup-env.js" 2>nul
del /f /q "temp_fix_admin.ts" 2>nul
del /f /q "test-admin-access.ts" 2>nul
del /f /q "test-database-connection.ts" 2>nul
del /f /q "verify-db-connection.ts" 2>nul
del /f /q "verify-setup.ts" 2>nul
del /f /q "deploy-env.js" 2>nul
del /f /q "continue-chat.js" 2>nul
del /f /q "get-chat.js" 2>nul
del /f /q "test.js" 2>nul
del /f /q "v0-ai.js" 2>nul
del /f /q "v0-client.js" 2>nul
del /f /q "middleware-error-handler.ts" 2>nul
del /f /q "proxy.ts" 2>nul
del /f /q "uninstaller_fixed.py" 2>nul
del /f /q "run-setup.bat" 2>nul

echo.
echo ============================================
echo CLEANUP COMPLETE!
echo ============================================
echo.
echo Files kept (IMPORTANT):
echo.
echo SQL Scripts:
echo - scripts\MASTER-SETUP.sql (Core setup)
echo - scripts\ADMIN-PANEL-SETUP.sql (Admin features)
echo - scripts\VERIFY-SETUP.sql (Verification)
echo.
echo Batch Scripts:
echo - run-complete-setup.bat (Main setup script)
echo.
echo Documentation:
echo - SETUP_INSTRUCTIONS.md (Setup guide)
echo - FEATURE_INTEGRATION.md (Feature list)
echo - AUTOMATIC_VERIFICATION.md (Verification guide)
echo.
echo All old/unused files have been deleted!
echo.

pause
