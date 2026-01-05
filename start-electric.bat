@echo off
echo ========================================
echo  FiveM Tools V7 - Electric Theme Test
echo ========================================
echo.

echo [1/4] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    pnpm install
) else (
    echo Dependencies OK
)

echo.
echo [2/4] Validating environment...
node -e "
const fs = require('fs');
try {
  const env = fs.readFileSync('.env', 'utf8');
  console.log('Environment file exists');
  if (env.includes('SUPABASE_URL')) {
    console.log('✅ Supabase configured');
  }
  if (env.includes('DISCORD_CLIENT_ID')) {
    console.log('✅ Discord OAuth configured');
  }
} catch (e) {
  console.log('❌ Environment file missing');
}
"

echo.
echo [3/4] Building with electric theme...
pnpm build

echo.
echo [4/4] Starting development server...
echo.
echo ========================================
echo  🎨 Electric Pink Theme Applied!
echo  🚀 Server starting at http://localhost:3000
echo ========================================
echo.

pnpm dev