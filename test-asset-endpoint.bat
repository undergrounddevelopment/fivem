@echo off
echo ========================================
echo    TESTING ASSET DETAIL ENDPOINT
echo ========================================
echo.

echo Testing API endpoint directly...
echo.

echo 1. Testing with curl:
curl -X GET "http://localhost:3002/api/assets/0d67ad51-bd57-433e-bc0a-3297dbfbb64a" -H "Accept: application/json" -v

echo.
echo.
echo 2. If curl shows 500 error, the issue is in the API endpoint
echo 3. If curl works but frontend fails, the issue is in the frontend
echo.

echo Starting development server...
pnpm dev