# 🔧 PERBAIKAN API - Quick Fixes

## 📋 Daftar Perbaikan

### 1. ✅ Standardize Supabase Client
### 2. ✅ Add XP Award to Download
### 3. ✅ Improve Stats Error Logging
### 4. ✅ Fix fivem-api.ts

---

## 1️⃣ STANDARDIZE SUPABASE CLIENT

### File: `lib/supabase/helpers.ts` (NEW)

```typescript
import { createClient } from '@supabase/supabase-js'

/**
 * Create admin Supabase client for API routes
 * Consistent method across all endpoints
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

### Update: `app/api/search/route.ts`

```typescript
// ❌ BEFORE
import { getSupabaseAdminClient } from "@/lib/supabase/server"
const supabase = getSupabaseAdminClient()

// ✅ AFTER
import { createAdminSupabaseClient } from "@/lib/supabase/helpers"
const supabase = createAdminSupabaseClient()
```

### Update: `app/api/stats/route.ts`

```typescript
// ❌ BEFORE
import { createAdminClient } from "@/lib/supabase/server"
const supabase = createAdminClient()

// ✅ AFTER
import { createAdminSupabaseClient } from "@/lib/supabase/helpers"
const supabase = createAdminSupabaseClient()
```

---

## 2️⃣ ADD XP AWARD TO DOWNLOAD

### File: `app/api/download/[id]/route.ts`

```typescript
// Add import at top
import { xpQueries } from '@/lib/xp/queries'

// Add after recording activity (around line 90)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ... existing code ...

    // Record download activity
    await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        type: 'download',
        description: `Downloaded ${asset.title}`,
        asset_id: asset.id
      })
      .catch(() => {})

    // ✅ ADD THIS: Award XP for download
    await xpQueries.awardXP(session.user.id, 'download_asset', asset.id)
      .catch((error) => {
        console.warn('[API Download] XP award failed:', error)
      })

    // Return download URL
    const downloadUrl = asset.download_url || asset.download_link
    // ... rest of code ...
  }
}
```

---

## 3️⃣ IMPROVE STATS ERROR LOGGING

### File: `app/api/stats/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Ambil statistik real dari database
    const results = await Promise.allSettled([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("assets").select("*", { count: "exact", head: true }).in("status", ["active", "pending"]),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("forum_replies").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("downloads").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true })
        .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString())
    ])

    // ✅ ADD THIS: Log errors for debugging
    const queryNames = ['users', 'assets', 'threads', 'replies', 'downloads', 'online']
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[Stats API] ${queryNames[index]} query failed:`, result.reason)
      }
    })

    const [usersResult, assetsResult, threadsResult, repliesResult, downloadsResult, onlineResult] = results

    const stats = {
      totalUsers: usersResult.status === "fulfilled" ? usersResult.value.count || 0 : 0,
      totalAssets: assetsResult.status === "fulfilled" ? assetsResult.value.count || 0 : 0,
      totalThreads: threadsResult.status === "fulfilled" ? threadsResult.value.count || 0 : 0,
      totalPosts: repliesResult.status === "fulfilled" ? repliesResult.value.count || 0 : 0,
      totalDownloads: downloadsResult.status === "fulfilled" ? downloadsResult.value.count || 0 : 0,
      onlineUsers: onlineResult.status === "fulfilled" ? onlineResult.value.count || 0 : 0,
      lastUpdated: new Date().toISOString()
    }

    // ✅ ADD THIS: Log success stats
    console.log('[Stats API] ✅ Stats fetched:', stats)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error("[Stats API] ❌ Critical error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch stats",
      data: {
        totalUsers: 0,
        totalAssets: 0,
        totalThreads: 0,
        totalPosts: 0,
        totalDownloads: 0,
        onlineUsers: 0,
        lastUpdated: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
```

---

## 4️⃣ FIX FIVEM-API.TS

### File: `lib/fivem-api.ts`

```typescript
// ❌ BEFORE
const API_BASE = "https://www.fivemtools.net/api"

// ✅ AFTER
import { CONFIG } from '@/lib/config'

const API_BASE = `${CONFIG.site.url}/api`

// Or if this file is not used, consider deleting it
// Check usage: grep -r "fivem-api" in project
```

---

## 🚀 CARA APPLY PERBAIKAN

### Option 1: Manual (Recommended)
```bash
# 1. Buat file baru
# lib/supabase/helpers.ts

# 2. Update files satu per satu
# - app/api/search/route.ts
# - app/api/stats/route.ts
# - app/api/download/[id]/route.ts
# - lib/fivem-api.ts

# 3. Test
pnpm dev
```

### Option 2: Automated (Use with caution)
```bash
# Run quick fix script
node quick-fix-api.js
```

---

## ✅ VERIFICATION CHECKLIST

After applying fixes:

- [ ] `lib/supabase/helpers.ts` created
- [ ] `app/api/search/route.ts` updated
- [ ] `app/api/stats/route.ts` updated
- [ ] `app/api/download/[id]/route.ts` updated
- [ ] `lib/fivem-api.ts` updated
- [ ] No TypeScript errors: `pnpm build`
- [ ] Dev server runs: `pnpm dev`
- [ ] Test download with XP award
- [ ] Check stats API logs
- [ ] Verify search still works

---

## 📊 IMPACT ANALYSIS

### Before Fixes:
- ⚠️ Inconsistent Supabase client creation
- ⚠️ No XP for downloads
- ⚠️ Hard to debug stats errors
- ⚠️ Hardcoded API URL

### After Fixes:
- ✅ Consistent Supabase client
- ✅ XP awarded on download
- ✅ Better error logging
- ✅ Dynamic API URL

### Risk Level: LOW
- All fixes are non-breaking
- Backward compatible
- Can be applied incrementally

---

## 🎯 PRIORITY

1. **HIGH:** Add XP to download (user-facing feature)
2. **MEDIUM:** Improve stats logging (debugging)
3. **LOW:** Standardize Supabase client (code quality)
4. **LOW:** Fix fivem-api.ts (unused code)

---

## 📝 NOTES

- Semua perbaikan bersifat optional
- Sistem sudah berfungsi tanpa perbaikan ini
- Perbaikan meningkatkan code quality & maintainability
- Tidak ada breaking changes

---

*Generated by Amazon Q Developer*
