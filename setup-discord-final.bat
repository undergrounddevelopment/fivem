@echo off
cls
echo ========================================
echo   DISCORD LOGIN - FINAL SETUP
echo ========================================
echo.
echo ✅ Client ID: 1445650115447754933
echo ✅ Client Secret: CLjXxFt2xbuKCsIIKLI17hLrzQAN1T3S
echo ✅ Admin Discord ID: 1047719075322810378
echo.
echo ========================================
echo   STEP 1: Discord Developer Portal
echo ========================================
echo.
echo Opening Discord Developer Portal...
start https://discord.com/developers/applications/1445650115447754933/oauth2
echo.
echo TAMBAHKAN REDIRECT URIs:
echo.
echo 1. https://www.fivemtools.net/api/auth/callback/discord
echo 2. https://fivemtools.net/api/auth/callback/discord
echo 3. http://localhost:3000/api/auth/callback/discord
echo.
echo KLIK "SAVE CHANGES"!
echo.
pause
echo.
echo ========================================
echo   STEP 2: Vercel Environment Variables
echo ========================================
echo.
echo Opening Vercel Settings...
start https://vercel.com/fivem-0f676644/v0-untitled-chat-3/settings/environment-variables
echo.
echo SET THESE VARIABLES (Production, Preview, Development):
echo.
echo NEXTAUTH_URL=https://www.fivemtools.net
echo NEXTAUTH_SECRET=fivemtools_nextauth_secret_2025_production
echo DISCORD_CLIENT_ID=1445650115447754933
echo DISCORD_CLIENT_SECRET=CLjXxFt2xbuKCsIIKLI17hLrzQAN1T3S
echo ADMIN_DISCORD_ID=1047719075322810378
echo.
pause
echo.
echo ========================================
echo   STEP 3: Deploy to Vercel
echo ========================================
echo.
echo Run this command:
echo.
echo   vercel --prod
echo.
echo Or redeploy from Vercel dashboard
echo.
pause
echo.
echo ========================================
echo   STEP 4: Test Login
echo ========================================
echo.
echo Opening site...
start https://www.fivemtools.net
echo.
echo 1. Click "Login with Discord"
echo 2. Authorize app
echo 3. Should redirect back logged in
echo.
echo ========================================
echo   ✅ SETUP COMPLETE!
echo ========================================
pause
