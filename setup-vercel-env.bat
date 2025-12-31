@echo off
echo This script will help you add your environment variables to Vercel.

echo.
echo Please enter the value for NEXT_PUBLIC_SUPABASE_URL:
set /p SUPABASE_URL=
vercel env add NEXT_PUBLIC_SUPABASE_URL %SUPABASE_URL% production

echo.
echo Please enter the value for NEXT_PUBLIC_SUPABASE_ANON_KEY:
set /p SUPABASE_ANON_KEY=
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY %SUPABASE_ANON_KEY% production

echo.
echo Please enter the value for SUPABASE_SERVICE_ROLE_KEY:
set /p SERVICE_ROLE_KEY=
vercel env add SUPABASE_SERVICE_ROLE_KEY %SERVICE_ROLE_KEY% production

echo.
echo Please enter the value for NEXTAUTH_SECRET:
set /p NEXTAUTH_SECRET_VAL=
vercel env add NEXTAUTH_SECRET %NEXTAUTH_SECRET_VAL% production

echo.
echo Please enter the value for DISCORD_CLIENT_ID:
set /p DISCORD_ID=
vercel env add DISCORD_CLIENT_ID %DISCORD_ID% production

echo.
echo Please enter the value for DISCORD_CLIENT_SECRET:
set /p DISCORD_SECRET=
vercel env add DISCORD_CLIENT_SECRET %DISCORD_SECRET% production

echo.
echo All secrets have been added. You can now ask me to deploy the application.
