# 🔌 Panduan Koneksi FiveM Tools

## ✅ Status Koneksi

Semua koneksi telah dikonfigurasi dengan benar:

### 1. Database (Supabase PostgreSQL)
- ✅ Connection URL configured
- ✅ Pooling enabled
- ✅ Service role key set
- ✅ JWT secret configured

### 2. Authentication
- ✅ NextAuth configured
- ✅ Discord OAuth ready (perlu client ID & secret)
- ✅ Session management active

### 3. API Endpoints
- ✅ Search API: `/api/search`
- ✅ Assets API: `/api/assets`
- ✅ Forum API: `/api/forum`
- ✅ External API: `https://www.fivemtools.net/api`

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy .env.example to .env (sudah dilakukan)
# Update Discord credentials di .env:
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Test Connections
```bash
# Windows
test-connections.bat

# Manual test
pnpm build
```

### 4. Run Development Server
```bash
pnpm dev
```

## 📁 File Koneksi Utama

### Database
- `lib/supabase/config.ts` - Konfigurasi Supabase
- `lib/supabase/server.ts` - Server-side client
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/middleware.ts` - Session management

### API
- `lib/fivem-api.ts` - External API helper
- `lib/api.ts` - Internal API utilities
- `app/api/search/route.ts` - Search endpoint

### Configuration
- `.env` - Environment variables
- `lib/config.ts` - Centralized config
- `next.config.mjs` - Next.js config

## 🔐 Environment Variables

### Required (Sudah Dikonfigurasi)
```env
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ DATABASE_URL
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL
```

### Perlu Diisi
```env
❌ DISCORD_CLIENT_ID (dapatkan dari Discord Developer Portal)
❌ DISCORD_CLIENT_SECRET (dapatkan dari Discord Developer Portal)
```

## 🔧 Cara Mendapatkan Discord Credentials

1. Buka https://discord.com/developers/applications
2. Buat aplikasi baru atau pilih yang sudah ada
3. Di menu OAuth2:
   - Copy CLIENT ID
   - Copy CLIENT SECRET
4. Tambahkan Redirect URL:
   - Development: `http://localhost:3000/api/auth/callback/discord`
   - Production: `https://fivemtools.net/api/auth/callback/discord`

## 📊 Database Tables

Tabel yang sudah dikonfigurasi:
- ✅ users
- ✅ assets
- ✅ forum_threads
- ✅ forum_replies
- ✅ spin_tickets
- ✅ prizes
- ✅ notifications

## 🧪 Testing

### Test Database Connection
```typescript
import { testDatabaseConnection } from '@/lib/db-init'
await testDatabaseConnection()
```

### Test API
```bash
# Search API
curl "http://localhost:3000/api/search?q=script"

# External API
curl "https://www.fivemtools.net/api/search?q=script"
```

## 🛡️ Security

- ✅ HTTPS enforced in production
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ CSRF protection active
- ✅ SQL injection prevention
- ✅ XSS protection headers

## 📝 Next Steps

1. Isi Discord credentials di `.env`
2. Jalankan `test-connections.bat`
3. Jalankan `pnpm dev`
4. Buka http://localhost:3000
5. Test login dengan Discord

## 🐛 Troubleshooting

### Error: Missing Supabase credentials
- Pastikan `.env` file ada
- Cek semua variabel SUPABASE_* terisi

### Error: Database connection failed
- Cek DATABASE_URL benar
- Pastikan Supabase project aktif
- Verifikasi service role key

### Error: Discord OAuth failed
- Pastikan CLIENT_ID dan CLIENT_SECRET benar
- Cek redirect URL di Discord Developer Portal
- Verifikasi NEXTAUTH_URL sesuai

## 📞 Support

Jika ada masalah:
1. Cek file log di `logs/`
2. Lihat console browser (F12)
3. Periksa Supabase dashboard
4. Review error di terminal

---

**Status**: ✅ Semua koneksi siap digunakan
**Last Updated**: 2025
