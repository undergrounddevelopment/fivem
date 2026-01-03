# 🚀 DEPLOY KE VERCEL CLI - INSTANT

## ⚡ QUICK DEPLOY

### PowerShell (Recommended):
```powershell
.\deploy-vercel-now.ps1
```

### CMD:
```cmd
deploy-vercel-now.bat
```

### NPM Script:
```bash
npm run deploy:now
```

## ✅ YANG AKAN DILAKUKAN SCRIPT

1. ✅ Check Vercel CLI installation
2. ✅ Set Git config (jika diperlukan)
3. ✅ Check Vercel login (auto login jika belum)
4. ✅ Clean existing config
5. ✅ Create/Update project: `fivem-tools-v7`
6. ✅ Deploy to production
7. ✅ Show deployment URL

## 📋 REQUIREMENTS

- ✅ Vercel CLI installed: `npm i -g vercel`
- ✅ Logged in to Vercel (script akan auto-login)
- ✅ Git configured (script akan set jika belum)

## 🎯 SETELAH DEPLOY

### 1. Set Environment Variables

Buka: https://vercel.com/dashboard
→ Select project: `fivem-tools-v7`
→ Settings → Environment Variables
→ Add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_SECRET=jAA23MIrEPe4YRDbknuuZfP+tAMp2vUzFJaIFL0Uyoc=
NEXTAUTH_URL=https://fivem-tools-v7.vercel.app
DISCORD_CLIENT_ID=1445650115447754933
DISCORD_CLIENT_SECRET=JXY7URZrY3zsN5Ca4kQ88tB0hUC2pXuW
ADMIN_DISCORD_ID=1047719075322810378
```

### 2. Redeploy

Setelah set environment variables, redeploy:
```bash
vercel --prod
```

## 🌐 DEPLOYMENT URL

Setelah deploy berhasil:
- **Production**: https://fivem-tools-v7.vercel.app
- **Preview**: https://fivem-tools-v7-[hash].vercel.app

## 🔧 TROUBLESHOOTING

### Error: Vercel CLI tidak ditemukan
```bash
npm i -g vercel
```

### Error: Not logged in
Script akan auto-login, atau manual:
```bash
vercel login
```

### Error: Project name invalid
Script sudah menggunakan nama valid: `fivem-tools-v7`

### Error: Team access
Script menggunakan personal account (tidak perlu team access)

## ✅ STATUS

- ✅ Script PowerShell: READY
- ✅ Script CMD: READY
- ✅ NPM script: READY
- ✅ Auto-login: READY
- ✅ Error handling: READY

---

**Cara cepat**: Jalankan `.\deploy-vercel-now.ps1` atau `npm run deploy:now`

