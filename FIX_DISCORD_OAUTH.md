# 🔧 FIX DISCORD OAUTH ERROR

## ❌ Error: OAuthCallback

### Penyebab:
Discord OAuth redirect URI tidak match dengan yang terdaftar di Discord Developer Portal

## ✅ SOLUSI:

### 1. Buka Discord Developer Portal
https://discord.com/developers/applications/1445650115447754933/oauth2

### 2. Update Redirect URIs
Tambahkan URL ini di "Redirects":

```
https://www.fivemtools.net/api/auth/callback/discord
https://fivemtools.net/api/auth/callback/discord
http://localhost:3000/api/auth/callback/discord
```

### 3. Vercel Environment Variables
Pastikan di Vercel settings ada:

```env
NEXTAUTH_URL=https://www.fivemtools.net
NEXTAUTH_SECRET=fivemtools_nextauth_secret_2025_production
DISCORD_CLIENT_ID=1445650115447754933
DISCORD_CLIENT_SECRET=lVH1OJEVut2DdAfGyT9oC159aJ87Y1uW
```

### 4. Redeploy
```bash
vercel --prod
```

## 🔍 Check Discord App Settings:

1. **Application ID:** 1445650115447754933
2. **Redirect URIs harus ada:**
   - `https://www.fivemtools.net/api/auth/callback/discord`
   - `https://fivemtools.net/api/auth/callback/discord` (tanpa www)
3. **OAuth2 Scopes:** `identify` dan `email`

## 🧪 Test Login:
1. Buka: https://www.fivemtools.net
2. Klik "Login with Discord"
3. Authorize app
4. Redirect ke homepage (logged in)

## 📝 Quick Fix Commands:

```bash
# Set Vercel env vars
vercel env add NEXTAUTH_URL
# Enter: https://www.fivemtools.net

vercel env add DISCORD_CLIENT_ID
# Enter: 1445650115447754933

vercel env add DISCORD_CLIENT_SECRET
# Enter: lVH1OJEVut2DdAfGyT9oC159aJ87Y1uW

# Redeploy
vercel --prod
```

## ⚠️ IMPORTANT:
**Discord Developer Portal HARUS memiliki redirect URI yang EXACT MATCH!**

Jika masih error, cek:
1. ✅ Redirect URI di Discord = `https://www.fivemtools.net/api/auth/callback/discord`
2. ✅ NEXTAUTH_URL di Vercel = `https://www.fivemtools.net`
3. ✅ Client ID & Secret benar
4. ✅ Redeploy setelah update env vars
