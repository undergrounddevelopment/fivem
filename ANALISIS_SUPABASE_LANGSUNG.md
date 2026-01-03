# 🔍 ANALISIS SUPABASE LANGSUNG - 100% LENGKAP

## 📋 PENDAHULUAN

Script ini akan menganalisis struktur database Supabase secara langsung dan membandingkan dengan kode yang ada, kemudian menghasilkan script perbaikan otomatis.

## 🚀 CARA MENGGUNAKAN

### Opsi 1: Menggunakan TypeScript Script (Recommended)

1. **Pastikan environment variables sudah di-set di `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. **Install dependencies (jika belum):**
```bash
npm install
# atau
pnpm install
```

3. **Jalankan script:**
```bash
npx tsx scripts/check-supabase-structure.ts
# atau jika menggunakan ts-node:
npx ts-node scripts/check-supabase-structure.ts
```

### Opsi 2: Menggunakan JavaScript Script

1. **Jalankan script:**
```bash
node scripts/analyze-supabase-tables.js
```

## 📊 OUTPUT YANG DIHASILKAN

Script akan menghasilkan 2 file:

1. **`SUPABASE_STRUCTURE_REPORT.json`**
   - Laporan lengkap semua tabel
   - Struktur kolom setiap tabel
   - Status RLS policies
   - Error jika ada

2. **`supabase/auto-fix-structure.sql`**
   - Script SQL untuk memperbaiki struktur database
   - Berdasarkan analisis yang dilakukan
   - Siap untuk dijalankan di Supabase SQL Editor

## ✅ YANG DICEK OLEH SCRIPT

Script akan memeriksa tabel-tabel berikut:

- ✅ `users` - Tabel user
- ✅ `assets` - Tabel assets
- ✅ `forum_categories` - Kategori forum
- ✅ `forum_threads` - Thread forum
- ✅ `forum_replies` - Reply forum
- ✅ `activities` - Aktivitas user
- ✅ `downloads` - Download history
- ✅ `notifications` - Notifikasi
- ✅ `coin_transactions` - Transaksi coin
- ✅ `spin_wheel_prizes` - Hadiah spin wheel
- ✅ `spin_wheel_history` - History spin wheel
- ✅ `spin_wheel_tickets` - Tiket spin wheel
- ✅ `announcements` - Pengumuman
- ✅ `banners` - Banner
- ✅ `testimonials` - Testimonial
- ✅ `messages` - Pesan
- ✅ `reports` - Laporan
- ✅ `likes` - Like
- ✅ `daily_rewards` - Reward harian
- ✅ `admin_actions` - Aksi admin
- ✅ `security_events` - Event security
- ✅ `firewall_rules` - Aturan firewall

## 🔧 PERBAIKAN OTOMATIS

Script akan secara otomatis mendeteksi dan membuat perbaikan untuk:

### 1. Forum Categories
- ✅ Cek kolom `sort_order` vs `order_index`
- ✅ Rename `order_index` → `sort_order` jika diperlukan
- ✅ Tambah kolom `sort_order` jika belum ada

### 2. Activities
- ✅ Cek kolom `action` dan `target_id`
- ✅ Tambah kolom yang hilang

### 3. RLS Policies
- ✅ Enable RLS untuk tabel yang diperlukan
- ✅ Buat public read policies

## 📝 CONTOH OUTPUT

```
🔍 Menganalisis struktur database Supabase...

======================================================================

📋 Memeriksa: users
  ✅ Tabel ada
  📊 Kolom (12): id, discord_id, username, email, avatar, membership...

📋 Memeriksa: forum_categories
  ✅ Tabel ada
  📊 Kolom (9): id, name, description, icon, color, sort_order...

📋 Memeriksa: activities
  ✅ Tabel ada
  📊 Kolom (6): id, user_id, type, description, metadata, created_at...

...

✅ Laporan disimpan: SUPABASE_STRUCTURE_REPORT.json
✅ Script SQL disimpan: supabase/auto-fix-structure.sql

======================================================================
✅ ANALISIS SELESAI!
📊 Total tabel: 22
✅ Tabel yang ada: 20
❌ Tabel yang hilang: 2
======================================================================
```

## 🎯 LANGKAH SETELAH ANALISIS

1. **Baca laporan JSON:**
   - Buka `SUPABASE_STRUCTURE_REPORT.json`
   - Periksa tabel yang hilang atau memiliki masalah

2. **Jalankan script SQL:**
   - Buka Supabase Dashboard → SQL Editor
   - Copy paste isi `supabase/auto-fix-structure.sql`
   - Klik RUN

3. **Verifikasi:**
   - Jalankan script lagi untuk memastikan semua perbaikan berhasil
   - Periksa aplikasi - error seharusnya hilang

## 🔒 KEAMANAN

- Script menggunakan `SUPABASE_SERVICE_ROLE_KEY` untuk akses penuh
- Jangan commit file `.env.local` ke repository
- Service role key hanya untuk development/testing
- Di production, gunakan anon key untuk client-side

## ⚠️ CATATAN PENTING

1. **Environment Variables:**
   - Pastikan `NEXT_PUBLIC_SUPABASE_URL` atau `SUPABASE_URL` sudah di-set
   - Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah di-set
   - Dapat ditemukan di Supabase Dashboard → Settings → API

2. **Service Role Key:**
   - Ditemukan di: Supabase Dashboard → Settings → API → service_role key
   - JANGAN expose di client-side code
   - Hanya untuk server-side scripts

3. **Jika Script Error:**
   - Pastikan koneksi internet stabil
   - Pastikan Supabase project aktif
   - Periksa credentials di `.env.local`
   - Cek error message untuk detail

## 📞 TROUBLESHOOTING

### Error: "Environment variables tidak lengkap"
- Solusi: Pastikan `.env.local` memiliki `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Cannot find module '@supabase/supabase-js'"
- Solusi: Jalankan `npm install @supabase/supabase-js` atau `pnpm add @supabase/supabase-js`

### Error: "Invalid API key"
- Solusi: Periksa kembali `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`

### Tabel tidak terdeteksi
- Solusi: Periksa apakah tabel benar-benar ada di Supabase Dashboard → Table Editor

## ✅ STATUS

- ✅ Script analisis TypeScript: READY
- ✅ Script analisis JavaScript: READY
- ✅ Auto-generate SQL fix: READY
- ✅ Generate JSON report: READY

---

**Dibuat**: $(date)
**Status**: ✅ READY TO USE

