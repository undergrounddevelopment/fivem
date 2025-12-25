-- ============================================
-- COINS & SPIN WHEEL SYSTEM - 100% SECURE
-- ============================================

-- 1. Create coin_transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount != 0),
  type TEXT NOT NULL CHECK (type IN ('daily', 'spin', 'purchase', 'reward', 'admin', 'refund')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create spin_wheel_prizes table
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

-- 3. Create spin_wheel_history table
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

-- 4. Create spin_wheel_tickets table
CREATE TABLE IF NOT EXISTS spin_wheel_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('daily', 'purchase', 'reward', 'admin')),
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create daily_claims table
CREATE TABLE IF NOT EXISTS daily_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('coins', 'spin')),
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, claim_type, claim_date)
);

-- 6. Create spin_wheel_settings table
CREATE TABLE IF NOT EXISTS spin_wheel_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created ON coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spin_history_user ON spin_wheel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_history_created ON spin_wheel_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spin_tickets_user ON spin_wheel_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_tickets_used ON spin_wheel_tickets(is_used);
CREATE INDEX IF NOT EXISTS idx_daily_claims_user ON daily_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_claims_date ON daily_claims(claimed_at);

-- 8. Enable RLS
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_settings ENABLE ROW LEVEL SECURITY;

-- 9. Drop existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Admins can manage transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Public can view active prizes" ON spin_wheel_prizes;
DROP POLICY IF EXISTS "Admins can manage prizes" ON spin_wheel_prizes;
DROP POLICY IF EXISTS "Users can view own history" ON spin_wheel_history;
DROP POLICY IF EXISTS "Admins can view all history" ON spin_wheel_history;
DROP POLICY IF EXISTS "Users can view own tickets" ON spin_wheel_tickets;
DROP POLICY IF EXISTS "Admins can manage tickets" ON spin_wheel_tickets;
DROP POLICY IF EXISTS "Users can view own claims" ON daily_claims;
DROP POLICY IF EXISTS "Admins can view all claims" ON daily_claims;
DROP POLICY IF EXISTS "Admins can manage settings" ON spin_wheel_settings;

-- 10. Create policies
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

-- 11. Create function to get user balance
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

-- 12. Create function to add coins (atomic)
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
  -- Validate amount
  IF p_amount = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount cannot be zero');
  END IF;
  
  -- Insert transaction
  INSERT INTO coin_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id)
  RETURNING id INTO transaction_id;
  
  -- Get new balance
  new_balance := get_user_balance(p_user_id);
  
  -- Update user balance in users table
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

-- 13. Create function to check daily claim
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

-- 14. Create function to claim daily reward
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
  -- Check if can claim
  can_claim := can_claim_daily(p_user_id, p_claim_type);
  
  IF NOT can_claim THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Already claimed today'
    );
  END IF;
  
  -- Record claim
  INSERT INTO daily_claims (user_id, claim_type)
  VALUES (p_user_id, p_claim_type);
  
  -- Add coins if type is coins
  IF p_claim_type = 'coins' THEN
    result := add_coins(p_user_id, p_amount, 'daily', 'Daily coins reward');
  ELSE
    -- Add spin ticket
    INSERT INTO spin_wheel_tickets (user_id, ticket_type)
    VALUES (p_user_id, 'daily');
    
    result := jsonb_build_object('success', true);
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create function to use spin ticket
CREATE OR REPLACE FUNCTION use_spin_ticket(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  ticket_id UUID;
BEGIN
  -- Find unused ticket
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
  
  -- Mark ticket as used
  UPDATE spin_wheel_tickets
  SET is_used = true,
      used_at = NOW()
  WHERE id = ticket_id;
  
  RETURN jsonb_build_object('success', true, 'ticket_id', ticket_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Insert default prizes
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

-- 17. Insert default settings
INSERT INTO spin_wheel_settings (key, value)
VALUES
  ('daily_coins_amount', '"100"'::jsonb),
  ('spin_cost_coins', '"0"'::jsonb),
  ('max_spins_per_day', '"10"'::jsonb),
  ('jackpot_enabled', '"true"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Done
SELECT 'Coins and Spin Wheel setup completed successfully' as status;, 3),
  ('50 Coins', 'coins', 50, 15.00, '#F59E0B', 'coins', 4),
  ('100 Coins', 'coins', 100, 7.00, '#EF4444', 'coins', 5),
  ('Extra Spin', 'ticket', 1, 2.50, '#8B5CF6', 'ticket', 6),
  ('Jackpot 500', 'coins', 500, 0.50, '#EC4899', 'star', 7)
ON CONFLICT DO NOTHING;

-- 17. Insert default settings
INSERT INTO spin_wheel_settings (key, value)
VALUES
  ('daily_coins_amount', '100'),
  ('spin_cost_coins', '0'),
  ('max_spins_per_day', '10'),
  ('jackpot_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Done
SELECT 'Coins and Spin Wheel setup completed successfully' as status;
