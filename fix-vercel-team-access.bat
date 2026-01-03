@echo off
echo 🔧 FIXING VERCEL TEAM ACCESS ERROR
echo.

echo ❌ Error: Git author must have access to the team FIVEM on Vercel
echo.

echo 🎯 SOLUSI:
echo.
echo Opsi 1: Deploy sebagai Personal Account (RECOMMENDED)
echo Opsi 2: Invite email ke team FIVEM
echo Opsi 3: Deploy via GitHub (Tidak perlu team access)
echo.

set /p choice="Pilih opsi (1/2/3) [default: 1]: "
if "%choice%"=="" set choice=1

if "%choice%"=="1" goto personal
if "%choice%"=="2" goto invite
if "%choice%"=="3" goto github
goto personal

:personal
echo.
echo 📧 Setting Git config ke email personal Anda...
set /p email="Masukkan email Vercel account Anda: "
if "%email%"=="" (
    echo ❌ Email tidak boleh kosong!
    pause
    exit /b 1
)

git config user.email "%email%"
git config user.name "Your Name"

echo ✅ Git config updated
echo.
echo 🧹 Removing existing Vercel config...
if exist .vercel (
    rmdir /s /q .vercel
    echo ✅ Removed .vercel folder
)

echo.
echo 🚀 Creating Vercel project (Personal Account)...
vercel --name fivem-tools-v7 --yes

echo.
echo 🌐 Deploying to production...
vercel --prod --yes
goto end

:invite
echo.
echo 📋 Langkah-langkah invite email ke team:
echo.
echo 1. Buka https://vercel.com/teams/FIVEM/settings/members
echo 2. Klik 'Invite Member'
echo 3. Masukkan email: admin@fivemtools.net
echo 4. Set role: Member atau Developer
echo 5. Klik 'Send Invitation'
echo 6. Check email dan accept invitation
echo 7. Jalankan script lagi setelah accept invitation
echo.
echo Atau buka link ini:
echo https://vercel.com/teams/FIVEM/settings/members
echo.
pause
goto end

:github
echo.
echo 🚀 DEPLOY VIA GITHUB (RECOMMENDED)
echo.
echo Langkah 1: Push ke GitHub
echo   git init
echo   git add .
echo   git commit -m "Initial commit"
echo   git remote add origin https://github.com/YOUR_USERNAME/fivem-tools-v7.git
echo   git push -u origin main
echo.
echo Langkah 2: Import di Vercel
echo   1. Buka https://vercel.com/new
echo   2. Klik 'Import Git Repository'
echo   3. Pilih repository fivem-tools-v7
echo   4. Set environment variables
echo   5. Deploy!
echo.
pause
goto end

:end
echo.
echo ✅ Selesai!
echo.
pause

