-- ============================================
-- SETUP DATABASE LENGKAP - SUPABASE
-- ============================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  membership TEXT DEFAULT 'free' CHECK (membership IN ('free', 'vip', 'admin')),
  coins INTEGER DEFAULT 100,
  reputation INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('scripts', 'mlo', 'vehicles', 'clothing')),
  framework TEXT DEFAULT 'standalone' CHECK (framework IN ('standalone', 'esx', 'qbcore', 'qbox')),
  version TEXT DEFAULT '1.0.0',
  coin_price INTEGER DEFAULT 0,
  thumbnail TEXT,
  download_link TEXT,
  file_size TEXT,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'archived')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  virus_scan_status TEXT DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'threat')),
  author_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. FORUM TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS forum_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'message-circle',
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  thread_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 50000),
  category_id TEXT REFERENCES forum_categories(id) ON DELETE SET NULL,
  author_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  replies_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  last_reply_at TIMESTAMPTZ,
  last_reply_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 10000),
  likes INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SPIN WHEEL TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  probability DECIMAL(5,2) NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT '#4ade80',
  rarity VARCHAR(20) DEFAULT 'common',
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_wheel_settings (
  id SERIAL PRIMARY KEY,
  daily_free_spins INTEGER DEFAULT 0,
  spin_cost_coins INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  jackpot_threshold INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  discord_id VARCHAR(100),
  prize_id INTEGER,
  prize_name VARCHAR(100),
  coins_won INTEGER DEFAULT 0,
  spin_type VARCHAR(20) DEFAULT 'ticket',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_spin_tickets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  discord_id VARCHAR(100) NOT NULL,
  tickets INTEGER DEFAULT 0,
  last_claim TIMESTAMPTZ,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  server_name VARCHAR(100),
  upvotes_received INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  badge VARCHAR(20),
  image_url TEXT,
  user_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. OTHER TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  coin_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, asset_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  type TEXT DEFAULT 'system' CHECK (type IN ('reply', 'mention', 'like', 'system', 'download')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread', 'reply', 'asset')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- ============================================
-- 7. INSERT DEFAULT DATA
-- ============================================

-- Forum Categories
INSERT INTO forum_categories (id, name, description, icon, color, sort_order, is_active)
VALUES 
  ('announcements', 'Announcements', 'Official announcements and updates', 'megaphone', '#EF4444', 1, true),
  ('general', 'General Discussion', 'Chat about anything FiveM related', 'message-circle', '#22C55E', 2, true),
  ('help', 'Help & Support', 'Get help with scripts and troubleshooting', 'help-circle', '#F59E0B', 3, true),
  ('requests', 'Script Requests', 'Request new scripts and features', 'code', '#3B82F6', 4, true),
  ('showcase', 'Showcase', 'Show off your servers and creations', 'star', '#EC4899', 5, true),
  ('marketplace', 'Marketplace', 'Buy, sell, and trade resources', 'shopping-bag', '#8B5CF6', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Spin Wheel Prizes
INSERT INTO spin_wheel_prizes (name, coins, probability, color, rarity, is_active) 
VALUES
  ('5 Coins', 5, 25, '#4ade80', 'common', true),
  ('10 Coins', 10, 20, '#22d3ee', 'common', true),
  ('25 Coins', 25, 18, '#a78bfa', 'uncommon', true),
  ('50 Coins', 50, 15, '#f472b6', 'uncommon', true),
  ('100 Coins', 100, 10, '#fbbf24', 'rare', true),
  ('250 Coins', 250, 7, '#f97316', 'rare', true),
  ('500 Coins', 500, 4, '#ef4444', 'epic', true),
  ('JACKPOT 1000', 1000, 1, '#eab308', 'legendary', true)
ON CONFLICT DO NOTHING;

-- Spin Wheel Settings
INSERT INTO spin_wheel_settings (daily_free_spins, spin_cost_coins, is_enabled, jackpot_threshold)
SELECT 0, 0, true, 1000
WHERE NOT EXISTS (SELECT 1 FROM spin_wheel_settings LIMIT 1);

-- Testimonials
INSERT INTO testimonials (username, avatar, content, rating, server_name, upvotes_received, is_featured, is_visible, is_verified, badge) 
VALUES
  ('ServerOwner_Pro', 'https://i.pravatar.cc/150?img=1', 'Amazing service! My server grew from 50 to 500+ players in one week.', 5, 'Los Santos RP', 15000, true, true, true, 'verified'),
  ('FiveM_Developer', 'https://i.pravatar.cc/150?img=2', 'Best tool for FiveM servers. Fast delivery and great results!', 5, 'Premium RP', 25000, true, true, true, 'pro'),
  ('RPCommunity', 'https://i.pravatar.cc/150?img=3', 'Reliable service with amazing customer support!', 5, 'City Life RP', 10000, true, true, true, NULL),
  ('GameServer_Admin', 'https://i.pravatar.cc/150?img=4', 'Player count doubled after using this. Highly recommend!', 5, 'Elite Roleplay', 8500, true, true, false, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_status ON forum_threads(status);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);

-- ============================================
-- 9. ENABLE RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_spin_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. CREATE RLS POLICIES
-- ============================================

-- Users: Public read
DROP POLICY IF EXISTS "Public can view users" ON users;
CREATE POLICY "Public can view users" ON users FOR SELECT USING (true);

-- Assets: Public read active
DROP POLICY IF EXISTS "Public can view active assets" ON assets;
CREATE POLICY "Public can view active assets" ON assets FOR SELECT USING (status = 'active');

-- Forum Categories: Public read active
DROP POLICY IF EXISTS "Public can view active categories" ON forum_categories;
CREATE POLICY "Public can view active categories" ON forum_categories FOR SELECT USING (is_active = true);

-- Forum Threads: Public read approved
DROP POLICY IF EXISTS "Public can view approved threads" ON forum_threads;
CREATE POLICY "Public can view approved threads" ON forum_threads FOR SELECT USING (status = 'approved' AND is_deleted = false);

-- Forum Replies: Public read
DROP POLICY IF EXISTS "Public can view replies" ON forum_replies;
CREATE POLICY "Public can view replies" ON forum_replies FOR SELECT USING (is_deleted = false);

-- Spin Wheel: Public read
DROP POLICY IF EXISTS "Public can view prizes" ON spin_wheel_prizes;
CREATE POLICY "Public can view prizes" ON spin_wheel_prizes FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view settings" ON spin_wheel_settings;
CREATE POLICY "Public can view settings" ON spin_wheel_settings FOR SELECT USING (true);

-- Testimonials: Public read visible
DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
CREATE POLICY "Public can view testimonials" ON testimonials FOR SELECT USING (is_visible = true);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access users" ON users;
CREATE POLICY "Service role full access users" ON users FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access assets" ON assets;
CREATE POLICY "Service role full access assets" ON assets FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access threads" ON forum_threads;
CREATE POLICY "Service role full access threads" ON forum_threads FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access replies" ON forum_replies;
CREATE POLICY "Service role full access replies" ON forum_replies FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access spin_history" ON spin_history;
CREATE POLICY "Service role full access spin_history" ON spin_history FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access tickets" ON daily_spin_tickets;
CREATE POLICY "Service role full access tickets" ON daily_spin_tickets FOR ALL USING (true);

-- ============================================
-- SETUP COMPLETE
-- ============================================
SELECT 'Database setup completed successfully!' as status;
