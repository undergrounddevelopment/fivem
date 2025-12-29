-- ============================================
-- SIMPLE DATABASE SETUP - GUARANTEED TO WORK
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Disable RLS on all tables
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

-- Step 2: Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  email TEXT,
  coins INTEGER DEFAULT 0,
  spin_tickets INTEGER DEFAULT 0,
  membership TEXT DEFAULT 'free',
  is_admin BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_wheel_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  ticket_type TEXT DEFAULT 'daily',
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_discord ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_spin_tickets_user ON spin_wheel_tickets(user_id);

-- Step 4: Create functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND is_admin = true
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

SELECT 'Database setup complete!' as status;
