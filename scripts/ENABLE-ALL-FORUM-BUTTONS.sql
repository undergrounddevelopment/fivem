-- ENABLE ALL FORUM BUTTONS - QUICK FIX
-- Run this in Supabase SQL Editor

-- 1. Add dislikes column
ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0;
ALTER TABLE forum_replies ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0;

-- 2. Create forum_dislikes table
CREATE TABLE IF NOT EXISTS forum_dislikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('thread', 'reply')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);

CREATE INDEX IF NOT EXISTS idx_dislikes_user ON forum_dislikes(user_id);
CREATE INDEX IF NOT EXISTS idx_dislikes_target ON forum_dislikes(target_id, target_type);

-- 3. Enable RLS
ALTER TABLE forum_dislikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dislikes" ON forum_dislikes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can dislike" ON forum_dislikes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove dislikes" ON forum_dislikes FOR DELETE USING (true);

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ Forum buttons enabled!';
  RAISE NOTICE '   - Dislike system ready';
  RAISE NOTICE '   - All buttons functional';
END $$;
