-- ============================================
-- FINAL WORKING SETUP - GUARANTEED 100%
-- ============================================

-- Disable RLS
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coin_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS spin_wheel_prizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS spin_wheel_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS spin_wheel_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS linkvertise_downloads DISABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE IF NOT EXISTS users (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, discord_id TEXT UNIQUE NOT NULL, username TEXT NOT NULL, avatar TEXT, email TEXT, coins INTEGER DEFAULT 0, spin_tickets INTEGER DEFAULT 0, membership TEXT DEFAULT 'free', is_admin BOOLEAN DEFAULT false, last_seen TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS forum_categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, icon TEXT DEFAULT 'message-circle', color TEXT DEFAULT '#3B82F6', sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true, thread_count INTEGER DEFAULT 0, post_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS forum_threads (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, category_id TEXT REFERENCES forum_categories(id) ON DELETE SET NULL, author_id TEXT NOT NULL, status TEXT DEFAULT 'pending', is_pinned BOOLEAN DEFAULT false, is_locked BOOLEAN DEFAULT false, is_deleted BOOLEAN DEFAULT false, replies_count INTEGER DEFAULT 0, likes INTEGER DEFAULT 0, views INTEGER DEFAULT 0, images TEXT[] DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS forum_replies (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE, author_id TEXT NOT NULL, content TEXT NOT NULL, likes INTEGER DEFAULT 0, is_edited BOOLEAN DEFAULT false, is_deleted BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS coin_transactions (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, amount INTEGER NOT NULL, type TEXT NOT NULL, description TEXT, reference_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS spin_wheel_prizes (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, value INTEGER DEFAULT 0, probability DECIMAL(5,2) NOT NULL, color TEXT DEFAULT '#3B82F6', icon TEXT DEFAULT 'gift', is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS spin_wheel_history (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, prize_id UUID REFERENCES spin_wheel_prizes(id) ON DELETE SET NULL, prize_name TEXT NOT NULL, prize_type TEXT NOT NULL, prize_value INTEGER DEFAULT 0, was_forced BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS spin_wheel_tickets (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, ticket_type TEXT DEFAULT 'daily', is_used BOOLEAN DEFAULT false, used_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS daily_claims (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, claim_type TEXT NOT NULL, claim_date DATE NOT NULL DEFAULT CURRENT_DATE, claimed_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, claim_type, claim_date));
CREATE TABLE IF NOT EXISTS assets (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, title TEXT NOT NULL, description TEXT, category TEXT NOT NULL, framework TEXT, version TEXT DEFAULT '1.0.0', coin_price INTEGER DEFAULT 0, thumbnail TEXT, download_link TEXT, file_size TEXT, tags TEXT[] DEFAULT '{}', downloads INTEGER DEFAULT 0, views INTEGER DEFAULT 0, rating DECIMAL(3,2) DEFAULT 0.00, is_verified BOOLEAN DEFAULT false, is_featured BOOLEAN DEFAULT false, status TEXT DEFAULT 'pending', author_id TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS banners (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, title TEXT, image_url TEXT NOT NULL, link TEXT, position TEXT DEFAULT 'top', is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS announcements (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, title TEXT, message TEXT NOT NULL, type TEXT DEFAULT 'info', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS testimonials (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, content TEXT NOT NULL, rating INTEGER DEFAULT 5, is_featured BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS notifications (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, is_read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS site_settings (id SERIAL PRIMARY KEY, key TEXT UNIQUE NOT NULL, value JSONB, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS linkvertise_downloads (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id TEXT NOT NULL, asset_id UUID REFERENCES assets(id) ON DELETE CASCADE, linkvertise_url TEXT NOT NULL, download_hash TEXT UNIQUE NOT NULL, verified BOOLEAN DEFAULT false, ip_address TEXT, user_agent TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), verified_at TIMESTAMPTZ);

-- Add missing columns
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE spin_wheel_prizes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_discord ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_spin_tickets_user ON spin_wheel_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_author ON assets(author_id);

-- Create functions
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM users WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub' AND is_admin = true); EXCEPTION WHEN OTHERS THEN RETURN false; END; $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id TEXT) RETURNS INTEGER AS $$ DECLARE balance INTEGER; BEGIN SELECT COALESCE(SUM(amount), 0) INTO balance FROM coin_transactions WHERE user_id = p_user_id; RETURN GREATEST(balance, 0); END; $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
CREATE OR REPLACE FUNCTION add_coins(p_user_id TEXT, p_amount INTEGER, p_type TEXT, p_description TEXT DEFAULT NULL, p_reference_id TEXT DEFAULT NULL) RETURNS JSONB AS $$ DECLARE new_balance INTEGER; transaction_id UUID; BEGIN IF p_amount = 0 THEN RETURN jsonb_build_object('success', false, 'error', 'Amount cannot be zero'); END IF; INSERT INTO coin_transactions (user_id, amount, type, description, reference_id) VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id) RETURNING id INTO transaction_id; new_balance := get_user_balance(p_user_id); UPDATE users SET coins = new_balance, updated_at = NOW() WHERE discord_id = p_user_id; RETURN jsonb_build_object('success', true, 'transaction_id', transaction_id, 'new_balance', new_balance); END; $$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION can_claim_daily(p_user_id TEXT, p_claim_type TEXT) RETURNS BOOLEAN AS $$ BEGIN RETURN NOT EXISTS (SELECT 1 FROM daily_claims WHERE user_id = p_user_id AND claim_type = p_claim_type AND claim_date = CURRENT_DATE); END; $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
CREATE OR REPLACE FUNCTION claim_daily_reward(p_user_id TEXT, p_claim_type TEXT, p_amount INTEGER DEFAULT 100) RETURNS JSONB AS $$ DECLARE can_claim BOOLEAN; result JSONB; BEGIN can_claim := can_claim_daily(p_user_id, p_claim_type); IF NOT can_claim THEN RETURN jsonb_build_object('success', false, 'error', 'Already claimed today'); END IF; INSERT INTO daily_claims (user_id, claim_type) VALUES (p_user_id, p_claim_type); IF p_claim_type = 'coins' THEN result := add_coins(p_user_id, p_amount, 'daily', 'Daily coins reward'); ELSIF p_claim_type = 'spin' THEN INSERT INTO spin_wheel_tickets (user_id, ticket_type) VALUES (p_user_id, 'daily'); result := jsonb_build_object('success', true, 'message', 'Daily spin ticket claimed'); END IF; RETURN result; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert data
INSERT INTO forum_categories (id, name, description, icon, color, sort_order) VALUES ('announcements', 'Announcements', 'Official announcements', 'megaphone', '#EF4444', 1), ('general', 'General Discussion', 'Chat about FiveM', 'message-circle', '#22C55E', 2), ('help', 'Help & Support', 'Get help', 'help-circle', '#F59E0B', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings (key, value, category) VALUES ('site_name', '"FiveM Tools V7"'::jsonb, 'general'), ('daily_coins_amount', '100'::jsonb, 'coins') ON CONFLICT (key) DO NOTHING;

-- Create linkvertise index after everything
CREATE INDEX IF NOT EXISTS idx_linkvertise_hash ON linkvertise_downloads(download_hash);

SELECT 'Setup complete!' as status;
