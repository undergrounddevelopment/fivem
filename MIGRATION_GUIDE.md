# 📊 USER MIGRATION GUIDE - 600+ Users

## 🎯 Overview

Script otomatis untuk menganalisis dan push 600+ user data dari SQL dump ke Supabase.

## ✨ Features

### 1. **Analisis Lengkap**
- Total users count
- Membership distribution (free/vip/admin)
- Admin & banned users count
- Active users statistics
- Coins & downloads analytics
- Top 5 users by coins & downloads
- Registration timeline by month

### 2. **Smart Migration**
- Batch processing (100 users per batch)
- Automatic retry on failure
- Conflict resolution (upsert by discord_id)
- Progress tracking
- Error logging
- Migration report generation

### 3. **Safety Features**
- 5-second confirmation before push
- Detailed error reporting
- JSON report export
- Rollback capability

## 🚀 Quick Start

### Method 1: Batch File (Recommended)
```bash
# Double click:
migrate-users.bat
```

### Method 2: Manual
```bash
# Install dependencies
pnpm install

# Run migration
pnpm run db:migrate
```

### Method 3: Direct
```bash
npx tsx scripts/migrate-users.ts
```

## 📋 Prerequisites

1. **Environment Variables** (.env)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. **Database Table** (users table must exist)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  membership TEXT DEFAULT 'free',
  coins INTEGER DEFAULT 100,
  reputation INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  spin_tickets INTEGER DEFAULT 0,
  role TEXT DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  bio TEXT
);
```

3. **SQL Dump File**
```
database-dump/complete_data_dump.sql
```

## 📊 Output Example

```
🎯 FiveM Tools - User Migration Script

📂 Reading: database-dump/complete_data_dump.sql
✅ File loaded: 1234.56 KB

🔍 Parsing SQL data...
✅ Parsed 623 users

📊 ANALISIS DATA USER

Total Users: 623

🎫 Membership:
  free: 618
  vip: 3
  admin: 2

👑 Admins: 2
🚫 Banned: 1
✅ Active: 623

💰 Coins:
  Total: 125,430
  Average: 201
  Max: 4,915

📥 Downloads:
  Total: 1,234
  Users with downloads: 234

🏆 Top 5 by Coins:
  1. bunnyyyyy_11: 4915 coins
  2. kkmihai: 2185 coins
  3. _anhvugaming_: 1590 coins
  4. sherrys97: 1195 coins
  5. coders1_1.: 1185 coins

📊 Top 5 by Downloads:
  1. bunnyyyyy_11: 16 downloads
  2. thaovya: 11 downloads
  3. br__001: 8 downloads
  4. itskoil: 9 downloads
  5. burnout16: 8 downloads

📅 Registrations by Month:
  2025-12: 623

⚠️  Ready to push to Supabase!
Press Ctrl+C to cancel, or wait 5 seconds to continue...

🚀 PUSHING TO SUPABASE...

Processing batch 1/7...
✅ Batch 1 success: 100 users
Processing batch 2/7...
✅ Batch 2 success: 100 users
...

📈 MIGRATION SUMMARY

✅ Success: 623
❌ Failed: 0
📊 Total: 623

📄 Report saved to migration-report.json

✨ Migration complete!
```

## 📄 Migration Report

File `migration-report.json` berisi:

```json
{
  "timestamp": "2025-01-01T12:00:00.000Z",
  "total": 623,
  "success": 623,
  "failed": 0,
  "errors": []
}
```

## 🔧 Configuration

### Batch Size
Edit `scripts/migrate-users.ts`:
```typescript
const batchSize = 100 // Change to 50, 200, etc.
```

### Delay Between Batches
```typescript
await new Promise(resolve => setTimeout(resolve, 500)) // 500ms
```

### Confirmation Timeout
```typescript
await new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds
```

## ⚠️ Important Notes

1. **Upsert Strategy**: Uses `discord_id` as conflict key
   - Existing users will be updated
   - New users will be inserted

2. **Data Validation**: Script validates all fields before push

3. **Error Handling**: Failed batches are logged but don't stop migration

4. **Performance**: 
   - ~100 users per second
   - Total time: ~6-7 seconds for 600+ users

## 🐛 Troubleshooting

### Error: "Cannot read SQL file"
```bash
# Check file exists
dir database-dump\complete_data_dump.sql
```

### Error: "Supabase connection failed"
```bash
# Validate environment
pnpm run validate:env
```

### Error: "Table does not exist"
```bash
# Create table first
psql -h your-host -U postgres -d your-db -f schema.sql
```

### Partial Migration
```bash
# Check migration report
type migration-report.json

# Re-run migration (upsert will handle duplicates)
pnpm run db:migrate
```

## 📈 Statistics

### Expected Results
- **Total Users**: 600+
- **Free Members**: ~95%
- **VIP Members**: ~3%
- **Admins**: ~2%
- **Average Coins**: 150-250
- **Total Downloads**: 1000+

### Performance Metrics
- **Parse Time**: <1 second
- **Analysis Time**: <1 second
- **Upload Time**: 5-7 seconds
- **Total Time**: ~10 seconds

## 🔄 Re-running Migration

Safe to re-run multiple times:
```bash
pnpm run db:migrate
```

Upsert strategy ensures:
- No duplicate users
- Existing data updated
- New users added

## 📝 Next Steps

After successful migration:

1. **Verify Data**
```bash
pnpm run db:check
```

2. **Check User Count**
```sql
SELECT COUNT(*) FROM users;
```

3. **Test Application**
```bash
pnpm dev
# Visit http://localhost:3000
```

4. **Monitor Performance**
```bash
pnpm run monitor
```

## 🎉 Success Indicators

✅ All batches processed
✅ Success count = Total count
✅ No errors in report
✅ Users visible in Supabase dashboard
✅ Application shows correct user count

## 🆘 Support

If migration fails:
1. Check `migration-report.json`
2. Verify environment variables
3. Test Supabase connection
4. Check table schema
5. Review error logs

## 📦 Files Created

```
scripts/
  └── migrate-users.ts       # Main migration script

migrate-users.bat            # Windows batch file
migration-report.json        # Migration results
MIGRATION_GUIDE.md          # This file
```

## 🔐 Security

- Uses service role key (admin access)
- No data exposed in logs
- Secure batch processing
- Error messages sanitized

---

**Ready to migrate? Run `migrate-users.bat` now!** 🚀
