# ✅ DISCORD LOGIN - COMPLETE SETUP

## 🔐 Discord OAuth Configuration

### Status: ✅ RESTORED & READY

## 📋 Setup Steps:

### 1. Discord Developer Portal
**URL:** https://discord.com/developers/applications/1445650115447754933/oauth2

**Add Redirect URIs:**
```
https://www.fivemtools.net/api/auth/callback/discord
https://fivemtools.net/api/auth/callback/discord
http://localhost:3000/api/auth/callback/discord
```

**KLIK "SAVE CHANGES"** ✅

### 2. Environment Variables (.env)
```env
# NextAuth
NEXTAUTH_SECRET=fivemtools_nextauth_secret_2025_production
NEXTAUTH_URL=https://www.fivemtools.net

# Discord OAuth
DISCORD_CLIENT_ID=1445650115447754933
DISCORD_CLIENT_SECRET=lVH1OJEVut2DdAfGyT9oC159aJ87Y1uW
ADMIN_DISCORD_ID=1047719075322810378

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE
```

### 3. Vercel Environment Variables
**URL:** https://vercel.com/fivem-0f676644/v0-untitled-chat-3/settings/environment-variables

Add semua env vars di atas untuk:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Deploy
```bash
vercel --prod
```

## 🔄 Login Flow:

1. User klik "Login with Discord"
2. Redirect ke Discord OAuth
3. User authorize
4. Discord callback ke: `/api/auth/callback/discord`
5. NextAuth process:
   - Get Discord profile (id, username, email, avatar)
   - Check if user exists in `users` table
   - If exists: Update user data
   - If not: Create new user
   - Set JWT session
6. Redirect ke homepage (logged in)

## 👤 User Creation:

### New User:
```typescript
{
  discord_id: "123456789",
  username: "DiscordUsername",
  email: "user@example.com",
  avatar: "https://cdn.discordapp.com/avatars/...",
  coins: 100,
  is_admin: false,
  membership: "free"
}
```

### Admin User (Discord ID: 1047719075322810378):
```typescript
{
  discord_id: "1047719075322810378",
  username: "Admin",
  email: "admin@example.com",
  avatar: "...",
  coins: 999999,
  is_admin: true,
  membership: "admin"
}
```

## 🧪 Testing:

### Local:
```bash
pnpm dev
# Open: http://localhost:3000
# Click "Login with Discord"
```

### Production:
```
1. Open: https://www.fivemtools.net
2. Click "Login with Discord"
3. Authorize app
4. Should redirect back logged in
```

## 🔍 Troubleshooting:

### Error: OAuthCallback
- ✅ Check Discord redirect URI exact match
- ✅ Check NEXTAUTH_URL in Vercel
- ✅ Redeploy Vercel

### Error: Database
- ✅ Check Supabase connection
- ✅ Check `users` table exists
- ✅ Check SUPABASE_SERVICE_ROLE_KEY

### Error: Configuration
- ✅ Check all env vars set in Vercel
- ✅ Check DISCORD_CLIENT_ID & SECRET
- ✅ Redeploy after env changes

## 📝 Files:

- `lib/auth.ts` - NextAuth configuration ✅
- `app/api/auth/[...nextauth]/route.ts` - Auth API route
- `.env` - Local environment variables
- Vercel - Production environment variables

## ✅ Checklist:

- [x] Discord app created
- [x] Redirect URIs added
- [x] Environment variables set
- [x] Auth config restored
- [x] Supabase users table ready
- [ ] Discord redirect URIs saved (DO THIS!)
- [ ] Vercel env vars set (DO THIS!)
- [ ] Deploy to Vercel (DO THIS!)
- [ ] Test login (DO THIS!)

## 🚀 Quick Deploy:

```bash
# 1. Set Vercel env vars
vercel env pull

# 2. Deploy
vercel --prod

# 3. Test
# Open: https://www.fivemtools.net
```

---

**Status:** ✅ Discord Login System RESTORED  
**Next:** Add redirect URIs in Discord Portal → Deploy to Vercel → Test
