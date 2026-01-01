@echo off
cls
echo ========================================
echo   FIX DISCORD OAUTH - QUICK GUIDE
echo ========================================
echo.
echo ERROR: OAuthCallback
echo URL: https://www.fivemtools.net/?error=OAuthCallback
echo.
echo ========================================
echo   PENYEBAB:
echo ========================================
echo.
echo Discord redirect URI tidak match!
echo.
echo ========================================
echo   SOLUSI (IKUTI STEP BY STEP):
echo ========================================
echo.
echo STEP 1: Buka Discord Developer Portal
echo.
echo    https://discord.com/developers/applications/1445650115447754933/oauth2
echo.
pause
echo.
echo STEP 2: Di bagian "Redirects", tambahkan URL ini:
echo.
echo    https://www.fivemtools.net/api/auth/callback/discord
echo    https://fivemtools.net/api/auth/callback/discord
echo    http://localhost:3000/api/auth/callback/discord
echo.
echo    (Klik "Add Redirect" untuk setiap URL)
echo.
pause
echo.
echo STEP 3: Klik "Save Changes" di Discord Portal
echo.
pause
echo.
echo STEP 4: Vercel Environment Variables
echo.
echo    Buka: https://vercel.com/fivem-0f676644/v0-untitled-chat-3/settings/environment-variables
echo.
echo    Pastikan ada:
echo    - NEXTAUTH_URL = https://www.fivemtools.net
echo    - DISCORD_CLIENT_ID = 1445650115447754933
echo    - DISCORD_CLIENT_SECRET = lVH1OJEVut2DdAfGyT9oC159aJ87Y1uW
echo.
pause
echo.
echo STEP 5: Redeploy Vercel
echo.
echo    Buka: https://vercel.com/fivem-0f676644/v0-untitled-chat-3
echo    Klik "Redeploy" pada deployment terakhir
echo.
pause
echo.
echo ========================================
echo   TESTING:
echo ========================================
echo.
echo 1. Tunggu deployment selesai (2-3 menit)
echo 2. Buka: https://www.fivemtools.net
echo 3. Klik "Login with Discord"
echo 4. Authorize app
echo 5. Harus redirect ke homepage (logged in)
echo.
echo ========================================
echo.
echo Membuka Discord Developer Portal...
start https://discord.com/developers/applications/1445650115447754933/oauth2
echo.
echo Membuka Vercel Dashboard...
start https://vercel.com/fivem-0f676644/v0-untitled-chat-3/settings/environment-variables
echo.
echo ✅ Ikuti step by step di atas!
echo.
pause
