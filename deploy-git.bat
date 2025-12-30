@echo off
echo.
echo ========================================
echo   DEPLOYMENT TO GIT - FIVEM TOOLS V7
echo ========================================
echo.

echo [1/5] Adding files to git...
git add .

echo.
echo [2/5] Creating commit...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Deploy: FiveM Tools V7 - Production Ready

git commit -m "%commit_msg%"

echo.
echo [3/5] Setting branch to main...
git branch -M main

echo.
echo [4/5] Ready to push!
echo.
echo NEXT STEPS:
echo 1. Create GitHub repository at: https://github.com/new
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git push -u origin main
echo.
echo OR run this script again after setting remote
echo.

git remote -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [5/5] Pushing to remote...
    git push -u origin main
    echo.
    echo ========================================
    echo   PUSHED TO GITHUB SUCCESSFULLY!
    echo ========================================
    echo.
    echo NEXT: Deploy to Vercel
    echo 1. Go to https://vercel.com
    echo 2. Import your GitHub repository
    echo 3. Add environment variables from .env
    echo 4. Click Deploy
    echo.
) else (
    echo Remote not set yet. Follow steps above.
)

pause
