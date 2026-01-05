-- FIX ASSETS SCHEMA AND DATA
-- Run this in Supabase SQL Editor

-- 1. Update status enum to include 'active'
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;
ALTER TABLE assets ADD CONSTRAINT assets_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'featured', 'active'));

-- 2. Update all 'active' status to 'approved' for consistency
UPDATE assets SET status = 'approved' WHERE status = 'active';

-- 3. Add missing columns if they don't exist
ALTER TABLE assets ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 4. Copy data from old columns to new ones if needed
UPDATE assets SET 
  thumbnail_url = COALESCE(thumbnail_url, thumbnail),
  download_url = COALESCE(download_url, download_link)
WHERE thumbnail_url IS NULL OR download_url IS NULL;

-- 5. Set featured status for popular assets
UPDATE assets SET 
  is_featured = true,
  status = 'featured'
WHERE downloads > 1000 OR likes > 100;

-- 6. Ensure all assets have proper creator_id
UPDATE assets SET creator_id = (
  SELECT id FROM users WHERE discord_id = 'default-admin' LIMIT 1
) WHERE creator_id IS NULL OR creator_id = '';

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_creator ON assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_assets_featured ON assets(is_featured);

-- 8. Update RLS policies
DROP POLICY IF EXISTS "Assets are viewable by everyone" ON assets;
CREATE POLICY "Assets are viewable by everyone" ON assets
  FOR SELECT USING (status IN ('approved', 'featured', 'active'));

DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
CREATE POLICY "Users can insert their own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
CREATE POLICY "Users can update their own assets" ON assets
  FOR UPDATE USING (auth.uid() = creator_id);

-- 9. Verify the fix
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN thumbnail_url IS NOT NULL THEN 1 END) as with_thumbnail,
  COUNT(CASE WHEN download_url IS NOT NULL THEN 1 END) as with_download
FROM assets 
GROUP BY status
ORDER BY count DESC;

-- 10. Show sample data
SELECT 
  id,
  title,
  status,
  category,
  downloads,
  likes,
  is_featured,
  created_at
FROM assets 
WHERE status IN ('approved', 'featured', 'active')
ORDER BY created_at DESC 
LIMIT 10;