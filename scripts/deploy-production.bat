@echo off
echo ========================================
echo   FiveM Tools V7 - Production Deploy
echo   Domain: fivemtools.net
echo ========================================
echo.

REM Check Vercel CLI
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Vercel CLI...
    npm i -g vercel
)

echo Setting environment variables...
echo.

REM Set environment variables
call vercel env add NEXT_PUBLIC_SUPABASE_URL production
call vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
call vercel env add SUPABASE_SERVICE_ROLE_KEY production
call vercel env add POSTGRES_URL production
call vercel env add DATABASE_URL production
call vercel env add NEXT_PUBLIC_SITE_URL production
call vercel env add NEXTAUTH_URL production
call vercel env add NEXTAUTH_SECRET production
call vercel env add DISCORD_CLIENT_ID production
call vercel env add DISCORD_CLIENT_SECRET production
call vercel env add ADMIN_DISCORD_ID production

echo.
echo Deploying to production...
echo.

vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Site: https://fivemtools.net
echo Health: https://fivemtools.net/api/health
echo.
pause
