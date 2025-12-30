# 🚀 DEPLOYMENT CHECKLIST

## ✅ PRE-DEPLOYMENT (DONE)

- [x] System tested (8/8 passed)
- [x] Database ready (609 users, 33 assets)
- [x] Discord OAuth configured
- [x] Supabase 100% (no Postgres)
- [x] Auto-update active (3 layers)
- [x] No errors
- [x] .gitignore created
- [x] .env.example created
- [x] vercel.json created

---

## 📦 STEP 1: GITHUB

### 1.1 Create Repository
- [ ] Go to https://github.com/new
- [ ] Repository name: `fivem-tools-v7`
- [ ] Description: `FiveM Tools V7 - Scripts, MLOs, Resources Platform`
- [ ] Public or Private: Your choice
- [ ] DO NOT initialize with README
- [ ] Click "Create repository"

### 1.2 Push Code
```bash
# Run this:
deploy-git.bat

# Or manually:
git add .
git commit -m "Initial commit - FiveM Tools V7"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fivem-tools-v7.git
git push -u origin main
```

- [ ] Code pushed to GitHub

---

## 🌐 STEP 2: VERCEL

### 2.1 Import Project
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select your `fivem-tools-v7` repo
- [ ] Click "Import"

### 2.2 Configure Project
- [ ] Framework Preset: **Next.js** (auto-detected)
- [ ] Root Directory: `./`
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `pnpm install`

### 2.3 Environment Variables
Copy from your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE
SUPABASE_JWT_SECRET=IdaM9Z2ufwSgUx3jk1kI5oQIkiYsWvcYLOu7QRyzelyBoLTNWEXqsh1gl+nMEbo4l+T56ampsHLiQJRj0kCSdA==

DISCORD_CLIENT_ID=1445650115447754933
DISCORD_CLIENT_SECRET=lVH1OJEVut2DdAfGyT9oC159aJ87Y1uW
ADMIN_DISCORD_ID=1047719075322810378

NEXTAUTH_SECRET=fivemtools_nextauth_secret_2025_production
NEXTAUTH_URL=https://YOUR-DOMAIN.vercel.app

NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN.vercel.app
NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN.vercel.app

LINKVERTISE_USER_ID=1461354
LINKVERTISE_AUTH_TOKEN=0e4fe4bd2f9dd70412858a5f154e50ada772176b13fb61d5aa0dceb7405c2d29
NEXT_PUBLIC_LINKVERTISE_ENABLED=true

CRON_SECRET=fivemtools_cron_secret_2025
```

**IMPORTANT:** Replace `YOUR-DOMAIN` with your actual Vercel domain after deployment!

- [ ] All environment variables added

### 2.4 Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Note your domain: `https://your-project.vercel.app`

---

## 🔐 STEP 3: UPDATE DISCORD OAUTH

- [ ] Go to https://discord.com/developers/applications
- [ ] Select application: `1445650115447754933`
- [ ] OAuth2 → Redirects
- [ ] Add: `https://your-project.vercel.app/api/auth/callback/discord`
- [ ] Save Changes

---

## 🔄 STEP 4: UPDATE ENVIRONMENT VARIABLES

After getting your Vercel domain:

- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Update `NEXTAUTH_URL` to your domain
- [ ] Update `NEXT_PUBLIC_SITE_URL` to your domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to your domain
- [ ] Click "Redeploy" to apply changes

---

## ✅ STEP 5: VERIFY DEPLOYMENT

### Test URLs:
- [ ] Homepage: `https://your-domain.vercel.app`
- [ ] Health: `https://your-domain.vercel.app/api/health`
- [ ] Stats: `https://your-domain.vercel.app/api/stats`
- [ ] Forum: `https://your-domain.vercel.app/forum`
- [ ] Assets: `https://your-domain.vercel.app/assets`

### Test Features:
- [ ] Click "Login with Discord"
- [ ] Authorize application
- [ ] Check if redirected back
- [ ] Check if username shows in navbar
- [ ] Check if coins show in navbar
- [ ] Browse assets
- [ ] Check forum
- [ ] Check stats on homepage

---

## 🎯 POST-DEPLOYMENT

### Monitor:
- [ ] Vercel Dashboard → Analytics
- [ ] Vercel Dashboard → Logs
- [ ] Supabase Dashboard → Database
- [ ] Supabase Dashboard → Auth

### Share:
- [ ] Share your domain
- [ ] Test with real users
- [ ] Monitor for errors

---

## 🚨 TROUBLESHOOTING

### Build Failed:
1. Check Vercel build logs
2. Verify all env vars are set
3. Check for missing dependencies

### Login Not Working:
1. Verify Discord redirect URL
2. Check NEXTAUTH_URL matches domain
3. Check Discord client ID/secret

### Database Issues:
1. Check Supabase connection
2. Verify service role key
3. Check table permissions

---

## 📊 SUCCESS METRICS

After deployment, you should see:
- ✅ Site loads in < 2 seconds
- ✅ Discord login works
- ✅ Users can register
- ✅ Stats show: 609 users, 33 assets
- ✅ Navbar auto-updates
- ✅ No console errors

---

**🎉 READY TO DEPLOY!**

Start with Step 1: GitHub
