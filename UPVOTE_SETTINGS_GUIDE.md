# 🎯 Upvote Settings - Admin Panel

## ✅ FITUR BARU DITAMBAHKAN

### 📋 Yang Sudah Dibuat:

1. **Admin Panel** - `/admin/upvotes`
   - UI modern dengan slider preview
   - Real-time validation
   - Save & refresh functionality

2. **API Endpoints** - `/api/upvotes/settings`
   - GET: Fetch current settings
   - PUT: Update settings (admin only)

3. **Database Table** - `upvote_settings`
   ```sql
   - min_upvotes (default: 1)
   - max_upvotes (default: 50000)
   - default_upvotes (default: 100)
   ```

4. **Frontend Integration**
   - Slider dengan range dinamis
   - Input number dengan validation
   - Real-time preview nilai upvotes

---

## 🚀 Cara Menggunakan:

### 1. Setup Database
Jalankan SQL migration:
```bash
# Copy SQL dari migrations/upvote_settings.sql
# Paste ke Supabase SQL Editor
# Execute
```

Atau manual di Supabase:
```sql
CREATE TABLE IF NOT EXISTS upvote_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_upvotes INTEGER NOT NULL DEFAULT 1,
    max_upvotes INTEGER NOT NULL DEFAULT 50000,
    default_upvotes INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO upvote_settings (min_upvotes, max_upvotes, default_upvotes)
VALUES (1, 50000, 100);
```

### 2. Akses Admin Panel
1. Login sebagai admin
2. Buka `/admin/upvotes`
3. Atur nilai:
   - **Min Upvotes**: Nilai minimum (contoh: 1)
   - **Max Upvotes**: Nilai maksimum (contoh: 50000)
   - **Default Upvotes**: Nilai awal saat page load (contoh: 100)
4. Klik "Save Settings"

### 3. Test di Upvote Bot
1. Buka `/upvotes`
2. Slider akan otomatis menggunakan range dari admin panel
3. Input number akan ter-validasi sesuai min/max
4. Default value akan muncul saat page load

---

## 🎨 Fitur UI/UX:

### Admin Panel:
- ✅ 3 input fields (min, max, default)
- ✅ Real-time preview slider
- ✅ Validation messages
- ✅ Save & refresh buttons
- ✅ Success/error toasts

### Upvote Bot Page:
- ✅ Slider dengan range dinamis
- ✅ Input number dengan min/max enforcement
- ✅ Display current value dengan format locale
- ✅ Min/Max labels di bawah slider

---

## 🔐 Security:

- ✅ Admin-only access untuk update settings
- ✅ Server-side validation
- ✅ Input sanitization
- ✅ Range validation (min < max, max <= 100000)

---

## 📊 Database Schema:

```typescript
interface UpvoteSettings {
  id: string
  min_upvotes: number      // Minimum: 1
  max_upvotes: number      // Maximum: 100000
  default_upvotes: number  // Default value on load
  created_at: string
  updated_at: string
}
```

---

## 🔄 API Endpoints:

### GET `/api/upvotes/settings`
**Response:**
```json
{
  "min_upvotes": 1,
  "max_upvotes": 50000,
  "default_upvotes": 100,
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### PUT `/api/upvotes/settings` (Admin Only)
**Request:**
```json
{
  "min_upvotes": 1,
  "max_upvotes": 100000,
  "default_upvotes": 500
}
```

**Response:**
```json
{
  "id": "uuid",
  "min_upvotes": 1,
  "max_upvotes": 100000,
  "default_upvotes": 500,
  "updated_at": "2025-01-15T10:05:00Z"
}
```

---

## 🎯 Testing:

1. **Test Admin Panel:**
   ```
   - Login sebagai admin
   - Buka /admin/upvotes
   - Ubah nilai min: 10, max: 10000, default: 500
   - Save
   - Refresh page → nilai tetap tersimpan
   ```

2. **Test Upvote Bot:**
   ```
   - Buka /upvotes
   - Slider range: 10 - 10000
   - Default value: 500
   - Coba input 5 → error (di bawah min)
   - Coba input 15000 → tidak bisa (di atas max)
   ```

---

## 📝 Files Created:

```
app/
├── api/upvotes/settings/route.ts    # API endpoint
├── admin/upvotes/page.tsx           # Admin panel UI

components/
└── upvote-bot-client.tsx            # Updated with dynamic settings

migrations/
└── upvote_settings.sql              # Database migration
```

---

## ✨ Status: COMPLETE

Semua fitur sudah terintegrasi dan siap digunakan!
