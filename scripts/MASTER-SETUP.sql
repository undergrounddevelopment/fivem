-- ============================================
-- MASTER DATABASE SETUP - ALL FEATURES
-- Run this ONE file to setup everything
-- Database: postgresql://postgres.linnqtixdfjwbrixitrb:ftbU5SwxVhshePE7@aws-1-us-east-1.pooler.supabase.com:6543/postgres
-- ============================================

-- ============================================
-- PART 1: FORUM SYSTEM
-- ============================================

-- Drop and recreate forum_categories with correct structure
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS forum_threads CASCADE;
DROP TABLE IF EXISTS forum_replies CASCADE;

CREATE TABLE forum_categories (
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

CREATE TABLE forum_threads (
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

CREATE TABLE forum_replies (
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
-- PART 2: COINS & SPIN WHEEL SYSTEM
-- ============================================

DROP TABLE IF EXISTS coin_transactions CASCADE;
DROP TABLE IF EXISTS spin_wheel_prizes CASCADE;
DROP TABLE IF EXISTS spin_wheel_history CASCADE;
DROP TABLE IF EXISTS spin_wheel_tickets CASCADE;
DROP TABLE IF EXISTS daily_claims CASCADE;
DROP TABLE IF EXISTS spin_wheel_settings CASCADE;

CREATE TABLE coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount != 0),
  type TEXT NOT NULL CHECK (type IN ('daily', 'spin', 'purchase', 'reward', 'admin', 'refund')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spin_wheel_prizes (
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

CREATE TABLE spin_wheel_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  prize_id UUID REFERENCES spin_wheel_prizes(id) ON DELETE SET NULL,
  prize_name TEXT NOT NULL,
  prize_type TEXT NOT NULL,
  prize_value INTEGER DEFAULT 0,
  was_forced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spin_wheel_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('daily', 'purchase', 'reward', 'admin')),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('coins', 'spin')),
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, claim_type, claim_date)
);

CREATE TABLE spin_wheel_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 3: INDEXES FOR PERFORMANCE
-- ============================================

-- Forum indexes
CREATE INDEX idx_forum_categories_sort_order ON forum_categories(sort_order);
CREATE INDEX idx_forum_categories_active ON forum_categories(is_active);
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX idx_forum_threads_status ON forum_threads(status);
CREATE INDEX idx_forum_threads_created ON forum_threads(created_at DESC);
CREATE INDEX idx_forum_threads_pinned ON forum_threads(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_created ON forum_replies(created_at);

-- Coins & Spin indexes
CREATE INDEX idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created ON coin_transactions(created_at DESC);
CREATE INDEX idx_spin_history_user ON spin_wheel_history(user_id);
CREATE INDEX idx_spin_history_created ON spin_wheel_history(created_at DESC);
CREATE INDEX idx_spin_tickets_user ON spin_wheel_tickets(user_id);
CREATE INDEX idx_spin_tickets_used ON spin_wheel_tickets(is_used);
CREATE INDEX idx_daily_claims_user ON daily_claims(user_id);
CREATE INDEX idx_daily_claims_date ON daily_claims(claim_date);

-- ============================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 5: FUNCTIONS
-- ============================================

-- Admin check function
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

-- Thread reply counter functions
CREATE OR REPLACE FUNCTION increment_thread_replies(thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_threads 
  SET replies_count = replies_count + 1,
      updated_at = NOW()
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_thread_replies(thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_threads 
  SET replies_count = GREATEST(replies_count - 1, 0),
      updated_at = NOW()
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Category thread count trigger
CREATE OR REPLACE FUNCTION update_category_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE forum_categories 
    SET thread_count = thread_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE forum_categories 
      SET thread_count = thread_count + 1
      WHERE id = NEW.category_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE forum_categories 
      SET thread_count = GREATEST(thread_count - 1, 0)
      WHERE id = OLD.category_id;
    END IF;
    IF NEW.category_id != OLD.category_id AND NEW.status = 'approved' THEN
      UPDATE forum_categories 
      SET thread_count = GREATEST(thread_count - 1, 0)
      WHERE id = OLD.category_id;
      UPDATE forum_categories 
      SET thread_count = thread_count + 1
      WHERE id = NEW.category_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE forum_categories 
    SET thread_count = GREATEST(thread_count - 1, 0)
    WHERE id = OLD.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_category_counts_trigger ON forum_threads;
CREATE TRIGGER update_category_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON forum_threads
FOR EACH ROW
EXECUTE FUNCTION update_category_thread_count();

-- Coins functions
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  balance INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO balance
  FROM coin_transactions
  WHERE user_id = p_user_id;
  
  RETURN GREATEST(balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION add_coins(
  p_user_id TEXT,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  IF p_amount = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount cannot be zero');
  END IF;
  
  INSERT INTO coin_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id)
  RETURNING id INTO transaction_id;
  
  new_balance := get_user_balance(p_user_id);
  
  UPDATE users 
  SET coins = new_balance,
      updated_at = NOW()
  WHERE discord_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_claim_daily(
  p_user_id TEXT,
  p_claim_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM daily_claims
    WHERE user_id = p_user_id
    AND claim_type = p_claim_type
    AND claim_date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION claim_daily_reward(
  p_user_id TEXT,
  p_claim_type TEXT,
  p_amount INTEGER DEFAULT 100
)
RETURNS JSONB AS $$
DECLARE
  can_claim BOOLEAN;
  result JSONB;
BEGIN
  can_claim := can_claim_daily(p_user_id, p_claim_type);
  
  IF NOT can_claim THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed today');
  END IF;
  
  INSERT INTO daily_claims (user_id, claim_type)
  VALUES (p_user_id, p_claim_type);
  
  IF p_claim_type = 'coins' THEN
    result := add_coins(p_user_id, p_amount, 'daily', 'Daily coins reward');
  ELSE
    INSERT INTO spin_wheel_tickets (user_id, ticket_type)
    VALUES (p_user_id, 'daily');
    
    result := jsonb_build_object('success', true);
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION use_spin_ticket(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  ticket_id UUID;
BEGIN
  SELECT id INTO ticket_id
  FROM spin_wheel_tickets
  WHERE user_id = p_user_id
  AND is_used = false
  AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF ticket_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No tickets available');
  END IF;
  
  UPDATE spin_wheel_tickets
  SET is_used = true,
      used_at = NOW()
  WHERE id = ticket_id;
  
  RETURN jsonb_build_object('success', true, 'ticket_id', ticket_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 6: RLS POLICIES
-- ============================================

-- Forum policies
CREATE POLICY "Public can view active categories" ON forum_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON forum_categories
  FOR ALL USING (is_admin());

CREATE POLICY "Public can view approved threads" ON forum_threads
  FOR SELECT USING (status = 'approved' AND is_deleted = false);

CREATE POLICY "Users can create threads" ON forum_threads
  FOR INSERT WITH CHECK (
    auth.uid()::text = author_id
    AND length(title) >= 1 AND length(title) <= 200
    AND length(content) >= 10 AND length(content) <= 50000
  );

CREATE POLICY "Authors can view own threads" ON forum_threads
  FOR SELECT USING (
    author_id = auth.uid()::text
    OR (status = 'approved' AND is_deleted = false)
  );

CREATE POLICY "Admins can manage all threads" ON forum_threads
  FOR ALL USING (is_admin());

CREATE POLICY "Public can view replies of approved threads" ON forum_replies
  FOR SELECT USING (
    is_deleted = false
    AND EXISTS (
      SELECT 1 FROM forum_threads 
      WHERE id = forum_replies.thread_id 
      AND status = 'approved' 
      AND is_deleted = false
    )
  );

CREATE POLICY "Users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (
    auth.uid()::text = author_id
    AND length(content) >= 1 AND length(content) <= 10000
    AND EXISTS (
      SELECT 1 FROM forum_threads 
      WHERE id = forum_replies.thread_id 
      AND status = 'approved'
      AND is_locked = false
      AND is_deleted = false
    )
  );

CREATE POLICY "Authors can update own replies" ON forum_replies
  FOR UPDATE USING (author_id = auth.uid()::text)
  WITH CHECK (author_id = auth.uid()::text);

CREATE POLICY "Admins can manage all replies" ON forum_replies
  FOR ALL USING (is_admin());

-- Coins & Spin policies
CREATE POLICY "Users can view own transactions" ON coin_transactions
  FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

CREATE POLICY "Admins can manage transactions" ON coin_transactions
  FOR ALL USING (is_admin());

CREATE POLICY "Public can view active prizes" ON spin_wheel_prizes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage prizes" ON spin_wheel_prizes
  FOR ALL USING (is_admin());

CREATE POLICY "Users can view own history" ON spin_wheel_history
  FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

CREATE POLICY "Users can view own tickets" ON spin_wheel_tickets
  FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

CREATE POLICY "Admins can manage tickets" ON spin_wheel_tickets
  FOR ALL USING (is_admin());

CREATE POLICY "Users can view own claims" ON daily_claims
  FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

CREATE POLICY "Admins can manage settings" ON spin_wheel_settings
  FOR ALL USING (is_admin());

-- ============================================
-- PART 7: DEFAULT DATA
-- ============================================

-- Insert forum categories
INSERT INTO forum_categories (id, name, description, icon, color, sort_order, is_active)
VALUES 
  ('announcements', 'Announcements', 'Official announcements and updates from the team', 'megaphone', '#EF4444', 1, true),
  ('general', 'General Discussion', 'Chat about anything FiveM related', 'message-circle', '#22C55E', 2, true),
  ('help', 'Help & Support', 'Get help with scripts, installation, and troubleshooting', 'help-circle', '#F59E0B', 3, true),
  ('requests', 'Script Requests', 'Request new scripts and features', 'code', '#3B82F6', 4, true),
  ('showcase', 'Showcase', 'Show off your servers and creations', 'star', '#EC4899', 5, true),
  ('marketplace', 'Marketplace', 'Buy, sell, and trade FiveM resources', 'shopping-bag', '#8B5CF6', 6, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Insert spin wheel prizes
INSERT INTO spin_wheel_prizes (name, type, value, probability, color, icon, sort_order)
VALUES
  ('Nothing', 'nothing', 0, 30.00, '#6B7280', 'x', 1),
  ('10 Coins', 'coins', 10, 25.00, '#3B82F6', 'coins', 2),
  ('25 Coins', 'coins', 25, 20.00, '#10B981', 'coins', 3),
  ('50 Coins', 'coins', 50, 15.00, '#F59E0B', 'coins', 4),
  ('100 Coins', 'coins', 100, 7.00, '#EF4444', 'coins', 5),
  ('Extra Spin', 'ticket', 1, 2.50, '#8B5CF6', 'ticket', 6),
  ('Jackpot 500', 'coins', 500, 0.50, '#EC4899', 'star', 7)
ON CONFLICT DO NOTHING;

-- Insert spin wheel settings
INSERT INTO spin_wheel_settings (key, value)
VALUES
  ('daily_coins_amount', '100'::jsonb),
  ('spin_cost_coins', '0'::jsonb),
  ('max_spins_per_day', '10'::jsonb),
  ('jackpot_enabled', 'true'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================
-- PART 8: GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON forum_categories TO anon, authenticated;
GRANT SELECT ON forum_threads TO anon, authenticated;
GRANT SELECT ON forum_replies TO anon, authenticated;
GRANT SELECT ON spin_wheel_prizes TO anon, authenticated;
GRANT INSERT, UPDATE ON forum_threads TO authenticated;
GRANT INSERT, UPDATE ON forum_replies TO authenticated;
GRANT INSERT ON coin_transactions TO authenticated;
GRANT INSERT ON spin_wheel_history TO authenticated;
GRANT INSERT, UPDATE ON spin_wheel_tickets TO authenticated;
GRANT INSERT ON daily_claims TO authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 'Database setup completed successfully! All features ready.' as status;
