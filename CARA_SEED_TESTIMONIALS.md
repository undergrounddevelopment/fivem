# 🚀 CARA SEED TESTIMONIALS - LANGKAH DEMI LANGKAH

## ✅ HASIL ANALISIS

```
Table: testimonials ✅ EXISTS
Data: 0 rows ❌ EMPTY
```

## 📝 LANGKAH-LANGKAH

### 1. Buka Supabase Dashboard
```
https://supabase.com/dashboard/project/linnqtixdfjwbrixitrb
```

### 2. Klik "SQL Editor" di sidebar kiri

### 3. Klik "New Query"

### 4. Copy & Paste SQL ini:

```sql
-- SEED TESTIMONIALS DATA
INSERT INTO testimonials (
    username, avatar, rating, content, 
    server_name, upvotes_received, 
    is_featured, is_verified, badge
) VALUES
('JohnDoe_RP', 'https://i.pravatar.cc/150?img=1', 5, 
 'Amazing service! Got 10,000 upvotes in just 30 minutes!', 
 'Los Santos Roleplay', 10000, true, true, 'verified'),

('MikeGaming', 'https://i.pravatar.cc/150?img=2', 5,
 'Best upvote service ever! Fast delivery and professional!',
 'Vice City RP', 15000, true, true, 'pro'),

('SarahAdmin', 'https://i.pravatar.cc/150?img=3', 5,
 'Professional and reliable. Got 20k upvotes!',
 'Liberty City RP', 20000, true, true, 'vip'),

('AlexServer', 'https://i.pravatar.cc/150?img=4', 5,
 'Lifetime plan is the best investment!',
 'San Andreas RP', 50000, true, true, 'premium'),

('EmmaRP', 'https://i.pravatar.cc/150?img=5', 5,
 'Got 8k upvotes in 20 minutes! Server went from 20 to 80 players!',
 'RedM Western RP', 8000, true, true, 'verified'),

('DavidGamer', 'https://i.pravatar.cc/150?img=6', 5,
 'Fast and efficient! Server ranking improved dramatically!',
 'Eclipse RP', 12000, true, false, NULL),

('LisaAdmin', 'https://i.pravatar.cc/150?img=7', 5,
 'Excellent service! Got exactly what I paid for!',
 'NoPixel Inspired', 18000, true, true, 'pro'),

('ChrisOwner', 'https://i.pravatar.cc/150?img=8', 5,
 'Been using this for 3 months. Consistent results!',
 'GTA World', 25000, true, true, 'vip'),

('JessicaRP', 'https://i.pravatar.cc/150?img=9', 5,
 'Amazing tool! Server went from unknown to popular!',
 'Mafia City RP', 9500, true, false, NULL),

('RyanDev', 'https://i.pravatar.cc/150?img=10', 5,
 'Clean interface, fast delivery, great support!',
 'Project Homecoming', 14000, true, true, 'verified'),

('TommyGTA', 'https://i.pravatar.cc/150?img=11', 5,
 'Got 30k upvotes! Server is now #3 on FiveM list!',
 'Los Santos Life', 30000, true, true, 'premium'),

('NinaServer', 'https://i.pravatar.cc/150?img=12', 5,
 'Server population tripled after using this!',
 'City of Angels', 11000, true, false, NULL),

('KevinRP', 'https://i.pravatar.cc/150?img=13', 5,
 'Server went from 15 to 60 players online!',
 'New York RP', 13500, true, true, 'pro'),

('OliviaGaming', 'https://i.pravatar.cc/150?img=14', 5,
 'Fast delivery and excellent support!',
 'Miami RP', 7800, true, false, NULL),

('BrianOwner', 'https://i.pravatar.cc/150?img=15', 5,
 'Best upvote service! Got 40k upvotes!',
 'Chicago RP', 40000, true, true, 'premium');

-- Verify
SELECT COUNT(*) as total, 
       SUM(upvotes_received) as total_upvotes,
       ROUND(AVG(rating), 2) as avg_rating
FROM testimonials;
```

### 5. Klik "Run" atau tekan Ctrl+Enter

### 6. Verifikasi hasil:
```
✅ 15 rows inserted
✅ Total upvotes: 293,800
✅ Average rating: 5.00
```

### 7. Test di browser:
```
https://fivemtools.net/api/testimonials
```

### 8. Refresh halaman upvotes:
```
https://fivemtools.net/upvotes
```

## 📊 EXPECTED RESULTS

Setelah seed, kamu akan lihat:

**Stats Bar:**
- 📈 Total Upvotes: 293,800+
- ⭐ Avg Rating: 5.0/5.0
- ✅ Verified Users: 10

**Testimonials Grid:**
- 15 customer reviews
- Badges: verified, pro, vip, premium
- Server names
- Upvotes received
- User avatars

## 🔧 TROUBLESHOOTING

### Error: "duplicate key value"
```sql
-- Clear existing data first
TRUNCATE TABLE testimonials RESTART IDENTITY CASCADE;
-- Then run insert again
```

### Error: "permission denied"
- Make sure you're logged in as admin
- Check RLS policies

### Data tidak muncul di frontend
```bash
# Clear Next.js cache
npm run build
# Or restart dev server
npm run dev
```

## ✅ VERIFICATION

Run analysis script lagi:
```bash
npx tsx scripts/analyze-testimonials.ts
```

Expected output:
```
✅ Total testimonials: 15
✅ Total Upvotes: 293,800
✅ Average Rating: 5.00/5.0
✅ Verified Users: 10
```

---

**Status:** READY TO SEED
**Time:** ~2 minutes
**Difficulty:** Easy
