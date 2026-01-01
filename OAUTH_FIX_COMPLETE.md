# 🔴 DISCORD OAUTH ERROR - COMPLETE FIX

## Error Details:
```
URL: https://www.fivemtools.net/?callbackUrl=https%3A%2F%2Fwww.fivemtools.net%2F&error=OAuthCallback
Error: OAuthCallback
```

## 🎯 ROOT CAUSE:
Discord Developer Portal **TIDAK MEMILIKI** redirect URI yang benar!

## ✅ COMPLETE FIX (5 STEPS):

### STEP 1: Discord Developer Portal
1. Buka: https://discord.com/developers/applications/1445650115447754933/oauth2
2. Login dengan akun Discord yang punya aplikasi ini
3. Scroll ke bagian **"Redirects"**
4. Tambahkan URL ini (klik "Add Redirect" untuk setiap URL):

```
https://www.fivemtools.net/api/auth/callback/discord
https://fivemtools.net/api/auth/callback/discord
http://localhost:3000/api/auth/callback/discord
```

5. **KLIK "SAVE CHANGES"** (PENTING!)

### STEP 2: Verify Discord Settings
Pastikan di Discord App:
- ✅ **OAuth2 Scopes:** `identify` dan `email` (sudah default)
- ✅ **Redirect URIs:** 3 URL di atas sudah tersimpan
- ✅ **Client ID:** 1445650115447754933
- ✅ **Client Secret:** Ada (jangan share!)

### STEP 3: Vercel Environment Variables
1. Buka: https://vercel.com/fivem-0f676644/v0-untitled-chat-3/settings/environment-variables
2. Pastikan ada (jika tidak ada, tambahkan):

```env
NEXTAUTH_URL=https://www.fivemtools.net
NEXTAUTH_SECRET=fivemtools_nextauth_secret_2025_production
DISCORD_CLIENT_ID=1445650115447754933
DISCORD_CLIENT_SECRET=lVH1OJEVut2DdAfGyT9oC159aJ87Y1uW
ADMIN_DISCORD_ID=1047719075322810378
```

3. Pilih environment: **Production**, **Preview**, **Development** (semua)

### STEP 4: Redeploy Vercel
1. Buka: https://vercel.com/fivem-0f676644/v0-untitled-chat-3
2. Klik tab **"Deployments"**
3. Pada deployment terakhir, klik **"..."** → **"Redeploy"**
4. Tunggu 2-3 menit sampai deployment selesai

### STEP 5: Test Login
1. Buka: https://www.fivemtools.net
2. Klik **"Login with Discord"**
3. Authorize aplikasi
4. **Harus redirect ke homepage dengan status logged in**

## 🔍 Troubleshooting:

### Jika masih error "OAuthCallback":
1. ✅ Cek Discord redirect URI **EXACT MATCH**: `https://www.fivemtools.net/api/auth/callback/discord`
2. ✅ Cek NEXTAUTH_URL di Vercel: `https://www.fivemtools.net` (tanpa trailing slash)
3. ✅ Clear browser cache & cookies
4. ✅ Try incognito/private mode
5. ✅ Redeploy Vercel lagi

### Jika error "Configuration":
```bash
# Check .env.production di Vercel
NEXTAUTH_URL harus ada dan benar
DISCORD_CLIENT_ID harus ada
DISCORD_CLIENT_SECRET harus ada
```

### Jika error "Database":
```bash
# Check Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## 📋 Checklist:

- [ ] Discord redirect URI added: `https://www.fivemtools.net/api/auth/callback/discord`
- [ ] Discord changes saved (klik "Save Changes")
- [ ] Vercel env vars set (NEXTAUTH_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET)
- [ ] Vercel redeployed
- [ ] Wait 2-3 minutes for deployment
- [ ] Test login: https://www.fivemtools.net
- [ ] Login works ✅

## 🎯 Expected Flow:

1. User clicks "Login with Discord"
2. Redirects to: `https://discord.com/oauth2/authorize?client_id=1445650115447754933...`
3. User authorizes
4. Discord redirects to: `https://www.fivemtools.net/api/auth/callback/discord?code=...`
5. NextAuth processes callback
6. Creates/updates user in Supabase `users` table
7. Sets JWT session
8. Redirects to: `https://www.fivemtools.net/` (logged in)

## 🚨 CRITICAL:
**Discord redirect URI HARUS EXACT MATCH dengan NEXTAUTH_URL + /api/auth/callback/discord**

Jika `NEXTAUTH_URL=https://www.fivemtools.net`  
Maka redirect URI = `https://www.fivemtools.net/api/auth/callback/discord`

**NO TRAILING SLASH!**

## 📞 Quick Links:

- Discord App: https://discord.com/developers/applications/1445650115447754933/oauth2
- Vercel Settings: https://vercel.com/fivem-0f676644/v0-untitled-chat-3/settings/environment-variables
- Vercel Deployments: https://vercel.com/fivem-0f676644/v0-untitled-chat-3
- Test Site: https://www.fivemtools.net

---

**Run:** `fix-discord-oauth.bat` untuk guided fix!
