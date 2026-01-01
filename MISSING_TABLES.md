# ❌ MISSING TABLES IN SUPABASE

## Tables yang digunakan di kode tapi TIDAK ADA di Supabase:

1. **spin_history** - digunakan di:
   - app/api/admin/dashboard-stats/route.ts
   - app/api/admin/spin-wheel/stats/route.ts
   
   ✅ SEHARUSNYA: **spin_wheel_history**

2. **site_settings** - digunakan di:
   - app/api/admin/forum/settings/route.ts
   
   ❌ TABLE INI TIDAK ADA!

3. **public_notifications** - digunakan di:
   - app/api/admin/notifications/route.ts
   - app/api/upload/asset/route.ts
   
   ❌ TABLE INI TIDAK ADA! (seharusnya pakai **notifications**)

4. **spin_wheel_eligible_users** - digunakan di:
   - app/api/admin/spin-wheel/eligible-users/route.ts
   
   ❌ TABLE INI TIDAK ADA!

5. **spin_wheel_force_wins** - digunakan di:
   - app/api/admin/spin-wheel/force-wins/route.ts
   
   ❌ TABLE INI TIDAK ADA!

6. **spin_wheel_settings** - digunakan di:
   - app/api/admin/spin-wheel/settings/route.ts
   - app/api/admin/spin-wheel/stats/route.ts
   - app/api/init-database/route.ts
   
   ❌ TABLE INI TIDAK ADA!

7. **likes** - digunakan di:
   - app/api/likes/route.ts
   - app/profile/[id]/page.tsx
   
   ❌ TABLE INI TIDAK ADA!

8. **forum_ranks** - digunakan di:
   - app/api/profile/[id]/route.ts
   - app/profile/[id]/page.tsx
   
   ❌ TABLE INI TIDAK ADA!

9. **daily_claims** - digunakan di:
   - app/api/spin-wheel/claim-daily/route.ts
   
   ❌ TABLE INI TIDAK ADA!

10. **asset_reviews** - digunakan di:
    - app/api/assets/[id]/reviews/route.ts
    
    ❌ TABLE INI TIDAK ADA! (seharusnya pakai **testimonials**)

## ✅ SOLUSI:

### Option 1: Buat table yang missing
### Option 2: Fix kode untuk pakai table yang sudah ada
