# ✅ FULL SQL SCHEMA - READY TO DEPLOY!

## 📦 Files Created

| File | Description | Size |
|------|-------------|------|
| `complete-schema.sql` | Full database schema | 15 tables + indexes + RLS |
| `seed-data.sql` | Sample data | Users, assets, forum, etc |
| `quick-deploy.bat` | **DEPLOY TOOL** | Auto + Manual options |
| `DEPLOY_SCHEMA.md` | Documentation | Step-by-step guide |

## 🚀 DEPLOY NOW (3 CARA)

### ⚡ Cara 1: SUPER QUICK (RECOMMENDED)

```bash
# Double click file ini:
quick-deploy.bat

# Pilih option 2 (Manual Deploy)
# Copy-paste ke Supabase SQL Editor
# Done! ✅
```

### 🔧 Cara 2: Manual via Supabase Dashboard

1. Buka: https://supabase.com/dashboard/project/linnqtixdfjwbrixitrb/editor
2. Klik **"SQL Editor"**
3. Copy isi `complete-schema.sql`
4. Paste & klik **"Run"**
5. Tunggu ~30 detik
6. ✅ Done!

### 💻 Cara 3: Via Command Line

```bash
# Install psql (PostgreSQL client)
# Then run:
psql "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres" -f complete-schema.sql
```

## 📊 Schema Details

### 15 Tables:

```
✅ users              - User accounts & profiles
✅ assets             - Scripts, MLOs, resources  
✅ forum_categories   - Forum categories
✅ forum_threads      - Forum threads
✅ forum_replies      - Thread replies
✅ announcements      - Site announcements
✅ banners            - Homepage banners
✅ spin_wheel_prizes  - Spin wheel prizes
✅ spin_wheel_tickets - User spin tickets
✅ spin_wheel_history - Spin history
✅ notifications      - User notifications
✅ activities         - Activity logs
✅ downloads          - Download history
✅ coin_transactions  - Coin transactions
✅ testimonials       - Asset reviews
```

### 14 Indexes:

```sql
idx_users_discord_id
idx_users_email
idx_assets_category
idx_assets_author
idx_assets_status
idx_forum_threads_category
idx_forum_threads_author
idx_forum_replies_thread
idx_forum_replies_author
idx_downloads_user
idx_downloads_asset
idx_notifications_user
idx_activities_user
idx_coin_transactions_user
```

### Security:

- ✅ Row Level Security (RLS) enabled
- ✅ Public read policies
- ✅ Service role full access
- ✅ Foreign key constraints
- ✅ Cascade deletes

## 🌱 Sample Data (Optional)

After deploying schema, run `seed-data.sql` untuk:
- 1 Admin user
- 3 Sample users  
- 6 Forum categories
- 2 Sample assets
- 8 Spin wheel prizes
- Sample testimonials & threads

## ✅ Verification

After deployment:

```bash
# Check tables
pnpm db:check

# Or manually in Supabase:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should return 15 tables!

## 🎯 Next Steps

1. ✅ Deploy schema → `quick-deploy.bat`
2. ✅ Add sample data → Run `seed-data.sql`  
3. ✅ Start app → `pnpm dev`
4. ✅ Test → http://localhost:3000

## 📝 Schema SQL Preview

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE,
  username TEXT NOT NULL,
  email TEXT UNIQUE,
  membership TEXT DEFAULT 'free',
  coins INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ...
);

-- Assets Table  
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  framework TEXT,
  coin_price INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  author_id UUID REFERENCES users(id),
  ...
);

-- + 13 more tables...
```

## 🔧 Troubleshooting

### "relation already exists"
Schema sudah ada. Drop dulu:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

### "permission denied"  
Pastikan pakai service_role key di Supabase Dashboard.

### Connection timeout
Gunakan manual deploy via Dashboard (lebih stabil).

## 🎉 READY!

**Database schema 100% complete!**

Tinggal deploy dan aplikasi siap jalan! 🚀

---

**Files Location:**
- Schema: `complete-schema.sql`
- Sample Data: `seed-data.sql`
- Deploy Tool: `quick-deploy.bat`
- Docs: `DEPLOY_SCHEMA.md`
