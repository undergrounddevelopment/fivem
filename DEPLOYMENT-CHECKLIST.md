# 🚀 DEPLOYMENT CHECKLIST

## ✅ PRE-DEPLOYMENT

### 1. Environment Variables
- [ ] Copy `.env.template` to `.env.local`
- [ ] Fill all REQUIRED variables
- [ ] Test locally with `npm run dev`
- [ ] Verify database connection
- [ ] Test Discord OAuth login

### 2. Database Setup
- [ ] Run `RUN-FULL-SETUP.bat` or manual setup
- [ ] Verify all tables created (21+ tables)
- [ ] Verify all functions created (12+ functions)
- [ ] Verify RLS policies (42+ policies)
- [ ] Test admin access

### 3. Code Quality
- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Test all major features

### 4. Security
- [ ] Rate limiting configured
- [ ] Input sanitization working
- [ ] Security headers set
- [ ] CSRF protection enabled
- [ ] Admin access restricted

---

## 🌐 VERCEL DEPLOYMENT

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready - 2025 edition"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select framework: **Next.js**
4. Click **Deploy**

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL (https://your-domain.vercel.app)
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
ADMIN_DISCORD_ID
DATABASE_URL
```

**Optional:**
```
LINKVERTISE_AUTH_TOKEN
LINKVERTISE_USER_ID
NEXT_PUBLIC_SITE_URL
```

### Step 4: Redeploy
- Click **Redeploy** after adding env vars
- Wait for build to complete
- Test production site

---

## ✅ POST-DEPLOYMENT

### 1. Verify Features
- [ ] Homepage loads correctly
- [ ] Modern design visible
- [ ] Login with Discord works
- [ ] Admin panel accessible
- [ ] Forum system works
- [ ] Coins system works
- [ ] Spin wheel works
- [ ] Asset upload/download works

### 2. Test Security
- [ ] Rate limiting active
- [ ] Security headers present
- [ ] XSS protection working
- [ ] Admin-only routes protected

### 3. Performance
- [ ] Lighthouse score > 90
- [ ] Page load < 2s
- [ ] Images optimized
- [ ] No console errors

### 4. SEO
- [ ] Meta tags correct
- [ ] Open Graph working
- [ ] Sitemap accessible
- [ ] Robots.txt correct

---

## 🔧 CUSTOM DOMAIN (OPTIONAL)

### Step 1: Add Domain in Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., fivemtools.net)
3. Copy DNS records

### Step 2: Configure DNS
Add these records to your domain provider:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Update Environment
```
NEXTAUTH_URL=https://fivemtools.net
NEXT_PUBLIC_SITE_URL=https://fivemtools.net
```

### Step 4: Update Discord OAuth
1. Go to Discord Developer Portal
2. Update Redirect URI to: `https://fivemtools.net/api/auth/callback/discord`

---

## 📊 MONITORING

### Analytics
- [ ] Vercel Analytics enabled
- [ ] Google Analytics working
- [ ] Error tracking setup (optional)

### Database
- [ ] Supabase dashboard accessible
- [ ] Backups configured
- [ ] Usage within limits

### Performance
- [ ] Monitor response times
- [ ] Check error rates
- [ ] Review user feedback

---

## 🐛 TROUBLESHOOTING

### Build Fails
```bash
# Clear cache
rm -rf .next
npm run build
```

### Environment Variables Not Working
- Check spelling
- Restart Vercel deployment
- Verify in Vercel dashboard

### Database Connection Issues
- Check connection string
- Verify Supabase is accessible
- Check RLS policies

### Discord OAuth Not Working
- Verify redirect URI
- Check client ID/secret
- Ensure NEXTAUTH_URL is correct

---

## ✅ FINAL CHECKLIST

- [ ] Site is live and accessible
- [ ] All features working
- [ ] No errors in console
- [ ] Performance is good
- [ ] Security is tight
- [ ] Analytics tracking
- [ ] Backups configured
- [ ] Documentation updated

---

## 🎉 SUCCESS!

Your FiveM Tools V7 - 2025 Edition is now live!

**Next Steps:**
1. Share with community
2. Monitor performance
3. Gather feedback
4. Plan updates

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Production URL:** _____________
