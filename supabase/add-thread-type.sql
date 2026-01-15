-- Migration: Add thread_type to forum_threads
-- Run this in your Supabase SQL Editor

-- 1. Add thread_type column
ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS thread_type TEXT DEFAULT 'discussion';

-- 2. Add indexes for performance and filtering
CREATE INDEX IF NOT EXISTS idx_forum_threads_thread_type ON forum_threads(thread_type);
CREATE INDEX IF NOT EXISTS idx_forum_threads_views ON forum_threads(views DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_replies_count ON forum_threads(replies_count DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);

-- 3. Update existing threads if needed (optional)
-- UPDATE forum_threads SET thread_type = 'discussion' WHERE thread_type IS NULL;

-- 4. Grant permissions (ensure service role and authenticated can access)
GRANT ALL ON forum_threads TO service_role;
GRANT ALL ON forum_threads TO authenticated;
GRANT SELECT ON forum_threads TO anon;
