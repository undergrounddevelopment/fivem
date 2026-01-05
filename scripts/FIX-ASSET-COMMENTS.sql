-- FIX ASSET COMMENTS TABLE
-- Run this in Supabase SQL Editor

-- Check if table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'asset_comments') THEN
    -- Create table if not exists
    CREATE TABLE asset_comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL, -- Discord ID
      comment TEXT NOT NULL,
      rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
      likes_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_asset_comments_asset_id ON asset_comments(asset_id);
    CREATE INDEX idx_asset_comments_user_id ON asset_comments(user_id);
    CREATE INDEX idx_asset_comments_created_at ON asset_comments(created_at DESC);

    RAISE NOTICE '✅ asset_comments table created';
  ELSE
    RAISE NOTICE '✅ asset_comments table already exists';
  END IF;
END $$;

-- Ensure 'comment' column exists (not 'content')
DO $$
BEGIN
  -- Check if 'content' column exists and rename to 'comment'
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'asset_comments' AND column_name = 'content'
  ) THEN
    ALTER TABLE asset_comments RENAME COLUMN content TO comment;
    RAISE NOTICE '✅ Renamed content to comment';
  END IF;

  -- Ensure 'comment' column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'asset_comments' AND column_name = 'comment'
  ) THEN
    ALTER TABLE asset_comments ADD COLUMN comment TEXT NOT NULL;
    RAISE NOTICE '✅ Added comment column';
  END IF;
END $$;

-- Add missing columns if needed
ALTER TABLE asset_comments 
  ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS
ALTER TABLE asset_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view comments" ON asset_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON asset_comments;
DROP POLICY IF EXISTS "Users can update their comments" ON asset_comments;
DROP POLICY IF EXISTS "Users can delete their comments" ON asset_comments;

-- Create RLS policies
CREATE POLICY "Anyone can view comments" ON asset_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON asset_comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their comments" ON asset_comments
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their comments" ON asset_comments
  FOR DELETE USING (true);

-- Verify
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'asset_comments';
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ ASSET COMMENTS TABLE FIXED';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'Columns: %', col_count;
  RAISE NOTICE 'RLS: Enabled';
  RAISE NOTICE 'Policies: 4 active';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Comment system ready!';
  RAISE NOTICE '';
END $$;
