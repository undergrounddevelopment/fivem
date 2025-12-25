-- ============================================
-- ADMIN PANEL FEATURES - COMPLETE SETUP
-- Banners, Announcements, Assets, Users, etc.
-- ============================================

-- ============================================
-- PART 1: ADMIN TABLES
-- ============================================

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  position TEXT DEFAULT 'top' CHECK (position IN ('top', 'sidebar', 'footer', 'hero')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'promo')),
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  link TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('scripts', 'mlo', 'vehicles', 'clothing', 'maps', 'tools')),
  framework TEXT CHECK (framework IN ('qbcore', 'esx', 'qbox', 'standalone')),
  version TEXT,
  coin_price INTEGER DEFAULT 0 CHECK (coin_price >= 0),
  thumbnail TEXT,
  images TEXT[] DEFAULT '{}',
  download_link TEXT,
  file_size TEXT,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'rejected')),
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  author_id TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset reviews table
CREATE TABLE IF NOT EXISTS asset_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, user_id)
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  reported_type TEXT NOT NULL CHECK (reported_type IN ('user', 'asset', 'thread', 'reply', 'review')),
  reported_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_type TEXT DEFAULT 'general',
  checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 2: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_framework ON assets(framework);
CREATE INDEX IF NOT EXISTS idx_assets_author ON assets(author_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_featured ON assets(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_asset_reviews_asset ON asset_reviews(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_reviews_user ON asset_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user ON file_uploads(user_id);

-- ============================================
-- PART 3: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 4: RLS POLICIES
-- ============================================

-- Banners policies
CREATE POLICY "Public can view active banners" ON banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (is_admin());

-- Announcements policies
CREATE POLICY "Public can view active announcements" ON announcements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (is_admin());

-- Assets policies
CREATE POLICY "Public can view active assets" ON assets
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authors can view own assets" ON assets
  FOR SELECT USING (author_id = auth.uid()::text OR status = 'active');

CREATE POLICY "Authors can create assets" ON assets
  FOR INSERT WITH CHECK (author_id = auth.uid()::text);

CREATE POLICY "Authors can update own assets" ON assets
  FOR UPDATE USING (author_id = auth.uid()::text);

CREATE POLICY "Admins can manage all assets" ON assets
  FOR ALL USING (is_admin());

-- Asset reviews policies
CREATE POLICY "Public can view reviews" ON asset_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON asset_reviews
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own reviews" ON asset_reviews
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage reviews" ON asset_reviews
  FOR ALL USING (is_admin());

-- Testimonials policies
CREATE POLICY "Public can view active testimonials" ON testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL USING (is_admin());

-- Activities policies
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid()::text OR 
    receiver_id = auth.uid()::text OR 
    is_admin()
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (reporter_id = auth.uid()::text OR is_admin());

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid()::text);

CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (is_admin());

-- Site settings policies
CREATE POLICY "Public can view settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON site_settings
  FOR ALL USING (is_admin());

-- File uploads policies
CREATE POLICY "Users can view own uploads" ON file_uploads
  FOR SELECT USING (user_id = auth.uid()::text OR is_admin());

CREATE POLICY "Users can upload files" ON file_uploads
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- ============================================
-- PART 5: FUNCTIONS
-- ============================================

-- Function to increment asset downloads
CREATE OR REPLACE FUNCTION increment_asset_downloads(asset_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE assets 
  SET downloads = downloads + 1
  WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment asset views
CREATE OR REPLACE FUNCTION increment_asset_views(asset_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE assets 
  SET views = views + 1
  WHERE id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update asset rating
CREATE OR REPLACE FUNCTION update_asset_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assets
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM asset_reviews
    WHERE asset_id = NEW.asset_id
  ),
  review_count = (
    SELECT COUNT(*)
    FROM asset_reviews
    WHERE asset_id = NEW.asset_id
  )
  WHERE id = NEW.asset_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_asset_rating_trigger ON asset_reviews;
CREATE TRIGGER update_asset_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON asset_reviews
FOR EACH ROW
EXECUTE FUNCTION update_asset_rating();

-- ============================================
-- PART 6: DEFAULT DATA
-- ============================================

-- Insert default site settings
INSERT INTO site_settings (key, value, category)
VALUES
  ('site_name', '"FiveM Tools V7"'::jsonb, 'general'),
  ('site_description', '"Best FiveM Resource Hub"'::jsonb, 'general'),
  ('maintenance_mode', 'false'::jsonb, 'general'),
  ('registration_enabled', 'true'::jsonb, 'general'),
  ('daily_coins_amount', '100'::jsonb, 'coins'),
  ('asset_upload_enabled', 'true'::jsonb, 'assets'),
  ('max_file_size_mb', '500'::jsonb, 'uploads')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert sample banners
INSERT INTO banners (title, image_url, link, position, is_active, sort_order)
VALUES
  ('Welcome Banner', 'https://r2.fivemanage.com/IKG5gF4pHPjLHEhuHxEh0/Untitleddesign-26.png', '/', 'hero', true, 1),
  ('Discord Community', 'https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/ts(1).mp4', 'https://discord.gg/tZXg4GVRM5', 'top', true, 2)
ON CONFLICT DO NOTHING;

-- Insert sample announcements
INSERT INTO announcements (title, message, type, is_active, sort_order)
VALUES
  ('Welcome!', 'Welcome to FiveM Tools V7 - Your #1 FiveM Resource Hub!', 'success', true, 1),
  ('New Features', 'Check out our new Spin Wheel and Daily Coins system!', 'info', true, 2)
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 7: GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON banners TO anon, authenticated;
GRANT SELECT ON announcements TO anon, authenticated;
GRANT SELECT ON assets TO anon, authenticated;
GRANT SELECT ON asset_reviews TO anon, authenticated;
GRANT SELECT ON testimonials TO anon, authenticated;
GRANT SELECT ON site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON assets TO authenticated;
GRANT INSERT, UPDATE ON asset_reviews TO authenticated;
GRANT INSERT ON activities TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT ON messages TO authenticated;
GRANT SELECT, INSERT ON reports TO authenticated;
GRANT INSERT ON file_uploads TO authenticated;

-- Done
SELECT 'Admin panel features setup completed successfully' as status;
