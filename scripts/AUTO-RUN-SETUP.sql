-- ============================================
-- AUTO RUN DATABASE SETUP
-- Safe to run multiple times - won't duplicate
-- ============================================

-- 1. Add XP columns to users (IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'xp') THEN
    ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
    ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_badge') THEN
    ALTER TABLE users ADD COLUMN current_badge TEXT DEFAULT 'beginner';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'reputation') THEN
    ALTER TABLE users ADD COLUMN reputation INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2. Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  max_xp INTEGER,
  color TEXT NOT NULL,
  tier INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- 4. Create xp_transactions table
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create asset_comments table
CREATE TABLE IF NOT EXISTS asset_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  content TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Add status column to forum_threads
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'status') THEN
    ALTER TABLE forum_threads ADD COLUMN status TEXT DEFAULT 'approved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'rejection_reason') THEN
    ALTER TABLE forum_threads ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- 7. Create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created ON xp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_asset_comments_asset ON asset_comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_comments_user ON asset_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);

-- 8. Seed badges (UPSERT - won't duplicate)
INSERT INTO badges (id, name, description, image_url, min_xp, max_xp, color, tier) VALUES
  ('beginner', 'Beginner Bolt', 'Start your journey - New member rank', '/badges/badge1.png', 0, 999, '#84CC16', 1),
  ('intermediate', 'Intermediate Bolt', 'Rising star - Active community member', '/badges/badge2.png', 1000, 4999, '#3B82F6', 2),
  ('advanced', 'Advanced Bolt', 'Skilled contributor - Experienced member', '/badges/badge3.png', 5000, 14999, '#9333EA', 3),
  ('expert', 'Expert Bolt', 'Elite status - Top community member', '/badges/badge4.png', 15000, 49999, '#DC2626', 4),
  ('legend', 'Legend Bolt', 'Legendary - Ultimate rank achieved', '/badges/badge5.png', 50000, NULL, '#F59E0B', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  min_xp = EXCLUDED.min_xp,
  max_xp = EXCLUDED.max_xp,
  color = EXCLUDED.color,
  tier = EXCLUDED.tier;

-- 9. Update users with NULL XP to default values
UPDATE users SET xp = 0 WHERE xp IS NULL;
UPDATE users SET level = 1 WHERE level IS NULL;
UPDATE users SET current_badge = 'beginner' WHERE current_badge IS NULL;

-- 10. Enable RLS policies for new tables
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_comments ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies (IF NOT EXISTS workaround)
DO $$ 
BEGIN
  -- Badges: public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'badges_public_read') THEN
    CREATE POLICY badges_public_read ON badges FOR SELECT USING (true);
  END IF;
  
  -- User badges: public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'user_badges_public_read') THEN
    CREATE POLICY user_badges_public_read ON user_badges FOR SELECT USING (true);
  END IF;
  
  -- Asset comments: public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asset_comments' AND policyname = 'asset_comments_public_read') THEN
    CREATE POLICY asset_comments_public_read ON asset_comments FOR SELECT USING (true);
  END IF;
  
  -- Asset comments: authenticated insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asset_comments' AND policyname = 'asset_comments_auth_insert') THEN
    CREATE POLICY asset_comments_auth_insert ON asset_comments FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Done!
SELECT 'Database setup complete!' as status;
