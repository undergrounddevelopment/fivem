# 🔧 FIX VERCEL PROJECT NAME ERROR

## ❌ Error:
```
Error: Project names can be up to 100 characters long and must be lowercase. 
They can include letters, digits, and the following characters: '.', '_', '-'. 
However, they cannot contain the sequence '---'. (400)
```

## 🎯 SOLUSI CEPAT:

### Method 1: Gunakan Script (RECOMMENDED)

**Windows (PowerShell):**
```powershell
.\fix-vercel-project-name.ps1
```

**Windows (CMD):**
```cmd
fix-vercel-project-name.bat
```

### Method 2: Manual Fix

1. **Hapus config Vercel yang ada:**
```bash
# Windows
rmdir /s /q .vercel

# Linux/Mac
rm -rf .vercel
```

2. **Create project dengan nama yang valid:**
```bash
vercel --name fivem-tools-v7 --yes
```

3. **Deploy:**
```bash
vercel --prod --yes
```

### Method 3: Via Vercel Dashboard

1. Buka https://vercel.com/new
2. Import dari GitHub (jika sudah push)
3. Atau create project baru dengan nama: `fivem-tools-v7`
4. Set environment variables
5. Deploy

## ✅ NAMA PROJECT YANG VALID

**Valid:**
- ✅ `fivem-tools-v7`
- ✅ `fivem-tools-v7-production`
- ✅ `fivem_tools_v7`
- ✅ `fivem.tools.v7`

**Invalid:**
- ❌ `fivem---tools` (triple dash)
- ❌ `FIVEM-TOOLS` (uppercase)
- ❌ `fivem tools v7` (spaces)
- ❌ `fivem@tools#v7` (special chars)

## 🔧 ROOT CAUSE

Error ini biasanya terjadi karena:
1. Folder name workspace mengandung karakter khusus
2. Vercel auto-generate project name dari folder path
3. Path mengandung spaces atau karakter tidak valid

**Solusi:** Explicitly set project name dengan `--name` flag

## 📝 SETELAH FIX

1. ✅ Project name: `fivem-tools-v7`
2. ✅ Deploy berhasil
3. ✅ URL: `https://fivem-tools-v7.vercel.app`

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Hapus `.vercel` folder
- [ ] Set project name: `fivem-tools-v7`
- [ ] Deploy dengan `vercel --prod`
- [ ] Set environment variables di Vercel dashboard
- [ ] Verify deployment

---

**Status**: ✅ FIX READY
**Script**: `fix-vercel-project-name.bat` / `fix-vercel-project-name.ps1`

