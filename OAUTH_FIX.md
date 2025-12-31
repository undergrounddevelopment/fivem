# 🔧 QUICK FIX - OAuth Callback Error

## ❌ MASALAH
```
https://www.fivemtools.net/?error=OAuthCallback
```

## 🎯 PENYEBAB
NEXTAUTH_URL tidak match dengan domain production (www vs non-www)

## ✅ SOLUSI

### 1. Update Vercel Environment Variables
```bash
# Login ke Vercel Dashboard
https://vercel.com/your-project/settings/environment-variables

# Update variable ini:
NEXTAUTH_URL=https://www.fivemtools.net
NEXT_PUBLIC_SITE_URL=https://www.fivemtools.net
NEXT_PUBLIC_APP_URL=https://www.fivemtools.net
```

### 2. Update Discord Developer Portal
```bash
# Login ke Discord Developer Portal
https://discord.com/developers/applications/1445650115447754933/oauth2

# Update Redirect URIs:
https://www.fivemtools.net/api/auth/callback/discord
```

### 3. Redeploy Vercel
```bash
# Trigger redeploy di Vercel Dashboard
# Atau push commit baru
```

## 📋 CHECKLIST

- [ ] Vercel: NEXTAUTH_URL = https://www.fivemtools.net
- [ ] Vercel: NEXT_PUBLIC_SITE_URL = https://www.fivemtools.net
- [ ] Discord: Redirect URI = https://www.fivemtools.net/api/auth/callback/discord
- [ ] Redeploy Vercel
- [ ] Test login

## 🚀 SETELAH UPDATE

1. Wait 2-3 menit untuk deployment
2. Clear browser cache
3. Test login: https://www.fivemtools.net
4. Klik "Login with Discord"
5. Should work! ✅
