-- Add missing columns to users table for daily coins feature
-- Run this in Supabase SQL Editor

-- Add last_daily_claim column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_claim TIMESTAMPTZ;

-- Add other potentially missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_badge TEXT DEFAULT 'newcomer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
