@echo off
echo This script will help you add your environment variables to Vercel interactively.
echo You will be prompted to enter the value for each secret.

echo.
echo Adding NEXT_PUBLIC_SUPABASE_URL...
vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo.
echo Adding NEXT_PUBLIC_SUPABASE_ANON_KEY...
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo.
echo Adding SUPABASE_SERVICE_ROLE_KEY...
vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo.
echo Adding NEXTAUTH_SECRET...
vercel env add NEXTAUTH_SECRET production

echo.
echo Adding DISCORD_CLIENT_ID...
vercel env add DISCORD_CLIENT_ID production

echo.
echo Adding DISCORD_CLIENT_SECRET...
vercel env add DISCORD_CLIENT_SECRET production

echo.
echo All secrets have been added. You can now ask me to deploy the application.
