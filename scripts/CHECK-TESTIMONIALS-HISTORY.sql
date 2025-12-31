-- CHECK TESTIMONIALS HISTORY & RECOVERY
-- Run this in Supabase SQL Editor

-- 1. Check if table exists and structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'testimonials'
ORDER BY ordinal_position;

-- 2. Check for any data (including soft deleted)
SELECT COUNT(*) as total_count FROM testimonials;

-- 3. Check if there's a deleted_at column (soft delete)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
AND column_name = 'deleted_at';

-- 4. Try to find deleted data (if soft delete exists)
SELECT * FROM testimonials WHERE deleted_at IS NOT NULL;

-- 5. Check table activity logs (if audit enabled)
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE tablename = 'testimonials';

-- 6. Check if there's a backup table
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%testimonial%';

-- 7. Check RLS policies that might hide data
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'testimonials';

-- 8. Try to select with service role (bypass RLS)
SET ROLE service_role;
SELECT * FROM testimonials;
RESET ROLE;

-- 9. Check recent database changes
SELECT 
    query,
    query_start,
    state
FROM pg_stat_activity
WHERE query LIKE '%testimonials%'
ORDER BY query_start DESC
LIMIT 10;

-- 10. Check if data was moved to another table
SELECT 
    t.table_name,
    c.column_name
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE c.column_name IN ('username', 'rating', 'content', 'upvotes_received')
AND t.table_schema = 'public'
GROUP BY t.table_name, c.column_name
ORDER BY t.table_name;
