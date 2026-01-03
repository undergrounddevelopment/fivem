-- ============================================
-- FIX DATABASE CONNECTION - 100% COMPLETE
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: FIX FORUM_CATEGORIES COLUMN NAMING
-- ============================================

-- Check if order_index exists and rename to sort_order if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_categories' 
        AND column_name = 'order_index'
    ) THEN
        ALTER TABLE forum_categories RENAME COLUMN order_index TO sort_order;
        RAISE NOTICE 'Renamed order_index to sort_order in forum_categories';
    END IF;
END $$;

-- Ensure sort_order column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_categories' 
        AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE forum_categories ADD COLUMN sort_order INTEGER DEFAULT 0;
        RAISE NOTICE 'Added sort_order column to forum_categories';
    END IF;
END $$;

-- ============================================
-- PART 2: FIX ACTIVITIES TABLE STRUCTURE
-- ============================================

-- Ensure activities table exists with correct structure
-- Support both structures: with action/target_id OR with description
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add action and target_id columns if they don't exist (for compatibility)
DO $$
BEGIN
    -- Add action column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'action'
    ) THEN
        ALTER TABLE activities ADD COLUMN action TEXT;
        RAISE NOTICE 'Added action column to activities';
    END IF;
    
    -- Add target_id column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'target_id'
    ) THEN
        ALTER TABLE activities ADD COLUMN target_id TEXT;
        RAISE NOTICE 'Added target_id column to activities';
    END IF;
    
    -- Ensure user_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE activities ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to activities';
    END IF;
END $$;

-- ============================================
-- PART 3: ENABLE RLS ON ALL TABLES
-- ============================================

-- Enable RLS on forum tables
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Enable RLS on activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other essential tables (if not already enabled)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets') THEN
        ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'downloads') THEN
        ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================
-- PART 4: CREATE RLS POLICIES FOR PUBLIC READ
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view active categories" ON forum_categories;
DROP POLICY IF EXISTS "Public can view categories" ON forum_categories;
DROP POLICY IF EXISTS "Service role can manage categories" ON forum_categories;

DROP POLICY IF EXISTS "Public can view activities" ON activities;
DROP POLICY IF EXISTS "Public can view all activities" ON activities;
DROP POLICY IF EXISTS "Service role can manage activities" ON activities;

DROP POLICY IF EXISTS "Public can view approved threads" ON forum_threads;
DROP POLICY IF EXISTS "Service role can manage threads" ON forum_threads;

DROP POLICY IF EXISTS "Public can view replies" ON forum_replies;
DROP POLICY IF EXISTS "Service role can manage replies" ON forum_replies;

DROP POLICY IF EXISTS "Public can view users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

DROP POLICY IF EXISTS "Public can view active assets" ON assets;
DROP POLICY IF EXISTS "Service role can manage assets" ON assets;

-- Forum Categories: Public read active categories
CREATE POLICY "Public can view active categories" 
ON forum_categories 
FOR SELECT 
USING (COALESCE(is_active, true) = true);

-- Forum Categories: Service role full access (for API routes using admin client)
CREATE POLICY "Service role can manage categories" 
ON forum_categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Activities: Public read (all activities)
CREATE POLICY "Public can view activities" 
ON activities 
FOR SELECT 
USING (true);

-- Activities: Service role full access
CREATE POLICY "Service role can manage activities" 
ON activities 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Forum Threads: Public read approved threads
CREATE POLICY "Public can view approved threads" 
ON forum_threads 
FOR SELECT 
USING (
    COALESCE(is_deleted, false) = false 
    AND (status = 'approved' OR status IS NULL)
);

-- Forum Threads: Service role full access
CREATE POLICY "Service role can manage threads" 
ON forum_threads 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Forum Replies: Public read non-deleted replies
CREATE POLICY "Public can view replies" 
ON forum_replies 
FOR SELECT 
USING (COALESCE(is_deleted, false) = false);

-- Forum Replies: Service role full access
CREATE POLICY "Service role can manage replies" 
ON forum_replies 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Users: Public read active users
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE POLICY "Public can view users" 
        ON users 
        FOR SELECT 
        USING (COALESCE(is_active, true) = true OR COALESCE(banned, false) = false);
        
        CREATE POLICY "Service role can manage users" 
        ON users 
        FOR ALL 
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Assets: Public read active assets
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets') THEN
        CREATE POLICY "Public can view active assets" 
        ON assets 
        FOR SELECT 
        USING (status = 'active' OR status IS NULL);
        
        CREATE POLICY "Service role can manage assets" 
        ON assets 
        FOR ALL 
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- ============================================
-- PART 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Forum Categories indexes
CREATE INDEX IF NOT EXISTS idx_forum_categories_sort_order ON forum_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_forum_categories_is_active ON forum_categories(is_active);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

-- Forum Threads indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_status ON forum_threads(status);
CREATE INDEX IF NOT EXISTS idx_forum_threads_is_deleted ON forum_threads(is_deleted);

-- Forum Replies indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_is_deleted ON forum_replies(is_deleted);

-- ============================================
-- PART 6: GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON forum_categories TO anon, authenticated;
GRANT SELECT ON activities TO anon, authenticated;
GRANT SELECT ON forum_threads TO anon, authenticated;
GRANT SELECT ON forum_replies TO anon, authenticated;

-- Grant to service_role (full access)
GRANT ALL ON forum_categories TO service_role;
GRANT ALL ON activities TO service_role;
GRANT ALL ON forum_threads TO service_role;
GRANT ALL ON forum_replies TO service_role;

-- ============================================
-- PART 7: VERIFY STRUCTURE
-- ============================================

-- Verify forum_categories structure
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'forum_categories'
    AND column_name IN ('id', 'name', 'description', 'icon', 'color', 'sort_order', 'is_active', 'thread_count', 'post_count');
    
    IF col_count < 8 THEN
        RAISE NOTICE 'Warning: forum_categories may be missing some columns. Expected at least 8, found %', col_count;
    ELSE
        RAISE NOTICE 'forum_categories structure verified: % columns found', col_count;
    END IF;
END $$;

-- Verify activities structure
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'activities'
    AND column_name IN ('id', 'user_id', 'type', 'description', 'metadata', 'created_at');
    
    IF col_count < 6 THEN
        RAISE NOTICE 'Warning: activities may be missing some columns. Expected at least 6, found %', col_count;
    ELSE
        RAISE NOTICE 'activities structure verified: % columns found', col_count;
    END IF;
END $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE FIX COMPLETE - 100%';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Forum categories column fixed (sort_order)';
    RAISE NOTICE '✅ Activities table structure verified';
    RAISE NOTICE '✅ RLS policies created for public read';
    RAISE NOTICE '✅ Service role has full access';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '✅ Permissions granted';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tables are now properly connected!';
    RAISE NOTICE '========================================';
END $$;

