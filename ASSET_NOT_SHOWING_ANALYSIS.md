# ANALISIS LENGKAP: ASSET DATA TIDAK TAMPIL DI WEBSITE

## 🔴 MASALAH UTAMA (ROOT CAUSE)

### Ditemukan: CRITICAL SCHEMA MISMATCH

Ada **PERBEDAAN FUNDAMENTAL** antara struktur data di CSV dan schema database yang sebenarnya.

---

## 📊 TABEL PERBANDINGAN

| Aspek | CSV Data | Database Schema | Status |
|-------|----------|-----------------|--------|
| **Status Value** | `"active"` | `'pending', 'approved', 'rejected', 'featured'` | ❌ **TIDAK SESUAI** |
| **ID Column** | `author_id` (text) | `creator_id` (UUID) | ⚠️ **BEDA NAMA** |
| **Download Link** | `download_link` | `download_url` | ⚠️ **BEDA NAMA** |
| **Thumbnail** | `thumbnail` | `thumbnail_url` | ⚠️ **BEDA NAMA** |
| **Row Count** | 72+ assets | ? (unknown) | ❓ **TIDAK JELAS** |

---

## 🔍 ANALISIS DETAIL

### 1. **Status Filter Problem** ❌
```typescript
// Code di /app/api/assets/route.ts baris 623:
const where: string[] = ["a.status = ANY($1)"]
const params: any[] = [["active", "approved"]]  // ← ISSUE!
```

**Masalah:**
- Query mencari: `status IN ('active', 'approved')`
- Database schema hanya menerima: `'pending', 'approved', 'rejected', 'featured'`
- CSV data memiliki: `status = "active"` ← **TIDAK ADA di enum database**
- **Akibat:** Semua assets dengan status "active" di CSV TIDAK AKAN MUNCUL

### 2. **Contoh Asset dari CSV yang TIDAK TAMPIL:**
```
ID: 05b44f3a-ef57-4f9e-916e-e71e99c4a2fd
Title: AC ELECTRON
Status: "active"  ← TIDAK DIKENALI DATABASE
Author: f941f110-6e93-4b59-90b6-8aaf074ff743
```

### 3. **Mismatch Kolom Database:**
```sql
-- Yang ada di database:
creator_id UUID
download_url TEXT
thumbnail_url TEXT

-- Tapi CSV dan API menggunakan:
author_id
download_link
file_size
```

---

## ✅ SOLUSI

### Langkah 1: Update Status Enum di Database
Ubah status values dari `'pending', 'approved', 'rejected', 'featured'` menjadi termasuk `'active'`:

```sql
ALTER TABLE assets DROP CONSTRAINT assets_status_check;
ALTER TABLE assets ADD CONSTRAINT assets_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'featured', 'active'));
```

### Langkah 2: Update API Query
Ubah `/app/api/assets/route.ts` untuk filter status yang benar:

```typescript
// SEBELUM:
const params: any[] = [["active", "approved"]]

// SESUDAH:
const params: any[] = [["active", "approved", "featured"]]
```

### Langkah 3: Fix Column Names
Ubah mapping di database untuk sesuai dengan CSV:
- `author_id` → gunakan views atau mapping
- `download_link` → rename dari `download_url`  
- `thumbnail` → rename dari `thumbnail_url`

---

## 🎯 ROOT CAUSE SUMMARY

**Data di CSV tidak tampil karena:**
1. ✗ Status value `"active"` tidak valid di database schema
2. ✗ Field names berbeda (author_id vs creator_id, dll)
3. ✗ Query API hanya mencari status `['active', 'approved']` tapi database hanya menerima `['pending', 'approved', 'rejected', 'featured']`
4. ✗ Asset 72+ rows di CSV memiliki author_id yang mungkin tidak cocok dengan users table

---

## 🔧 NEXT STEPS

1. **Backup database** sebelum membuat perubahan
2. **Update schema** untuk mendukung status "active"
3. **Migrate data** di CSV dengan status "active" → "approved"
4. **Fix API queries** untuk filter status yang benar
5. **Test** dengan `/api/assets?debug=true` untuk verify

