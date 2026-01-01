-- ============================================
-- XP AND BADGE SYSTEM SCHEMA WITH AUTO-RUN
-- ============================================

-- Add XP fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_badge TEXT DEFAULT 'beginner';

-- XP Transactions table (track all XP gains/losses)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges definition table
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

-- User Badges junction table (tracks badge unlocks)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- Activity XP rewards configuration
CREATE TABLE IF NOT EXISTS xp_activities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  xp_amount INTEGER NOT NULL,
  cooldown_minutes INTEGER DEFAULT 0,
  max_per_day INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert badge tiers with custom PNG assets
INSERT INTO badges (id, name, description, image_url, min_xp, max_xp, color, tier) VALUES
  ('beginner', 'Beginner Bolt', 'Start your journey - New member rank', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/badge1-ahgQp6RhRXE3Yv12muS4eqNsZruDjr.png', 0, 999, '#84CC16', 1),
  ('intermediate', 'Intermediate Bolt', 'Rising star - Active community member', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/badge4-vdqfUlKB6C6TIR1heSgY0Oy3OIsUsL.png', 1000, 4999, '#3B82F6', 2),
  ('advanced', 'Advanced Bolt', 'Skilled contributor - Experienced member', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/badge2-PJRoorKzcfsEjQ0YSMM9CIKSabSBN6.png', 5000, 14999, '#9333EA', 3),
  ('expert', 'Expert Bolt', 'Elite status - Top community member', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/badge3-uSclnyXGLUshZgBEcZ7DISXPKsWDEh.png', 15000, 49999, '#DC2626', 4),
  ('legend', 'Legend Bolt', 'Legendary - Ultimate rank achieved', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/badge5-2k4q1Z4hKWPGPwG9mmQYWKl3sT05qg.png', 50000, NULL, '#F59E0B', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  min_xp = EXCLUDED.min_xp,
  max_xp = EXCLUDED.max_xp,
  color = EXCLUDED.color,
  tier = EXCLUDED.tier;

-- Insert XP activity rewards
INSERT INTO xp_activities (id, name, description, xp_amount, cooldown_minutes, max_per_day) VALUES
  ('daily_login', 'Daily Login', 'Login to the platform', 10, 1440, 1),
  ('create_thread', 'Create Thread', 'Post a new forum thread', 25, 0, NULL),
  ('reply_thread', 'Reply to Thread', 'Reply to a forum discussion', 10, 0, NULL),
  ('upload_asset', 'Upload Asset', 'Upload a new asset', 100, 0, NULL),
  ('download_asset', 'Download Asset', 'Download an asset', 5, 0, 50),
  ('receive_like', 'Receive Like', 'Get a like on your content', 5, 0, NULL),
  ('give_like', 'Give Like', 'Like someone\'s content', 2, 0, 100),
  ('claim_daily_coins', 'Daily Coins Claim', 'Claim daily coin reward', 15, 1440, 1),
  ('spin_wheel', 'Spin Wheel', 'Use spin wheel', 10, 0, 10),
  ('complete_profile', 'Complete Profile', 'Fill out profile information', 50, 0, 1),
  ('first_download', 'First Download', 'Download your first asset', 20, 0, 1),
  ('first_upload', 'First Upload', 'Upload your first asset', 150, 0, 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  xp_amount = EXCLUDED.xp_amount,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  max_per_day = EXCLUDED.max_per_day;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created ON xp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(xp_amount / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get current badge based on XP
CREATE OR REPLACE FUNCTION get_current_badge(xp_amount INTEGER)
RETURNS TEXT AS $$
DECLARE
  badge_id TEXT;
BEGIN
  SELECT id INTO badge_id
  FROM badges
  WHERE xp_amount >= min_xp 
    AND (max_xp IS NULL OR xp_amount <= max_xp)
  ORDER BY tier DESC
  LIMIT 1;
  
  RETURN COALESCE(badge_id, 'beginner');
END;
$$ LANGUAGE plpgsql;

-- Trigger to update level and badge when XP changes
CREATE OR REPLACE FUNCTION update_user_level_and_badge()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
  new_badge TEXT;
  old_badge TEXT;
BEGIN
  new_level := calculate_level(NEW.xp);
  new_badge := get_current_badge(NEW.xp);
  old_badge := OLD.current_badge;
  
  NEW.level := new_level;
  NEW.current_badge := new_badge;
  
  IF new_badge != old_badge THEN
    INSERT INTO user_badges (user_id, badge_id, is_equipped)
    VALUES (NEW.discord_id, new_badge, TRUE)
    ON CONFLICT (user_id, badge_id) DO UPDATE SET is_equipped = TRUE;
    
    UPDATE user_badges 
    SET is_equipped = FALSE 
    WHERE user_id = NEW.discord_id AND badge_id = old_badge;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_level ON users;
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE OF xp ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level_and_badge();

-- Function to award XP
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id TEXT,
  p_activity_id TEXT,
  p_reference_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_xp_amount INTEGER;
  v_cooldown_minutes INTEGER;
  v_max_per_day INTEGER;
  v_activity_name TEXT;
  v_can_claim BOOLEAN := TRUE;
  v_daily_count INTEGER;
  v_last_claim TIMESTAMPTZ;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_old_badge TEXT;
  v_new_badge TEXT;
  v_result JSONB;
BEGIN
  SELECT xp_amount, cooldown_minutes, max_per_day, name
  INTO v_xp_amount, v_cooldown_minutes, v_max_per_day, v_activity_name
  FROM xp_activities
  WHERE id = p_activity_id AND is_active = TRUE;
  
  IF v_xp_amount IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Invalid activity');
  END IF;
  
  IF v_cooldown_minutes > 0 THEN
    SELECT created_at INTO v_last_claim
    FROM xp_transactions
    WHERE user_id = p_user_id 
      AND activity_type = p_activity_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_last_claim IS NOT NULL AND 
       v_last_claim > NOW() - INTERVAL '1 minute' * v_cooldown_minutes THEN
      RETURN jsonb_build_object(
        'success', FALSE, 
        'error', 'Cooldown active',
        'nextClaimAt', v_last_claim + INTERVAL '1 minute' * v_cooldown_minutes
      );
    END IF;
  END IF;
  
  IF v_max_per_day IS NOT NULL THEN
    SELECT COUNT(*) INTO v_daily_count
    FROM xp_transactions
    WHERE user_id = p_user_id 
      AND activity_type = p_activity_id
      AND created_at > CURRENT_DATE;
    
    IF v_daily_count >= v_max_per_day THEN
      RETURN jsonb_build_object('success', FALSE, 'error', 'Daily limit reached');
    END IF;
  END IF;
  
  SELECT xp, level, current_badge
  INTO v_new_xp, v_old_level, v_old_badge
  FROM users
  WHERE discord_id = p_user_id;
  
  v_new_xp := v_new_xp + v_xp_amount;
  
  UPDATE users 
  SET xp = v_new_xp, updated_at = NOW()
  WHERE discord_id = p_user_id
  RETURNING level, current_badge INTO v_new_level, v_new_badge;
  
  INSERT INTO xp_transactions (user_id, amount, activity_type, description, reference_id)
  VALUES (p_user_id, v_xp_amount, p_activity_id, v_activity_name, p_reference_id);
  
  v_result := jsonb_build_object(
    'success', TRUE,
    'xpAwarded', v_xp_amount,
    'totalXp', v_new_xp,
    'oldLevel', v_old_level,
    'newLevel', v_new_level,
    'leveledUp', v_new_level > v_old_level,
    'oldBadge', v_old_badge,
    'newBadge', v_new_badge,
    'badgeUnlocked', v_new_badge != v_old_badge
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
