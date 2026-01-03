@echo off
echo 🚀 DEPLOY KE VERCEL CLI
echo ==================================================
echo.

echo 📦 Checking Vercel CLI...
where vercel >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI tidak ditemukan!
    echo 📥 Install dengan: npm i -g vercel
    pause
    exit /b 1
)
echo ✅ Vercel CLI ditemukan
echo.

echo 📧 Setting Git config...
for /f "tokens=*" %%i in ('git config user.email') do set CURRENT_EMAIL=%%i
if "%CURRENT_EMAIL%"=="" (
    set /p VERCEL_EMAIL="Masukkan email Vercel account Anda: "
    if not "%VERCEL_EMAIL%"=="" (
        git config user.email "%VERCEL_EMAIL%"
        git config user.name "FiveM Tools"
        echo ✅ Git config updated
    )
) else (
    echo ✅ Using Git email: %CURRENT_EMAIL%
)
echo.

echo 🧹 Cleaning Vercel config...
if exist .vercel (
    rmdir /s /q .vercel
    echo ✅ Removed .vercel folder
) else (
    echo ✅ No existing config
)
echo.

echo 🔐 Checking Vercel login...
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Not logged in to Vercel
    echo 🔑 Logging in...
    vercel login
    if errorlevel 1 (
        echo ❌ Login failed!
        pause
        exit /b 1
    )
) else (
    echo ✅ Logged in to Vercel
)
echo.

echo 🚀 Creating/Updating Vercel project...
echo Project name: fivem-tools-v7
echo.
vercel --name fivem-tools-v7 --yes

if errorlevel 1 (
    echo.
    echo ❌ Project creation failed!
    echo Check error above for details
    pause
    exit /b 1
)

echo.
echo ✅ Project created/updated successfully!
echo.

echo 🌐 Deploying to production...
vercel --prod --yes

if errorlevel 1 (
    echo.
    echo ❌ Production deployment failed!
    echo Check error above for details
    pause
    exit /b 1
)

echo.
echo ==================================================
echo ✅ DEPLOYMENT SUCCESSFUL!
echo ==================================================
echo.
echo 🌐 Your site is live at:
echo    https://fivem-tools-v7.vercel.app
echo.
echo 📝 Next steps:
echo    1. Set environment variables in Vercel dashboard
echo    2. Go to: https://vercel.com/dashboard
echo    3. Select project: fivem-tools-v7
echo    4. Go to Settings → Environment Variables
echo    5. Add all required variables
echo.
pause

