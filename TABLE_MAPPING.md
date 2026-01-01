# TABLE MAPPING - Fix Kode Pakai Table yang Sudah Ada

## ❌ SALAH → ✅ BENAR

1. **spin_history** → **spin_wheel_history**
2. **public_notifications** → **notifications** 
3. **asset_reviews** → **testimonials**
4. **spin_wheel_eligible_users** → HAPUS (tidak perlu)
5. **spin_wheel_force_wins** → HAPUS (tidak perlu)
6. **spin_wheel_settings** → HAPUS (pakai hardcode)
7. **likes** → HAPUS (pakai likes column di table)
8. **forum_ranks** → HAPUS (pakai hardcode)
9. **daily_claims** → HAPUS (pakai spin_wheel_tickets)
10. **site_settings** → HAPUS (pakai hardcode)

## Files yang perlu difix:

1. app/api/admin/dashboard-stats/route.ts
2. app/api/admin/spin-wheel/stats/route.ts
3. app/api/admin/notifications/route.ts
4. app/api/upload/asset/route.ts
5. app/api/admin/spin-wheel/eligible-users/route.ts
6. app/api/admin/spin-wheel/force-wins/route.ts
7. app/api/admin/spin-wheel/settings/route.ts
8. app/api/admin/forum/settings/route.ts
9. app/api/likes/route.ts
10. app/api/profile/[id]/route.ts
11. app/profile/[id]/page.tsx
12. app/api/spin-wheel/claim-daily/route.ts
13. app/api/assets/[id]/reviews/route.ts
14. app/api/init-database/route.ts
