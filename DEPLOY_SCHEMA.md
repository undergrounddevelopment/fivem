# 🚀 Deploy Full Database Schema

## ✅ Files Created

1. **complete-schema.sql** - Full database schema (15 tables + indexes + RLS)
2. **seed-data.sql** - Sample data untuk testing
3. **apply-schema.bat** - Helper untuk apply schema

## 📋 Cara Deploy (MUDAH!)

### Method 1: Via Supabase Dashboard (RECOMMENDED)

1. **Double click:** `apply-schema.bat`
2. File SQL akan terbuka di Notepad
3. Browser akan membuka Supabase Dashboard
4. Di Supabase:
   - Klik **"SQL Editor"** di sidebar
   - Copy semua isi dari `complete-schema.sql`
   - Paste ke SQL Editor
   - Klik **"Run"** atau tekan `Ctrl+Enter`
5. Tunggu sampai selesai (~30 detik)
6. Ulangi untuk `seed-data.sql` (optional, untuk sample data)

### Method 2: Via Supabase CLI

```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref linnqtixdfjwbrixitrb

# Apply schema
supabase db push --db-url "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Or execute SQL directly
psql "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres" -f complete-schema.sql
```

## 📊 Schema Overview

### 15 Tables Created:

1. **users** - User accounts & profiles
2. **assets** - Scripts, MLOs, resources
3. **forum_categories** - Forum categories
4. **forum_threads** - Forum threads
5. **forum_replies** - Thread replies
6. **announcements** - Site announcements
7. **banners** - Homepage banners
8. **spin_wheel_prizes** - Spin wheel prizes
9. **spin_wheel_tickets** - User spin tickets
10. **spin_wheel_history** - Spin history
11. **notifications** - User notifications
12. **activities** - Activity logs
13. **downloads** - Download history
14. **coin_transactions** - Coin transactions
15. **testimonials** - Asset reviews

### Features:

- ✅ **Foreign Keys** - Proper relationships
- ✅ **Indexes** - Optimized queries
- ✅ **RLS Policies** - Row Level Security
- ✅ **Constraints** - Data validation
- ✅ **Defaults** - Auto values
- ✅ **Cascades** - Auto cleanup

## 🔐 Security

- RLS enabled on all tables
- Public read access for public data
- Service role full access for API
- Proper foreign key constraints

## 🌱 Sample Data

File `seed-data.sql` includes:
- 1 Admin user
- 3 Sample users
- 6 Forum categories
- 2 Sample assets
- 2 Announcements
- 2 Banners
- 8 Spin wheel prizes
- Sample testimonials
- Sample forum thread

## ✅ Verification

After deployment, check:

```bash
# Run this to verify
pnpm db:check
```

Or manually check in Supabase Dashboard:
- Table Editor → See all 15 tables
- SQL Editor → Run: `SELECT COUNT(*) FROM users;`

## 🔧 Troubleshooting

### Error: "relation already exists"

Schema sudah ada. Untuk reset:

```sql
-- Run di SQL Editor untuk drop semua
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Lalu run complete-schema.sql lagi
```

### Error: "permission denied"

Pastikan menggunakan **service_role** key, bukan anon key.

## 📚 Next Steps

1. ✅ Deploy schema → `apply-schema.bat`
2. ✅ Add sample data → Run `seed-data.sql`
3. ✅ Test API → `pnpm dev`
4. ✅ Check data → `pnpm db:check`

## 🎉 Done!

Database siap 100%! Tinggal jalankan aplikasi:

```bash
pnpm dev
```

Buka: http://localhost:3000
