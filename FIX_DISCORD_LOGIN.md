# 🔧 FIX DISCORD LOGIN - LANGKAH DEMI LANGKAH

## ❌ MASALAH YANG DITEMUKAN:

1. **NEXTAUTH_SECRET tidak valid** - Harus random string, bukan literal "NEXTAUTH_SECRET"
2. **NEXTAUTH_URL typo** - Ada "NEXTAUTH_UR" yang salah
3. **Fungsi getProviders() duplikat** - Didefinisikan 2x di lib/auth.ts
4. **File .env encoding salah** - UTF-16 bukan UTF-8
5. **Discord Redirect URI belum dikonfigurasi**
6. **Multiple database configs** - Membingungkan

---

## ✅ SOLUSI CEPAT:

### 1️⃣ Generate NEXTAUTH_SECRET yang Valid

```bash
# Jalankan di terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy hasilnya, contoh: `Kd8fJ3mP9xQ2wR5tY7uI0oP3mN6bV9cX2zA4sD7fG1h=`

### 2️⃣ Update .env.local

Ganti baris ini:
```env
# SEBELUM (SALAH):
NEXTAUTH_SECRET="NEXTAUTH_SECRET"
NEXTAUTH_UR="https://www.fivemtools.net"

# SESUDAH (BENAR):
NEXTAUTH_SECRET="Kd8fJ3mP9xQ2wR5tY7uI0oP3mN6bV9cX2zA4sD7fG1h="
NEXTAUTH_URL="http://localhost:3000"
```

### 3️⃣ Fix lib/auth.ts - Hapus Duplikat

File `lib/auth.ts` memiliki fungsi `getProviders()` yang didefinisikan 2 kali (baris 31-44 dan 46-59).

**HAPUS salah satu**, sisakan hanya 1:

```typescript
function getProviders() {
  const providers: any[] = []

  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    providers.push(
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        authorization: { params: { scope: "identify email" } },
      }),
    )
  }

  return providers
}
```

### 4️⃣ Konfigurasi Discord Developer Portal

1. Buka: https://discord.com/developers/applications/1445650115447754933/oauth2
2. Tambahkan Redirect URI:
   ```
   http://localhost:3000/api/auth/callback/discord
   https://fivemtools.net/api/auth/callback/discord
   ```
3. Save Changes

### 5️⃣ Fix .env Encoding

File `.env` saat ini menggunakan UTF-16. Harus diubah ke UTF-8:

```bash
# Backup dulu
copy .env .env.backup

# Buat ulang dengan encoding UTF-8
# Atau edit manual dengan Notepad++ > Encoding > UTF-8
```

### 6️⃣ Restart Development Server

```bash
# Stop server (Ctrl+C)
# Clear cache
rmdir /s /q .next

# Start ulang
pnpm dev
```

---

## 🧪 TEST LOGIN:

1. Buka: http://localhost:3000
2. Klik "Login with Discord"
3. Authorize aplikasi
4. Seharusnya redirect kembali dan login berhasil

---

## 🔍 DEBUG JIKA MASIH ERROR:

### Check Environment Variables:
```bash
node -e "console.log('DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID)"
node -e "console.log('DISCORD_CLIENT_SECRET:', process.env.DISCORD_CLIENT_SECRET ? 'SET' : 'NOT SET')"
node -e "console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET')"
node -e "console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)"
```

### Check NextAuth Debug Logs:
```typescript
// Di lib/auth.ts sudah ada debug: true
// Lihat console untuk error messages
```

### Common Errors:

**Error: "invalid_client"**
- Discord Client ID/Secret salah
- Check di Discord Developer Portal

**Error: "redirect_uri_mismatch"**
- Redirect URI tidak match
- Tambahkan di Discord Developer Portal

**Error: "Configuration"**
- NEXTAUTH_SECRET tidak valid
- Generate ulang dengan crypto.randomBytes()

---

## 📋 CHECKLIST:

- [ ] Generate NEXTAUTH_SECRET baru
- [ ] Update .env.local dengan secret yang valid
- [ ] Fix NEXTAUTH_URL (hapus typo NEXTAUTH_UR)
- [ ] Hapus fungsi getProviders() duplikat di lib/auth.ts
- [ ] Fix .env encoding ke UTF-8
- [ ] Tambahkan Redirect URI di Discord Portal
- [ ] Clear .next cache
- [ ] Restart pnpm dev
- [ ] Test login Discord

---

## 🎯 HASIL AKHIR:

Setelah semua fix diterapkan:
- ✅ Login Discord berfungsi
- ✅ User data tersimpan ke database
- ✅ Session management bekerja
- ✅ Redirect setelah login berhasil

---

**Priority:** CRITICAL 🔴
**Estimated Time:** 10-15 menit
**Difficulty:** Easy ⭐
