-- Create settings table for admin coin settings
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Insert default coin settings
INSERT INTO settings (category, key, value) VALUES (
  'coins',
  'coin_settings',
  '{
    "dailyReward": 50,
    "dailyRewardEnabled": true,
    "downloadReward": 10,
    "commentReward": 15,
    "likeReward": 5,
    "threadReward": 25,
    "replyReward": 10,
    "maxDailyEarnings": 500,
    "premiumMultiplier": 2
  }'::jsonb
) ON CONFLICT (category, key) DO NOTHING;

-- Add last_daily_claim column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_claim TIMESTAMPTZ;

-- Verify
SELECT * FROM settings WHERE category = 'coins';
