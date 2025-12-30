# 🚀 DEPLOYMENT GUIDE - GIT & VERCEL

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ System Ready:
- [x] Database: 609 users, 33 assets
- [x] Discord OAuth: Configured
- [x] Supabase: 100% (No Postgres)
- [x] Auto-update: 3 layers active
- [x] Tests: 8/8 passed (100%)
- [x] Build: Ready
- [x] Errors: 0

---

## 🔧 STEP 1: PREPARE FOR DEPLOYMENT

### 1.1 Create .gitignore
```bash
echo node_modules/ > .gitignore
echo .next/ >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo .vercel >> .gitignore
echo *.log >> .gitignore
```

### 1.2 Create .env.example
```bash
copy .env .env.example
```

Then edit `.env.example` and replace values with placeholders:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
ADMIN_DISCORD_ID=your_admin_discord_id

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 📦 STEP 2: INITIALIZE GIT

```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - FiveM Tools V7"

# Create GitHub repo (via GitHub website)
# Then add remote
git remote add origin https://github.com/YOUR_USERNAME/fivem-tools-v7.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 STEP 3: DEPLOY TO VERCEL

### 3.1 Via Vercel Dashboard:

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `pnpm build`
   - Output Directory: .next
   - Install Command: `pnpm install`

### 3.2 Environment Variables:

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=IdaM9Z2ufwSgUx3jk1kI5oQIkiYsWvcYLOu7QRyzelyBoLTNWEXqsh1gl+nMEbo4l+T56ampsHLiQJRj0kCSdA==

DISCORD_CLIENT_ID=1445650115447754933
DISCORD_CLIENT_SECRET=lVH1OJEVut2DdAfGyT9oC159aJ87Y1uW
ADMIN_DISCORD_ID=1047719075322810378

NEXTAUTH_SECRET=fivemtools_nextauth_secret_2025_production
NEXTAUTH_URL=https://your-domain.vercel.app

NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

LINKVERTISE_USER_ID=1461354
LINKVERTISE_AUTH_TOKEN=0e4fe4bd2f9dd70412858a5f154e50ada772176b13fb61d5aa0dceb7405c2d29
NEXT_PUBLIC_LINKVERTISE_ENABLED=true

CRON_SECRET=fivemtools_cron_secret_2025
```

### 3.3 Deploy:

Click "Deploy" button

---

## 🔐 STEP 4: UPDATE DISCORD OAUTH

After deployment, update Discord OAuth redirect URL:

1. Go to https://discord.com/developers/applications
2. Select your application
3. OAuth2 → Redirects
4. Add: `https://your-domain.vercel.app/api/auth/callback/discord`
5. Save

---

## ✅ STEP 5: VERIFY DEPLOYMENT

### Test these URLs:

```
https://your-domain.vercel.app
https://your-domain.vercel.app/api/health
https://your-domain.vercel.app/api/stats
https://your-domain.vercel.app/forum
https://your-domain.vercel.app/assets
```

### Test Login:
1. Click "Login with Discord"
2. Authorize
3. Check if user created in database
4. Check if navbar shows coins/username

---

## 🔄 STEP 6: CONTINUOUS DEPLOYMENT

Every push to `main` branch will auto-deploy:

```bash
# Make changes
git add .
git commit -m "Update: description"
git push origin main

# Vercel will auto-deploy
```

---

## 📊 MONITORING

### Vercel Dashboard:
- Deployments: Check build logs
- Analytics: Monitor traffic
- Logs: Check runtime errors

### Supabase Dashboard:
- Database: Monitor queries
- Auth: Check user logins
- Realtime: Monitor connections

---

## 🎯 POST-DEPLOYMENT CHECKLIST

- [ ] Site loads correctly
- [ ] Discord login works
- [ ] Users can register
- [ ] Stats show real data
- [ ] Forum accessible
- [ ] Assets browsable
- [ ] Navbar auto-updates
- [ ] Realtime working
- [ ] No console errors

---

## 🚨 TROUBLESHOOTING

### Build Fails:
```bash
# Clear cache locally
rmdir /s /q .next
pnpm install --force
pnpm build

# If success, push again
```

### Environment Variables:
- Check all vars are set in Vercel
- Redeploy after adding vars

### Discord OAuth:
- Verify redirect URL matches
- Check client ID/secret

---

## 📝 COMMANDS SUMMARY

```bash
# Local
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main

# Vercel (via dashboard)
1. Import repo
2. Add env vars
3. Deploy

# Updates
git add .
git commit -m "Update"
git push
```

---

**🎉 READY TO DEPLOY!**

Follow steps 1-6 in order.
