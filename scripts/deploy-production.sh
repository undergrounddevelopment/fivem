#!/bin/bash

echo "🚀 Deploying FiveM Tools V7 to Production"
echo "Domain: fivemtools.net"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "📦 Setting Environment Variables..."

# Production Environment Variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://linnqtixdfjwbrixitrb.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE"
vercel env add POSTGRES_URL production <<< "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
vercel env add DATABASE_URL production <<< "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://fivemtools.net"
vercel env add NEXTAUTH_URL production <<< "https://fivemtools.net"
vercel env add ADMIN_DISCORD_ID production <<< "1047719075322810378"

echo ""
echo "✅ Environment variables set"
echo ""
echo "🔨 Building and deploying..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site is live at: https://fivemtools.net"
echo "🔍 Health check: https://fivemtools.net/api/health"
echo ""
echo "📊 Next steps:"
echo "1. Configure custom domain in Vercel dashboard"
echo "2. Add Discord OAuth credentials"
echo "3. Test the deployment"
echo ""
