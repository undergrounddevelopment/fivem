-- =====================================================
-- SETUP MESSAGES & BADGES SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create messages table if not exists
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- 3. Create user_badges table if not exists
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 4. Create badges definition table
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT DEFAULT 'general',
  requirement_type TEXT,
  requirement_value INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insert default badges
INSERT INTO badges (id, name, description, icon, category, requirement_type, requirement_value, rarity) VALUES
  ('newcomer', 'Newcomer', 'Welcome to FiveM Tools!', '👋', 'general', 'join', 1, 'common'),
  ('first_post', 'First Post', 'Created your first forum post', '📝', 'forum', 'posts', 1, 'common'),
  ('active_poster', 'Active Poster', 'Created 10 forum posts', '💬', 'forum', 'posts', 10, 'uncommon'),
  ('forum_veteran', 'Forum Veteran', 'Created 50 forum posts', '🏆', 'forum', 'posts', 50, 'rare'),
  ('forum_legend', 'Forum Legend', 'Created 100 forum posts', '👑', 'forum', 'posts', 100, 'legendary'),
  ('first_upload', 'First Upload', 'Uploaded your first asset', '📤', 'assets', 'uploads', 1, 'common'),
  ('contributor', 'Contributor', 'Uploaded 5 assets', '🎁', 'assets', 'uploads', 5, 'uncommon'),
  ('top_contributor', 'Top Contributor', 'Uploaded 20 assets', '⭐', 'assets', 'uploads', 20, 'rare'),
  ('asset_master', 'Asset Master', 'Uploaded 50 assets', '🌟', 'assets', 'uploads', 50, 'legendary'),
  ('liked', 'Liked', 'Received 10 likes', '❤️', 'social', 'likes', 10, 'common'),
  ('popular', 'Popular', 'Received 50 likes', '🔥', 'social', 'likes', 50, 'uncommon'),
  ('famous', 'Famous', 'Received 200 likes', '💎', 'social', 'likes', 200, 'rare'),
  ('superstar', 'Superstar', 'Received 500 likes', '🌠', 'social', 'likes', 500, 'legendary'),
  ('level_5', 'Rising Star', 'Reached Level 5', '⬆️', 'xp', 'level', 5, 'common'),
  ('level_10', 'Experienced', 'Reached Level 10', '📈', 'xp', 'level', 10, 'uncommon'),
  ('level_25', 'Expert', 'Reached Level 25', '🎯', 'xp', 'level', 25, 'rare'),
  ('level_50', 'Master', 'Reached Level 50', '🏅', 'xp', 'level', 50, 'epic'),
  ('level_100', 'Grandmaster', 'Reached Level 100', '👑', 'xp', 'level', 100, 'legendary'),
  ('early_adopter', 'Early Adopter', 'Joined in the first month', '🚀', 'special', 'special', 0, 'rare'),
  ('vip_member', 'VIP Member', 'VIP membership holder', '💎', 'membership', 'vip', 1, 'epic'),
  ('helper', 'Helper', 'Helped 10 users in forum', '🤝', 'community', 'helps', 10, 'uncommon'),
  ('mentor', 'Mentor', 'Helped 50 users in forum', '🎓', 'community', 'helps', 50, 'rare')
ON CONFLICT (id) DO NOTHING;

-- 6. Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- 7. Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "badges_select" ON badges;
CREATE POLICY "badges_select" ON badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_badges_select" ON user_badges;
CREATE POLICY "user_badges_select" ON user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_badges_insert" ON user_badges;
CREATE POLICY "user_badges_insert" ON user_badges FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_all" ON notifications;
CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true);

-- 9. Grant permissions
GRANT ALL ON messages TO authenticated, anon, service_role;
GRANT ALL ON badges TO authenticated, anon, service_role;
GRANT ALL ON user_badges TO authenticated, anon, service_role;
GRANT ALL ON notifications TO authenticated, anon, service_role;

SELECT 'Messages & Badges system setup complete!' as status;
