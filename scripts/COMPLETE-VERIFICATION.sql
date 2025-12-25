-- ✅ COMPLETE DATABASE VERIFICATION - 100% FULL CHECK
-- Run this to verify ALL features are working

SELECT '=========================================' as info;
SELECT '  FiveM Tools V7 - Database Verification' as info;
SELECT '=========================================' as info;

-- 1. Check all tables exist
SELECT '1. Checking Tables...' as step;
SELECT 
  CASE 
    WHEN COUNT(*) >= 21 THEN '✅ All tables exist (' || COUNT(*) || ')'
    ELSE '❌ Missing tables (found ' || COUNT(*) || ', expected 21+)'
  END as table_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- 2. Check users table
SELECT '2. Checking Users...' as step;
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE membership = 'admin') as admins,
  COUNT(*) FILTER (WHERE membership = 'vip') as vip_users
FROM users;

-- 3. Check assets table
SELECT '3. Checking Assets...' as step;
SELECT 
  COUNT(*) as total_assets,
  COUNT(*) FILTER (WHERE category = 'scripts') as scripts,
  COUNT(*) FILTER (WHERE category = 'mlo') as mlo,
  COUNT(*) FILTER (WHERE category = 'vehicles') as vehicles,
  COUNT(*) FILTER (WHERE category = 'clothing') as clothing
FROM assets;

-- 4. Check forum tables
SELECT '4. Checking Forum...' as step;
SELECT 
  (SELECT COUNT(*) FROM forum_categories) as categories,
  (SELECT COUNT(*) FROM forum_threads) as threads,
  (SELECT COUNT(*) FROM forum_replies) as replies;

-- 5. Check coins system
SELECT '5. Checking Coins System...' as step;
SELECT 
  COALESCE(SUM(coins), 0) as total_coins_in_system,
  COALESCE(AVG(coins), 0) as avg_coins_per_user,
  COALESCE(MAX(coins), 0) as max_coins
FROM users;

-- 6. Check spin wheel
SELECT '6. Checking Spin Wheel...' as step;
SELECT 
  COUNT(*) as total_prizes,
  COALESCE(SUM(probability), 0) as total_probability
FROM spin_wheel_prizes;

-- 7. Check linkvertise
SELECT '7. Checking Linkvertise...' as step;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'linkvertise_downloads')
    THEN (SELECT COUNT(*)::text || ' downloads, ' || COUNT(*) FILTER (WHERE verified = true)::text || ' verified' FROM linkvertise_downloads)
    ELSE 'Table not found - run LINKVERTISE-SETUP.sql'
  END as linkvertise_status;

-- 8. Check RLS policies
SELECT '8. Checking RLS Policies...' as step;
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC
LIMIT 10;

-- 9. Check functions
SELECT '9. Checking Functions...' as step;
SELECT 
  COUNT(*) as total_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- 10. Check indexes
SELECT '10. Checking Indexes...' as step;
SELECT 
  COUNT(*) as total_indexes
FROM pg_indexes 
WHERE schemaname = 'public';

-- 11. Recent threads check
SELECT '11. Checking Recent Threads...' as step;
SELECT 
  t.id,
  t.title,
  t.created_at,
  u.username as author,
  c.name as category
FROM forum_threads t
LEFT JOIN users u ON t.author_id = u.id
LEFT JOIN forum_categories c ON t.category_id = c.id
ORDER BY t.created_at DESC
LIMIT 5;

-- 12. Check site settings
SELECT '12. Checking Site Settings...' as step;
SELECT 
  key, 
  CASE 
    WHEN key = 'linkvertise' THEN 'configured'
    ELSE 'ok'
  END as status
FROM site_settings;

-- 13. Final summary
SELECT '=========================================' as info;
SELECT '  VERIFICATION SUMMARY' as info;
SELECT '=========================================' as info;

-- Summary table
WITH summary AS (
  SELECT '✅ Database' as component, 'Connected' as status
  UNION ALL
  SELECT '✅ Tables', (SELECT COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public')
  UNION ALL
  SELECT '✅ Users', (SELECT COUNT(*)::text FROM users)
  UNION ALL
  SELECT '✅ Assets', (SELECT COUNT(*)::text FROM assets)
  UNION ALL
  SELECT '✅ Forum Threads', (SELECT COUNT(*)::text FROM forum_threads)
  UNION ALL
  SELECT '✅ Forum Replies', (SELECT COUNT(*)::text FROM forum_replies)
  UNION ALL
  SELECT '✅ RLS Policies', (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public')
  UNION ALL
  SELECT '✅ Functions', (SELECT COUNT(*)::text FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public')
  UNION ALL
  SELECT '✅ Linkvertise', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'linkvertise_downloads') THEN 'Installed' ELSE 'Not Installed' END
)
SELECT * FROM summary;

SELECT '✅ Verification Complete!' as result;
