@echo off
echo ========================================
echo   Fixing Table Names - 100%%
echo ========================================
echo.

echo Fixing: public_notifications -^> notifications
powershell -Command "(Get-Content 'app\api\admin\notifications\route.ts') -replace 'public_notifications', 'notifications' | Set-Content 'app\api\admin\notifications\route.ts'"
powershell -Command "(Get-Content 'app\api\upload\asset\route.ts') -replace 'public_notifications', 'notifications' | Set-Content 'app\api\upload\asset\route.ts'"
powershell -Command "(Get-Content 'app\api\notifications\public\route.ts') -replace 'public_notifications', 'notifications' | Set-Content 'app\api\notifications\public\route.ts'"

echo Fixing: asset_reviews -^> testimonials
powershell -Command "(Get-Content 'app\api\assets\[id]\reviews\route.ts') -replace 'asset_reviews', 'testimonials' | Set-Content 'app\api\assets\[id]\reviews\route.ts'"

echo Fixing: daily_claims -^> spin_wheel_tickets
powershell -Command "(Get-Content 'app\api\spin-wheel\claim-daily\route.ts') -replace 'daily_claims', 'spin_wheel_tickets' | Set-Content 'app\api\spin-wheel\claim-daily\route.ts'"
powershell -Command "(Get-Content 'app\api\spin-wheel\daily-status\route.ts') -replace 'daily_claims', 'spin_wheel_tickets' | Set-Content 'app\api\spin-wheel\daily-status\route.ts'"
powershell -Command "(Get-Content 'app\api\spin-wheel\eligibility\route.ts') -replace 'daily_claims', 'spin_wheel_tickets' | Set-Content 'app\api\spin-wheel\eligibility\route.ts'"

echo.
echo ✅ Done! All table names fixed!
pause
