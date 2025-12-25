-- ============================================
-- VERIFICATION SCRIPT - TEST ALL FEATURES
-- Run this after setup to verify everything works
-- ============================================

-- Test 1: Check all tables exist
SELECT 
  'Test 1: Tables' as test_name,
  CASE 
    WHEN COUNT(*) >= 20 THEN 'PASS: ' || COUNT(*) || ' tables created'
    ELSE 'FAIL: Only ' || COUNT(*) || ' tables found'
  END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Test 2: Check all functions exist
SELECT 
  'Test 2: Functions' as test_name,
  CASE 
    WHEN COUNT(*) >= 10 THEN 'PASS: ' || COUNT(*) || ' functions created'
    ELSE 'FAIL: Only ' || COUNT(*) || ' functions found'
  END as result
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
AND proname IN (
  'is_admin',
  'get_user_balance',
  'add_coins',
  'can_claim_daily',
  'claim_daily_reward',
  'use_spin_ticket',
  'increment_thread_replies',
  'decrement_thread_replies',
  'update_category_thread_count',
  'increment_asset_downloads',
  'increment_asset_views',
  'update_asset_rating'
);

-- Test 3: Check RLS is enabled
SELECT 
  'Test 3: RLS' as test_name,
  CASE 
    WHEN COUNT(*) >= 15 THEN 'PASS: RLS enabled on ' || COUNT(*) || ' tables'
    ELSE 'FAIL: RLS not enabled on some tables'
  END as result
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Test 4: Check policies exist
SELECT 
  'Test 4: Policies' as test_name,
  CASE 
    WHEN COUNT(*) >= 30 THEN 'PASS: ' || COUNT(*) || ' policies created'
    ELSE 'FAIL: Only ' || COUNT(*) || ' policies found'
  END as result
FROM pg_policies;

-- Test 5: Check indexes exist
SELECT 
  'Test 5: Indexes' as test_name,
  CASE 
    WHEN COUNT(*) >= 30 THEN 'PASS: ' || COUNT(*) || ' indexes created'
    ELSE 'FAIL: Only ' || COUNT(*) || ' indexes found'
  END as result
FROM pg_indexes 
WHERE schemaname = 'public';

-- Test 6: Check forum categories
SELECT 
  'Test 6: Forum Categories' as test_name,
  CASE 
    WHEN COUNT(*) >= 6 THEN 'PASS: ' || COUNT(*) || ' categories seeded'
    ELSE 'FAIL: Forum categories not seeded'
  END as result
FROM forum_categories;

-- Test 7: Check spin wheel prizes
SELECT 
  'Test 7: Spin Prizes' as test_name,
  CASE 
    WHEN COUNT(*) >= 7 THEN 'PASS: ' || COUNT(*) || ' prizes seeded'
    ELSE 'FAIL: Spin prizes not seeded'
  END as result
FROM spin_wheel_prizes;

-- Test 8: Check probability sum
SELECT 
  'Test 8: Probabilities' as test_name,
  CASE 
    WHEN SUM(probability) = 100 THEN 'PASS: Probabilities sum to 100%'
    ELSE 'FAIL: Probabilities sum to ' || SUM(probability) || '%'
  END as result
FROM spin_wheel_prizes 
WHERE is_active = true;

-- Test 9: Check site settings
SELECT 
  'Test 9: Site Settings' as test_name,
  CASE 
    WHEN COUNT(*) >= 5 THEN 'PASS: ' || COUNT(*) || ' settings configured'
    ELSE 'FAIL: Site settings not configured'
  END as result
FROM site_settings;

-- Test 10: Check triggers
SELECT 
  'Test 10: Triggers' as test_name,
  CASE 
    WHEN COUNT(*) >= 2 THEN 'PASS: ' || COUNT(*) || ' triggers created'
    ELSE 'FAIL: Missing triggers'
  END as result
FROM pg_trigger 
WHERE tgname IN ('update_category_counts_trigger', 'update_asset_rating_trigger');

-- Summary
SELECT 
  'SUMMARY' as section,
  'Total Tables: ' || COUNT(*) as info
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
  'SUMMARY',
  'Total Functions: ' || COUNT(*)
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
UNION ALL
SELECT 
  'SUMMARY',
  'Total Policies: ' || COUNT(*)
FROM pg_policies
UNION ALL
SELECT 
  'SUMMARY',
  'Total Indexes: ' || COUNT(*)
FROM pg_indexes 
WHERE schemaname = 'public';

-- Final message
SELECT 'If all tests show PASS, setup is complete!' as status;
