-- FiveM Tools V7 - Full Database Schema
-- Generated: 2025-12-31T14:47:09.855Z

-- Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id UUID,
  username TEXT,
  email TEXT,
  avatar TEXT,
  membership TEXT,
  coins INTEGER,
  reputation INTEGER,
  downloads INTEGER,
  points INTEGER,
  is_banned BOOLEAN,
  ban_reason TEXT,
  is_admin BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TEXT,
  spin_tickets INTEGER,
  role TEXT,
  is_active BOOLEAN,
  xp INTEGER,
  level INTEGER,
  bio TEXT
);

-- Table: assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  category TEXT,
  framework TEXT,
  version TEXT,
  coin_price INTEGER,
  thumbnail TEXT,
  download_link TEXT,
  file_size TEXT,
  downloads INTEGER,
  tags TEXT,
  status TEXT,
  is_verified BOOLEAN,
  is_featured BOOLEAN,
  virus_scan_status TEXT,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  features TEXT,
  installation TEXT,
  changelog TEXT,
  rating INTEGER,
  rating_count INTEGER,
  youtube_link TEXT,
  github_link TEXT,
  docs_link TEXT,
  linkvertise_url TEXT,
  require_linkvertise BOOLEAN,
  average_rating INTEGER
);

-- Table: forum_categories
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER,
  is_active BOOLEAN,
  thread_count INTEGER,
  post_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: forum_threads
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  category_id UUID,
  author_id UUID,
  status TEXT,
  rejection_reason TEXT,
  is_pinned BOOLEAN,
  is_locked BOOLEAN,
  is_deleted BOOLEAN,
  replies_count INTEGER,
  likes INTEGER,
  views INTEGER,
  images TEXT,
  last_reply_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reply_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  message TEXT,
  type TEXT,
  is_active BOOLEAN,
  is_dismissible BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: banners
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT,
  link TEXT,
  position TEXT,
  is_active BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: spin_wheel_prizes
CREATE TABLE spin_wheel_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  type TEXT,
  value INTEGER,
  probability INTEGER,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: spin_wheel_tickets
CREATE TABLE spin_wheel_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ticket_type TEXT,
  is_used BOOLEAN,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: spin_wheel_history
CREATE TABLE spin_wheel_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  prize_id UUID,
  prize_name TEXT,
  prize_type TEXT,
  prize_value INTEGER,
  was_forced BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  link TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type TEXT,
  action TEXT,
  target_id UUID,
  metadata TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: downloads
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  asset_id UUID,
  coin_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: coin_transactions
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  amount INTEGER,
  type TEXT,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Common Indexes
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX idx_downloads_asset ON downloads(asset_id);
CREATE INDEX idx_downloads_user ON downloads(user_id);
