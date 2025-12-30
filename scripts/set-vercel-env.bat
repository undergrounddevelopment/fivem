@echo off
echo ========================================
echo   Setting Vercel Environment Variables
echo ========================================
echo.

echo Setting Supabase variables...
vercel env add NEXT_PUBLIC_SUPABASE_URL production --yes
echo https://linnqtixdfjwbrixitrb.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU

vercel env add SUPABASE_SERVICE_ROLE_KEY production --yes
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE

echo Setting Database URLs...
vercel env add POSTGRES_URL production --yes
echo postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres

vercel env add DATABASE_URL production --yes
echo postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres

echo Setting Site URLs...
vercel env add NEXT_PUBLIC_SITE_URL production --yes
echo https://fivemtools.net

vercel env add NEXTAUTH_URL production --yes
echo https://fivemtools.net

echo.
echo ========================================
echo   Environment Variables Set!
echo   Now redeploy: vercel --prod
echo ========================================
pause
