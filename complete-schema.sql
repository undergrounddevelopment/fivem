-- FiveM Tools V7 - Complete Database Schema
-- Drop existing tables
DROP TABLE IF EXISTS forum_replies CASCADE;
DROP TABLE IF EXISTS forum_threads CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS downloads CASCADE;
DROP TABLE IF EXISTS coin_transactions CASCADE;
DROP TABLE IF EXISTS spin_wheel_history CASCADE;
DROP TABLE IF EXISTS spin_wheel_tickets CASCADE;
DROP TABLE IF EXISTS spin_wheel_prizes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE,
  username TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar TEXT,
  membership TEXT DEFAULT 'free',
  coins INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  spin_tickets INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  bio TEXT
);

-- Assets Table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  framework TEXT,
  version TEXT DEFAULT '1.0.0',
  coin_price INTEGER DEFAULT 0,
  thumbnail TEXT,
  download_link TEXT,
  file_size TEXT,
  downloads INTEGER DEFAULT 0,
  tags TEXT[],
  status TEXT DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  virus_scan_status TEXT DEFAULT 'pending',
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  features TEXT[],
  installation TEXT,
  changelog TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  youtube_link TEXT,
  github_link TEXT,
  docs_link TEXT,
  linkvertise_url TEXT,
  require_linkvertise BOOLEAN DEFAULT false,
  average_rating NUMERIC(3,2) DEFAULT 0
);

-- Forum Categories
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  thread_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Threads
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  replies_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  images TEXT[],
  last_reply_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reply_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Replies
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banners
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  position TEXT DEFAULT 'home',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spin Wheel Prizes
CREATE TABLE spin_wheel_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value INTEGER NOT NULL,
  probability NUMERIC(5,2) NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spin Wheel Tickets
CREATE TABLE spin_wheel_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ticket_type TEXT DEFAULT 'daily',
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spin Wheel History
CREATE TABLE spin_wheel_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prize_id UUID REFERENCES spin_wheel_prizes(id),
  prize_name TEXT NOT NULL,
  prize_type TEXT NOT NULL,
  prize_value INTEGER NOT NULL,
  was_forced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  coin_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coin Transactions
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_author ON assets(author_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_asset ON downloads(asset_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_coin_transactions_user ON coin_transactions(user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_wheel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Public Read)
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON assets FOR SELECT USING (true);
CREATE POLICY "Public read access" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Public read access" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON banners FOR SELECT USING (true);
CREATE POLICY "Public read access" ON spin_wheel_prizes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON testimonials FOR SELECT USING (true);

-- Service Role Full Access
CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON assets FOR ALL USING (true);
CREATE POLICY "Service role full access" ON forum_categories FOR ALL USING (true);
CREATE POLICY "Service role full access" ON forum_threads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON forum_replies FOR ALL USING (true);
CREATE POLICY "Service role full access" ON announcements FOR ALL USING (true);
CREATE POLICY "Service role full access" ON banners FOR ALL USING (true);
CREATE POLICY "Service role full access" ON spin_wheel_prizes FOR ALL USING (true);
CREATE POLICY "Service role full access" ON spin_wheel_tickets FOR ALL USING (true);
CREATE POLICY "Service role full access" ON spin_wheel_history FOR ALL USING (true);
CREATE POLICY "Service role full access" ON notifications FOR ALL USING (true);
CREATE POLICY "Service role full access" ON activities FOR ALL USING (true);
CREATE POLICY "Service role full access" ON downloads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON coin_transactions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON testimonials FOR ALL USING (true);
