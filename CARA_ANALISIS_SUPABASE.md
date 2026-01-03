# 🔍 CARA ANALISIS SUPABASE LANGSUNG - 100% LENGKAP

## 🚀 CARA CEPAT (RECOMMENDED)

### Langkah 1: Pastikan Environment Variables
Buat file `.env.local` di root project (jika belum ada):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Cara mendapatkan credentials:**
1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project Anda
3. Pergi ke Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (JANGAN gunakan anon key!)

### Langkah 2: Jalankan Script Analisis
```bash
npm run analyze:supabase
# atau
node scripts/analyze-supabase-direct.mjs
```

### Langkah 3: Lihat Hasil
Script akan menghasilkan:
1. **Console output** - Ringkasan analisis
2. **SUPABASE_ANALYSIS_REPORT.json** - Laporan lengkap dalam format JSON
3. **supabase/auto-fix-from-analysis.sql** - Script SQL untuk perbaikan otomatis

### Langkah 4: Jalankan Script Perbaikan
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi file `supabase/auto-fix-from-analysis.sql`
3. Klik RUN
4. Tunggu sampai selesai

### Langkah 5: Verifikasi
1. Refresh aplikasi
2. Cek browser console - error seharusnya hilang
3. Jalankan script analisis lagi untuk konfirmasi

---

## 📊 OUTPUT YANG DIHASILKAN

### 1. Console Output
```
🔍 ANALISIS DATABASE SUPABASE LANGSUNG

======================================================================
📡 URL: https://***.supabase.co
======================================================================

📋 Memeriksa 22 tabel...

  🔍 users... ✅ (12 kolom)
  🔍 assets... ✅ (15 kolom)
  🔍 forum_categories... ✅ (9 kolom)
  🔍 activities... ✅ (6 kolom)
  ...

======================================================================
📊 HASIL ANALISIS
======================================================================
✅ Tabel yang ada: 20
❌ Tabel yang hilang: 2
======================================================================

📄 LAPORAN DETAIL:
...
```

### 2. SUPABASE_ANALYSIS_REPORT.json
```json
{
  "timestamp": "2025-01-XX...",
  "supabaseUrl": "https://***.supabase.co",
  "totalTables": 22,
  "existingTables": 20,
  "missingTables": 2,
  "tables": {
    "forum_categories": {
      "exists": true,
      "columns": ["id", "name", "description", "icon", "color", "sort_order", ...],
      "columnInfo": [...],
      "sampleRow": {...}
    },
    ...
  }
}
```

### 3. supabase/auto-fix-from-analysis.sql
```sql
-- AUTO-GENERATED FIX SCRIPT
-- Generated: 2025-01-XX...
-- Based on analysis of 22 tables

-- Fix: Rename order_index to sort_order in forum_categories
ALTER TABLE forum_categories RENAME COLUMN order_index TO sort_order;

-- Fix: Add missing columns to activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS target_id TEXT;

-- RLS POLICIES
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view forum_categories" ON forum_categories FOR SELECT USING (true);
...
```

---

## ✅ YANG DICEK OLEH SCRIPT

Script akan memeriksa tabel-tabel berikut:

### Core Tables
- ✅ `users` - User accounts
- ✅ `assets` - Assets/resources
- ✅ `downloads` - Download history

### Forum Tables
- ✅ `forum_categories` - Forum categories
- ✅ `forum_threads` - Forum threads
- ✅ `forum_replies` - Forum replies

### Activity & Notification
- ✅ `activities` - User activities
- ✅ `notifications` - Notifications

### Monetization
- ✅ `coin_transactions` - Coin transactions
- ✅ `spin_wheel_prizes` - Spin wheel prizes
- ✅ `spin_wheel_history` - Spin wheel history
- ✅ `spin_wheel_tickets` - Spin wheel tickets

### Content
- ✅ `announcements` - Announcements
- ✅ `banners` - Banners
- ✅ `testimonials` - Testimonials

### Communication
- ✅ `messages` - Messages
- ✅ `reports` - Reports
- ✅ `likes` - Likes

### Admin & Security
- ✅ `admin_actions` - Admin actions
- ✅ `security_events` - Security events
- ✅ `firewall_rules` - Firewall rules

### Other
- ✅ `daily_rewards` - Daily rewards

---

## 🔧 PERBAIKAN OTOMATIS

Script akan secara otomatis mendeteksi dan membuat perbaikan untuk:

### 1. Forum Categories
- ✅ Cek kolom `sort_order` vs `order_index`
- ✅ Rename `order_index` → `sort_order` jika diperlukan
- ✅ Tambah kolom `sort_order` jika belum ada

### 2. Activities
- ✅ Cek kolom `action`, `target_id`, `description`
- ✅ Tambah kolom yang hilang

### 3. RLS Policies
- ✅ Enable RLS untuk tabel yang diperlukan
- ✅ Buat public read policies

---

## ⚠️ TROUBLESHOOTING

### Error: "Supabase credentials tidak ditemukan"
**Solusi:**
1. Pastikan file `.env.local` ada di root project
2. Pastikan berisi `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`
3. Atau set sebagai environment variables:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=https://...
   export SUPABASE_SERVICE_ROLE_KEY=...
   ```

### Error: "Invalid API key"
**Solusi:**
1. Pastikan menggunakan **service_role key**, BUKAN anon key
2. Service role key ada di: Supabase Dashboard → Settings → API → service_role key
3. Jangan expose service_role key di client-side code

### Error: "Cannot find module '@supabase/supabase-js'"
**Solusi:**
```bash
npm install @supabase/supabase-js
# atau
pnpm add @supabase/supabase-js
```

### Tabel tidak terdeteksi
**Solusi:**
1. Pastikan tabel benar-benar ada di Supabase Dashboard → Table Editor
2. Pastikan service_role key memiliki akses ke tabel
3. Cek apakah ada RLS yang terlalu ketat

---

## 🔒 KEAMANAN

⚠️ **PENTING:**
- Service role key memiliki akses penuh ke database
- JANGAN commit file `.env.local` ke repository
- JANGAN expose service_role key di client-side code
- Hanya gunakan untuk development/testing scripts

---

## 📝 CATATAN

1. Script ini aman untuk dijalankan berulang kali
2. Script hanya membaca struktur, tidak mengubah data
3. Script SQL yang dihasilkan dapat di-review sebelum dijalankan
4. Semua output disimpan dalam file untuk dokumentasi

---

## ✅ STATUS

- ✅ Script analisis: READY
- ✅ Auto-generate SQL fix: READY
- ✅ Generate JSON report: READY
- ✅ Support semua tabel: READY

---

**Dibuat**: $(date)
**Status**: ✅ READY TO USE

