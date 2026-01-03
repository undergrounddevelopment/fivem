# 🔧 FIX pnpm EPERM ERROR

## ❌ Error:
```
ERR_PNPM_EPERM  EPERM: operation not permitted, unlink 
'C:\Users\...\node_modules\.pnpm\lightningcss-win32-x64-msvc@1.30.2\...
\lightningcss.win32-x64-msvc.node'
```

## 🎯 SOLUSI CEPAT:

### Opsi 1: Gunakan Script (RECOMMENDED)

**PowerShell (Run as Administrator):**
```powershell
# Right-click PowerShell → Run as Administrator
.\fix-pnpm-eperm.ps1
```

**CMD (Run as Administrator):**
```cmd
# Right-click CMD → Run as Administrator
fix-pnpm-eperm.bat
```

### Opsi 2: Manual Fix

1. **Close all terminals and editors** (VS Code, etc.)

2. **Kill Node processes:**
```powershell
Get-Process -Name node | Stop-Process -Force
```

3. **Remove node_modules:**
```powershell
Remove-Item -Recurse -Force node_modules
```

4. **Clear pnpm cache:**
```bash
pnpm store prune
```

5. **Reinstall:**
```bash
pnpm install
```

### Opsi 3: Quick Fix (If file is locked)

**Close everything and run:**
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Remove node_modules
rmdir /s /q node_modules

# Reinstall
pnpm install
```

## 🔍 ROOT CAUSE

Error ini biasanya terjadi karena:
- ✅ File sedang digunakan oleh process lain (Node.js, editor, etc.)
- ✅ Antivirus atau security software blocking file deletion
- ✅ Permission issue (need Administrator)
- ✅ File lock oleh process lain

## ✅ SCRIPT AKAN MELAKUKAN:

1. ✅ Kill semua Node processes
2. ✅ Kill semua pnpm processes  
3. ✅ Remove node_modules folder
4. ✅ Remove .pnpm-store
5. ✅ Clear pnpm cache
6. ✅ Remove lock file
7. ✅ Optional: Reinstall dependencies

## 📝 TIPS:

1. **Run as Administrator** - Lebih efektif untuk remove locked files
2. **Close VS Code/Editor** - File mungkin sedang digunakan
3. **Close all terminals** - Pastikan tidak ada process yang menggunakan files
4. **Disable Antivirus temporarily** - Jika masih error, coba disable AV

## 🚀 SETELAH FIX

```bash
pnpm install
```

## ⚠️ IMPORTANT:

- Script ini akan **remove node_modules** (butuh reinstall)
- Pastikan semua **editors dan terminals ditutup**
- Lebih baik **run as Administrator**
- Backup project jika diperlukan

---

**Status**: ✅ FIX READY
**Script**: `fix-pnpm-eperm.ps1` / `fix-pnpm-eperm.bat`
**Recommendation**: Run as Administrator

