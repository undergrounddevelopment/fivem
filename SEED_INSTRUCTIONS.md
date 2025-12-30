# ✅ FINAL STEP - SEED DATABASE

## 🎯 PILIH SALAH SATU:

### Option 1: Via Supabase Dashboard (RECOMMENDED)

1. **Buka Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/linnqtixdfjwbrixitrb/sql
   ```

2. **Copy SQL ini dan paste di SQL Editor:**

```sql
-- SEED DATA
INSERT INTO forum_categories (name, description, slug, icon, color, sort_order, is_active) VALUES
('General Discussion', 'General FiveM discussions', 'general', 'message-circle', '#22C55E', 1, true),
('Help & Support', 'Get help with scripts', 'help', 'help-circle', '#F59E0B', 2, true),
('Script Requests', 'Request new scripts', 'requests', 'code', '#3B82F6', 3, true),
('Showcase', 'Show off your servers', 'showcase', 'star', '#EC4899', 4, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO spin_wheel_prizes (name, type, value, probability, color, sort_order, is_active) VALUES
('50 Coins', 'coins', 50, 30.0, '#22C55E', 1, true),
('100 Coins', 'coins', 100, 25.0, '#3B82F6', 2, true),
('250 Coins', 'coins', 250, 15.0, '#8B5CF6', 3, true),
('500 Coins', 'coins', 500, 10.0, '#EC4899', 4, true),
('1000 Coins', 'coins', 1000, 5.0, '#EF4444', 5, true),
('Free Spin', 'ticket', 1, 10.0, '#F59E0B', 6, true),
('Better Luck', 'nothing', 0, 5.0, '#6B7280', 7, true)
ON CONFLICT (name) DO NOTHING;
```

3. **Klik "RUN"**

4. **Refresh website:** https://www.fivemtools.net

---

### Option 2: Via Browser (Alternatif)

Buka di browser:
```
https://www.fivemtools.net/api/seed
```

Klik "POST" atau gunakan Postman/Thunder Client

---

## ✅ HASIL SETELAH SEED:

### Forum Page:
- ✅ 4 Categories muncul
- ✅ No more "Something went wrong"

### Homepage:
- ✅ Stats update (bukan 0 lagi)
- ✅ Trending section works
- ✅ Recent assets works

### Spin Wheel:
- ✅ 7 Prizes available
- ✅ Ready to spin

---

## 🔍 VERIFY:

```bash
# Check stats
curl https://www.fivemtools.net/api/stats

# Check categories
curl https://www.fivemtools.net/api/forum/categories

# Check prizes
curl https://www.fivemtools.net/api/spin-wheel/prizes
```

---

## 📝 NEXT STEPS:

1. ✅ Seed database (pilih option di atas)
2. 🔐 Login dengan Discord untuk create user
3. 📤 Upload asset pertama
4. 🎉 Website fully functional!

---

**GUNAKAN OPTION 1 (Supabase Dashboard) - PALING MUDAH!**
