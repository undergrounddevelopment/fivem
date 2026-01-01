# 🔧 VERCEL DEPLOYMENT ERROR - SOLUSI LENGKAP

## ❌ Error Yang Terjadi:
```
Error: Git author your.email@example.com must have access to the team FIVEM on Vercel to create deployments.
```

## 🎯 SOLUSI CEPAT:

### Method 1: Fix Git Configuration
```bash
# Set proper Git config
git config --global user.email "admin@fivemtools.net"
git config --global user.name "FiveM Tools Admin"

# Deploy again
vercel --prod
```

### Method 2: Create New Vercel Project
```bash
# Remove existing Vercel config
rm -rf .vercel

# Create new project
vercel

# Deploy
vercel --prod
```

### Method 3: Deploy via GitHub
```bash
# 1. Create GitHub repository
# 2. Push code
git init
git add .
git commit -m "FiveM Tools V7"
git remote add origin https://github.com/YOUR_USERNAME/fivem-tools-v7.git
git push -u origin main

# 3. Connect to Vercel via GitHub dashboard
```

## 🔧 ENVIRONMENT VARIABLES

Pastikan environment variables sudah di-set di Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgres://postgres.linnqtixdfjwbrixitrb:***@aws-0-us-east-1.pooler.supabase.com:6543/postgres
POSTGRES_URL=postgres://postgres.linnqtixdfjwbrixitrb:***@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Discord
DISCORD_CLIENT_ID=1445650115447754933
DISCORD_CLIENT_SECRET=JXY7URZrY3zsN5Ca4kQ88tB0hUC2pXuW

# NextAuth
NEXTAUTH_SECRET=jAA23MIrEPe4YRDbknuuZfP+tAMp2vUzFJaIFL0Uyoc=
NEXTAUTH_URL=https://your-domain.vercel.app

# Admin
ADMIN_DISCORD_ID=1047719075322810378

# Linkvertise
LINKVERTISE_USER_ID=1461354
```

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Git config set properly
- [ ] Build successful (`pnpm build`)
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Discord OAuth URLs updated
- [ ] NextAuth URL updated to production domain

## 💡 TIPS:

1. **Gunakan GitHub Integration** - Lebih stabil daripada CLI
2. **Update OAuth URLs** - Setelah deploy, update Discord OAuth redirect URLs
3. **Check Environment** - Pastikan semua env vars ada di Vercel dashboard
4. **Test Production** - Test semua fitur setelah deploy

## 🔗 QUICK COMMANDS:

```bash
# Fix dan deploy
./fix-vercel-deploy.bat

# Alternative method
./deploy-alternative.bat

# Manual build test
pnpm build && pnpm start
```

## ✅ SETELAH DEPLOY BERHASIL:

1. Update Discord OAuth redirect URLs ke domain production
2. Update NEXTAUTH_URL ke domain production  
3. Test login dan semua fitur
4. Monitor logs di Vercel dashboard

---

**Status:** Ready to deploy dengan solusi di atas! 🚀