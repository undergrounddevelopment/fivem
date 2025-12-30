# 🚀 QUICK START GUIDE

## Setup Database Connection

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE
POSTGRES_URL=postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
DISCORD_CLIENT_ID=<your-discord-client-id>
DISCORD_CLIENT_SECRET=<your-discord-client-secret>
```

### 3. Test Database Connection
```bash
npm run db:test
```

Expected output:
```
✅ Supabase Client: Connected
✅ Postgres.js: Connected
✅ Database Tables: 16
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Verify Health
```bash
# Open browser
http://localhost:3000/api/health

# Or use curl
npm run db:health
```

## Troubleshooting

### Connection Failed
1. Check `.env.local` exists
2. Verify credentials are correct
3. Check Supabase project is active
4. Run `npm run db:test`

### Tables Missing
1. Go to Supabase SQL Editor
2. Run `scripts/COMPLETE-DATABASE-SETUP-UPDATED.sql`
3. Verify with `npm run db:test`

### Build Errors
1. Clear cache: `rm -rf .next`
2. Reinstall: `rm -rf node_modules && npm install`
3. Build: `npm run build`

## Production Deploy

```bash
# Set environment variables in Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add POSTGRES_URL
vercel env add NEXTAUTH_SECRET
vercel env add DISCORD_CLIENT_ID
vercel env add DISCORD_CLIENT_SECRET

# Deploy
npm run deploy:prod
```

## Useful Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run db:test          # Test database connection
npm run db:health        # Check health endpoint
npm run test             # Run tests
npm run test:ui          # Run tests with UI
```

## Next Steps

1. ✅ Database connected
2. ⏳ Configure Discord OAuth
3. ⏳ Test authentication
4. ⏳ Upload first asset
5. ⏳ Deploy to production
