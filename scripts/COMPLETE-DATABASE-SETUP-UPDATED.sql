-- ============================================
-- COMPLETE DATABASE SETUP - UPDATED VERSION
-- FiveM Tools V7 - Production Ready + Spin Tickets
-- ============================================

-- ============================================
-- PART 1: USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  discriminator TEXT,
  avatar TEXT,
  email TEXT,
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  spin_tickets INTEGER DEFAULT 0 CHECK (spin_tickets >= 0),
  membership TEXT DEFAULT 'free' CHECK (membership IN ('free', 'vip', 'premium', 'admin')),
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  last_login TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_discord ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin) WHERE is_admin = true;

-- ============================================
-- PART 2: ADMIN CHECK FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE discord_id = auth.uid()::text 
    AND (is_admin = true OR membership = 'admin')
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- PART 3: USERS RLS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

CREATE POLICY "Public can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (discord_id = auth.uid()::text);
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (is_admin());

-- ============================================
-- PART 4: FORUM SYSTEM
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

CREATE INDEX IF NOT EXISTS idx_forum_categories_sort ON forum_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_status ON forum_threads(status);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active categories" ON forum_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON forum_categories;
DROP POLICY IF EXISTS "Public can view approved threads" ON forum_threads;
DROP POLICY IF EXISTS "Users can create threads" ON forum_threads;
DROP POLICY IF EXISTS "Admins can manage threads" ON forum_threads;
DROP POLICY IF EXISTS "Public can view replies" ON forum_replies;
DROP POLICY IF EXISTS "Users can create replies" ON forum_replies;
DROP POLICY IF EXISTS "Admins can manage replies" ON forum_replies;

CREATE POLICY "Public can view active categories" ON forum_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON forum_categories FOR ALL USING (is_admin());
CREATE POLICY "Public can view approved threads" ON forum_threads FOR SELECT USING (status = 'approved' AND is_deleted = false);
CREATE POLICY "Users can create threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid()::text = author_id);
CREATE POLICY "Admins can manage threads" ON forum_threads FOR ALL USING (is_admin());
CREATE POLICY "Public can view replies" ON forum_replies FOR SELECT USING (is_deleted = false);
CREATE POLICY "Users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.uid()::text = author_id);
CREATE POLICY "Admins can manage replies" ON forum_replies FOR ALL USING (is_admin());

CREATE OR REPLACE FUNCTION update_category_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE forum_categories SET thread_count = thread_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE forum_categories SET thread_count = GREATEST(thread_count - 1, 0) WHERE id = OLD.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_category_counts_trigger ON forum_threads;
CREATE TRIGGER update_category_counts_trigger
AFTER INSERT OR DELETE ON forum_threads
FOR EACH ROW EXECUTE FUNCTION update_category_thread_count();

INSERT INTO forum_categories (id, name, description, icon, color, sort_order) VALUES
  ('announcements', 'Announcements', 'Official announcements', 'megaphone', '#EF4444', 1),
  ('general', 'General Discussion', 'Chat about FiveM', 'message-circle', '#22C55E', 2),
  ('help', 'Help & Support', 'Get help', 'help-circle', '#F59E0B', 3),
  ('requests', 'Script Requests', 'Request scripts', 'code', '#3B82F6', 4),
  ('showcase', 'Showcase', 'Show off', 'star', '#EC4899', 5),
  ('marketplace', 'Marketplace', 'Buy & sell', 'shopping-bag', '#8B5CF6', 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 5: COINS & SPIN WHEEL
-- ============================================

CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount != 0),
  type TEXT NOT NULL CHECK (type IN ('daily', 'spin', 'purchase', 'reward', 'admin', 'refund')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('coins', 'ticket', 'item', 'nothing')),
  value INTEGER DEFAULT 0,
  probability DECIMAL(5,2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'gift',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_wheel_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  prize_id UUID REFERENCES spin_wheel_prizes(id) ON DELETE SET NULL,
  prize_name TEXT NOT NULL,
  prize_type TEXT NOT NULL,
  prize_value INTEGER DEFAULT 0,
  was_forced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_wheel_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  ticket_type TEXT DEFAULT 'daily' CHECK (ticket_type IN ('daily', 'purchase', 'reward', 'admin')),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('coins', 'spin')),
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, claim_type, claim_date)
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created ON coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spin_history_user ON spin_wheel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_history_created ON spin_wheel_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spin_tickets_user ON spin_wheel_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_tickets_unused ON spin_wheel_tickets(user_id, is_used) WHERE is_used = false;
CREATE INDEX IF NOT EXISTS idx_daily_claims_user ON daily_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_claims_date ON daily_claims(claim_date DESC);

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Public can view active prizes" ON spin_wheel_prizes;
DROP POLICY IF EXISTS "Admins can manage prizes" ON spin_wheel_prizes;
DROP POLICY IF EXISTS "Users can view own history" ON spin_wheel_history;
DROP POLICY IF EXISTS "Users can view own tickets" ON spin_wheel_tickets;
DROP POLICY IF EXISTS "Admins can manage tickets" ON spin_wheel_tickets;
DROP POLICY IF EXISTS "Users can view own claims" ON daily_claims;

CREATE POLICY "Users can view own transactions" ON coin_transactions FOR SELECT USING (user_id = auth.uid()::text OR is_admin());
CREATE POLICY "Public can view active prizes" ON spin_wheel_prizes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage prizes" ON spin_wheel_prizes FOR ALL USING (is_admin());
CREATE POLICY "Users can view own history" ON spin_wheel_history FOR SELECT USING (user_id = auth.uid()::text OR is_admin());
CREATE POLICY "Users can view own tickets" ON spin_wheel_tickets FOR SELECT USING (user_id = auth.uid()::text OR is_admin());
CREATE POLICY "Admins can manage tickets" ON spin_wheel_tickets FOR ALL USING (is_admin());
CREATE POLICY "Users can view own claims" ON daily_claims FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

CREATE OR REPLACE FUNCTION get_user_balance(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE balance INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO balance FROM coin_transactions WHERE user_id = p_user_id;
  RETURN GREATEST(balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION add_coins(p_user_id TEXT, p_amount INTEGER, p_type TEXT, p_description TEXT DEFAULT NULL, p_reference_id TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE new_balance INTEGER; transaction_id UUID;
BEGIN
  IF p_amount = 0 THEN RETURN jsonb_build_object('success', false, 'error', 'Amount cannot be zero'); END IF;
  INSERT INTO coin_transactions (user_id, amount, type, description, reference_id) 
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id) 
  RETURNING id INTO transaction_id;
  new_balance := get_user_balance(p_user_id);
  UPDATE users SET coins = new_balance, updated_at = NOW() WHERE discord_id = p_user_id;
  RETURN jsonb_build_object('success', true, 'transaction_id', transaction_id, 'new_balance', new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_claim_daily(p_user_id TEXT, p_claim_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (SELECT 1 FROM daily_claims WHERE user_id = p_user_id AND claim_type = p_claim_type AND claim_date = CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION claim_daily_reward(p_user_id TEXT, p_claim_type TEXT, p_amount INTEGER DEFAULT 100)
RETURNS JSONB AS $$
DECLARE can_claim BOOLEAN; result JSONB;
BEGIN
  can_claim := can_claim_daily(p_user_id, p_claim_type);
  IF NOT can_claim THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed today');
  END IF;
  
  INSERT INTO daily_claims (user_id, claim_type) VALUES (p_user_id, p_claim_type);
  
  IF p_claim_type = 'coins' THEN
    result := add_coins(p_user_id, p_amount, 'daily', 'Daily coins reward');
  ELSIF p_claim_type = 'spin' THEN
    INSERT INTO spin_wheel_tickets (user_id, ticket_type) VALUES (p_user_id, 'daily');
    result := jsonb_build_object('success', true, 'message', 'Daily spin ticket claimed');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

INSERT INTO spin_wheel_prizes (name, type, value, probability, color, icon, sort_order) VALUES
  ('Nothing', 'nothing', 0, 30.00, '#6B7280', 'x', 1),
  ('10 Coins', 'coins', 10, 25.00, '#3B82F6', 'coins', 2),
  ('25 Coins', 'coins', 25, 20.00, '#10B981', 'coins', 3),
  ('50 Coins', 'coins', 50, 15.00, '#F59E0B', 'coins', 4),
  ('100 Coins', 'coins', 100, 7.00, '#EF4444', 'coins', 5),
  ('Extra Spin', 'ticket', 1, 2.50, '#8B5CF6', 'ticket', 6),
  ('Jackpot 500', 'coins', 500, 0.50, '#EC4899', 'star', 7)
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 6: ASSETS & ADMIN
-- ============================================

CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('scripts', 'mlo', 'vehicles', 'clothing', 'maps', 'tools')),
  framework TEXT CHECK (framework IN ('qbcore', 'esx', 'qbox', 'standalone')),
  version TEXT DEFAULT '1.0.0',
  coin_price INTEGER DEFAULT 0 CHECK (coin_price >= 0),
  thumbnail TEXT,
  download_link TEXT,
  file_size TEXT,
  tags TEXT[] DEFAULT '{}',
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'approved', 'published', 'inactive', 'rejected')),
  author_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  position TEXT DEFAULT 'top' CHECK (position IN ('top', 'sidebar', 'footer', 'hero')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'promo')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_framework ON assets(framework);
CREATE INDEX IF NOT EXISTS idx_assets_author ON assets(author_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_created ON assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active assets" ON assets;
DROP POLICY IF EXISTS "Authors can manage own assets" ON assets;
DROP POLICY IF EXISTS "Public can view active banners" ON banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON banners;
DROP POLICY IF EXISTS "Public can view active announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Public can view active testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Public can view settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;

CREATE POLICY "Public can view active assets" ON assets FOR SELECT USING (status IN ('active', 'approved', 'published'));
CREATE POLICY "Authors can manage own assets" ON assets FOR ALL USING (author_id = auth.uid()::text OR is_admin());
CREATE POLICY "Public can view active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage banners" ON banners FOR ALL USING (is_admin());
CREATE POLICY "Public can view active announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL USING (is_admin());
CREATE POLICY "Public can view active testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Public can view settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON site_settings FOR ALL USING (is_admin());

INSERT INTO site_settings (key, value, category) VALUES
  ('site_name', '"FiveM Tools V7"'::jsonb, 'general'),
  ('daily_coins_amount', '100'::jsonb, 'coins'),
  ('maintenance_mode', 'false'::jsonb, 'general')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- PART 7: LINKVERTISE
-- ============================================

CREATE TABLE IF NOT EXISTS linkvertise_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  linkvertise_url TEXT NOT NULL,
  download_hash TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_linkvertise_hash ON linkvertise_downloads(download_hash);
CREATE INDEX IF NOT EXISTS idx_linkvertise_user ON linkvertise_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_linkvertise_asset ON linkvertise_downloads(asset_id);

ALTER TABLE linkvertise_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own downloads" ON linkvertise_downloads;

CREATE POLICY "Users can view own downloads" ON linkvertise_downloads FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON users, forum_threads, forum_replies, coin_transactions, spin_wheel_history, spin_wheel_tickets, daily_claims, assets, notifications TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- SETUP COMPLETE
-- ============================================

SELECT '✅ Complete database setup finished successfully!' as status,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
       (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
       (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = 'public'::regnamespace) as total_functions;
