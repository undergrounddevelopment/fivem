# 🚀 FiveM Tools V7 - Quick Start

## ✅ Status Koneksi
Semua koneksi database dan API sudah dikonfigurasi dengan benar!

## 📋 Yang Perlu Dilakukan

### 1. Setup Discord OAuth (Wajib untuk Login)
Buka `.env` dan isi:
```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

**Cara mendapatkan:**
1. Buka https://discord.com/developers/applications
2. Buat aplikasi baru
3. Copy Client ID dan Client Secret
4. Tambahkan redirect URL: `http://localhost:3000/api/auth/callback/discord`

### 2. Install & Run
```bash
# Install dependencies
pnpm install

# Validasi environment
pnpm run validate:env

# Run development
pnpm dev
```

### 3. Buka Browser
```
http://localhost:3000
```

## 📁 File Penting

- `.env` - Konfigurasi environment (sudah disetup)
- `KONEKSI_GUIDE.md` - Dokumentasi lengkap koneksi
- `lib/supabase/` - Konfigurasi database
- `lib/fivem-api.ts` - API helper

## 🔧 Commands

```bash
pnpm dev              # Development server
pnpm build            # Build production
pnpm start            # Start production
pnpm validate:env     # Check environment variables
pnpm test:all         # Run all tests
```

## 🐛 Troubleshooting

**Error: Missing Discord credentials**
→ Isi DISCORD_CLIENT_ID dan DISCORD_CLIENT_SECRET di `.env`

**Error: Database connection failed**
→ Sudah dikonfigurasi dengan benar, pastikan internet aktif

**Error: Build failed**
→ Jalankan `pnpm install` terlebih dahulu

## 📚 Dokumentasi Lengkap

Lihat `KONEKSI_GUIDE.md` untuk dokumentasi lengkap tentang:
- Konfigurasi database
- API endpoints
- Security setup
- Testing procedures

---

**Ready to go!** Tinggal isi Discord credentials dan jalankan `pnpm dev` 🎉
