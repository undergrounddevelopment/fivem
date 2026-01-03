# 🔧 FIX VERCEL TEAM ACCESS ERROR

## ❌ Error:
```
Error: Git author admin@fivemtools.net must have access to the team FIVEM on Vercel 
to create deployments.
```

## 🎯 SOLUSI:

### Opsi 1: Deploy sebagai Personal Account (RECOMMENDED) ⭐

**Cara:**
1. Ganti Git config email ke email Vercel account Anda
2. Deploy sebagai personal account (bukan team)

**Script:**
```powershell
.\fix-vercel-team-access.ps1
# Pilih opsi 1
```

**Manual:**
```powershell
# Set Git config ke email Vercel Anda
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Remove Vercel config
Remove-Item -Recurse -Force .vercel

# Create project (akan create di personal account)
vercel --name fivem-tools-v7 --yes

# Deploy
vercel --prod --yes
```

### Opsi 2: Invite Email ke Team FIVEM

**Langkah:**
1. Buka: https://vercel.com/teams/FIVEM/settings/members
2. Klik **"Invite Member"**
3. Masukkan email: `admin@fivemtools.net`
4. Set role: **Member** atau **Developer**
5. Klik **"Send Invitation"**
6. Check email dan **accept invitation**
7. Jalankan deploy lagi setelah accept

**Link langsung:**
https://vercel.com/teams/FIVEM/settings/members

### Opsi 3: Deploy via GitHub (RECOMMENDED untuk Production) ⭐⭐⭐

**Keuntungan:**
- ✅ Tidak perlu team access
- ✅ Auto-deploy saat push
- ✅ Lebih stabil
- ✅ Better for production

**Langkah 1: Push ke GitHub**
```bash
git init
git add .
git commit -m "Initial commit - FiveM Tools V7"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fivem-tools-v7.git
git push -u origin main
```

**Langkah 2: Import di Vercel**
1. Buka: https://vercel.com/new
2. Klik **"Import Git Repository"**
3. Pilih repository `fivem-tools-v7`
4. Framework: **Next.js** (auto-detected)
5. Set **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - dll
6. Klik **"Deploy"**

## 📋 QUICK FIX (Fastest)

**Gunakan script:**
```powershell
.\fix-vercel-team-access.ps1
```

Script akan menanyakan opsi dan guide Anda step-by-step.

## 🔍 ROOT CAUSE

Error ini terjadi karena:
- Git author email (`admin@fivemtools.net`) tidak punya akses ke team `FIVEM`
- Vercel memerlukan author email punya permission di team
- Personal account deployment tidak memerlukan team access

## ✅ RECOMMENDED SOLUTION

**Untuk Development:**
- Opsi 1: Deploy sebagai personal account

**Untuk Production:**
- Opsi 3: Deploy via GitHub (lebih stabil dan professional)

## 🚀 SETELAH FIX

1. ✅ Deploy berhasil
2. ✅ URL: `https://fivem-tools-v7.vercel.app`
3. ✅ Environment variables set di Vercel dashboard
4. ✅ Site live!

---

**Status**: ✅ FIX READY
**Script**: `fix-vercel-team-access.ps1` / `fix-vercel-team-access.bat`
**Recommended**: Opsi 3 (GitHub) untuk production

