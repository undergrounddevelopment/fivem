-- ============================================
-- MASTER MIGRATION SCRIPT - RUN THIS ONCE
-- ============================================
-- This script will:
-- 1. Enable RLS on all tables
-- 2. Fix function security
-- 3. Migrate legacy tickets
-- ============================================

-- STEP 1: Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkvertise_downloads ENABLE ROW LEVEL SECURITY;

-- STEP 2: Fix function security
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM users WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub' AND is_admin = true); EXCEPTION WHEN OTHERS THEN RETURN false; END; $$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION get_user_balance(p_user_id TEXT) RETURNS INTEGER AS $$ DECLARE balance INTEGER; BEGIN SELECT COALESCE(SUM(amount), 0) INTO balance FROM coin_transactions WHERE user_id = p_user_id; RETURN GREATEST(balance, 0); END; $$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION add_coins(p_user_id TEXT, p_amount INTEGER, p_type TEXT, p_description TEXT DEFAULT NULL, p_reference_id TEXT DEFAULT NULL) RETURNS JSONB AS $$ DECLARE new_balance INTEGER; transaction_id UUID; BEGIN IF p_amount = 0 THEN RETURN jsonb_build_object('success', false, 'error', 'Amount cannot be zero'); END IF; INSERT INTO coin_transactions (user_id, amount, type, description, reference_id) VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id) RETURNING id INTO transaction_id; new_balance := get_user_balance(p_user_id); UPDATE users SET coins = new_balance, updated_at = NOW() WHERE discord_id = p_user_id; RETURN jsonb_build_object('success', true, 'transaction_id', transaction_id, 'new_balance', new_balance); END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION can_claim_daily(p_user_id TEXT, p_claim_type TEXT DEFAULT 'coins') RETURNS BOOLEAN AS $$ BEGIN RETURN NOT EXISTS (SELECT 1 FROM daily_claims WHERE user_id = p_user_id AND claim_type = p_claim_type AND claim_date = CURRENT_DATE); END; $$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION claim_daily_reward(p_user_id TEXT, p_claim_type TEXT DEFAULT 'coins', p_amount INTEGER DEFAULT 100) RETURNS JSONB AS $$ DECLARE can_claim BOOLEAN; result JSONB; BEGIN can_claim := can_claim_daily(p_user_id, p_claim_type); IF NOT can_claim THEN RETURN jsonb_build_object('success', false, 'error', 'Already claimed today'); END IF; INSERT INTO daily_claims (user_id, claim_type) VALUES (p_user_id, p_claim_type); IF p_claim_type = 'coins' THEN result := add_coins(p_user_id, p_amount, 'daily', 'Daily coins reward'); ELSIF p_claim_type = 'spin' THEN INSERT INTO spin_wheel_tickets (user_id, ticket_type) VALUES (p_user_id, 'daily'); result := jsonb_build_object('success', true, 'message', 'Daily spin ticket claimed'); END IF; RETURN result; END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- STEP 3: Migrate legacy tickets (if any exist)
INSERT INTO spin_wheel_tickets (user_id, ticket_type, created_at)
SELECT 
  discord_id,
  'reward',
  NOW() - (interval '1 second' * series.n)
FROM users
CROSS JOIN LATERAL generate_series(1, GREATEST(spin_tickets, 0)) AS series(n)
WHERE spin_tickets > 0
ON CONFLICT DO NOTHING;

UPDATE users SET spin_tickets = 0 WHERE spin_tickets > 0;

-- VERIFICATION
SELECT 
  'MIGRATION COMPLETE!' as status,
  (SELECT COUNT(*) FROM spin_wheel_tickets) as total_tickets,
  (SELECT COUNT(*) FROM coin_transactions) as total_transactions,
  (SELECT COUNT(*) FROM daily_claims) as total_claims;
