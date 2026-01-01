-- Missing Tables for FiveM Tools V7

-- 1. Likes table (untuk like system)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_target ON likes(target_id, target_type);

-- 2. Forum ranks table
CREATE TABLE IF NOT EXISTS forum_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level INTEGER NOT NULL UNIQUE,
  min_posts INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ranks
INSERT INTO forum_ranks (name, level, min_posts, color, icon) VALUES
('Newbie', 1, 0, '#94a3b8', '🌱'),
('Member', 2, 10, '#3b82f6', '👤'),
('Active', 3, 50, '#10b981', '⭐'),
('Veteran', 4, 100, '#f59e0b', '🔥'),
('Legend', 5, 500, '#8b5cf6', '👑')
ON CONFLICT (level) DO NOTHING;

-- 3. Spin wheel settings
CREATE TABLE IF NOT EXISTS spin_wheel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_spins_enabled BOOLEAN DEFAULT true,
  coins_per_spin INTEGER DEFAULT 100,
  min_membership_level TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO spin_wheel_settings (daily_spins_enabled, coins_per_spin, min_membership_level)
VALUES (true, 100, 'free')
ON CONFLICT DO NOTHING;

-- 4. Spin wheel force wins
CREATE TABLE IF NOT EXISTS spin_wheel_force_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prize_id UUID REFERENCES spin_wheel_prizes(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_force_wins_user ON spin_wheel_force_wins(user_id);
CREATE INDEX idx_force_wins_active ON spin_wheel_force_wins(is_active);

-- 5. Spin wheel eligible users
CREATE TABLE IF NOT EXISTS spin_wheel_eligible_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_eligible_users ON spin_wheel_eligible_users(user_id);

-- 6. Daily claims
CREATE TABLE IF NOT EXISTS daily_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  claim_type TEXT NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_claims_user ON daily_claims(user_id);
CREATE INDEX idx_daily_claims_date ON daily_claims(claimed_at);

-- 7. Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Insert default forum settings
INSERT INTO site_settings (category, key, value) VALUES
('forum', 'allow_guest_view', 'true'),
('forum', 'require_approval', 'true'),
('forum', 'min_post_length', '10')
ON CONFLICT (category, key) DO NOTHING;

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_force_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_eligible_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (true);

CREATE POLICY "Public read" ON forum_ranks FOR SELECT USING (true);
CREATE POLICY "Public read" ON spin_wheel_settings FOR SELECT USING (true);
CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON likes FOR ALL USING (true);
CREATE POLICY "Service role full access" ON forum_ranks FOR ALL USING (true);
CREATE POLICY "Service role full access" ON spin_wheel_settings FOR ALL USING (true);
CREATE POLICY "Service role full access" ON spin_wheel_force_wins FOR ALL USING (true);
CREATE POLICY "Service role full access" ON spin_wheel_eligible_users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON daily_claims FOR ALL USING (true);
CREATE POLICY "Service role full access" ON site_settings FOR ALL USING (true);
