# ❌ ERROR: invalid_client - SOLUSI

## 🔴 MASALAH:
```
[NextAuth Error] OAUTH_CALLBACK_ERROR {
  error: [Error [OAuthCallbackError]: invalid_client]
}
```

## 🎯 PENYEBAB:
Discord Client Secret yang ada **TIDAK VALID** atau sudah expired/reset.

---

## ✅ SOLUSI (5 MENIT):

### 1️⃣ Buka Discord Developer Portal
```
https://discord.com/developers/applications/1445650115447754933/oauth2
```

### 2️⃣ Reset Client Secret
1. Klik tab **"OAuth2"** di sidebar kiri
2. Scroll ke bagian **"Client Secret"**
3. Klik tombol **"Reset Secret"**
4. Confirm reset
5. **COPY** secret yang baru (hanya muncul 1x!)

### 3️⃣ Tambahkan Redirect URIs
Di bagian **"Redirects"**, tambahkan:
```
http://localhost:3000/api/auth/callback/discord
https://fivemtools.net/api/auth/callback/discord
```
Klik **"Save Changes"**

### 4️⃣ Update .env.local
Ganti `DISCORD_CLIENT_SECRET` dengan secret yang baru:

```env
DISCORD_CLIENT_ID="1445650115447754933"
DISCORD_CLIENT_SECRET="SECRET_BARU_DARI_DISCORD"
```

### 5️⃣ Restart Server
```bash
# Stop server (Ctrl+C)
# Clear cache
rmdir /s /q .next

# Start ulang
pnpm dev
```

---

## 🧪 TEST:
1. Buka: http://localhost:3000
2. Klik "Login with Discord"
3. ✅ Seharusnya berhasil!

---

## 📋 CHECKLIST:
- [ ] Reset Client Secret di Discord Portal
- [ ] Copy secret yang baru
- [ ] Tambahkan Redirect URIs
- [ ] Update DISCORD_CLIENT_SECRET di .env.local
- [ ] Clear .next cache
- [ ] Restart pnpm dev
- [ ] Test login

---

## ⚠️ PENTING:
- Client Secret hanya muncul 1x saat di-reset
- Jangan share secret ke siapapun
- Simpan di tempat aman

---

**Setelah langkah ini, Discord login akan 100% berfungsi!** ✅
