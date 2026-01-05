-- =====================================================
-- FIVEM TOOLS V7 - FULL DATABASE EXPORT
-- Generated: 2025-01-01
-- Database: PostgreSQL (Supabase)
-- Password: [REDACTED]
-- =====================================================

-- Connection String:
-- [REDACTED]

-- =====================================================
-- TABLE STRUCTURES
-- =====================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    membership TEXT DEFAULT 'free',
    coins INTEGER DEFAULT 100,
    reputation INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ,
    spin_tickets INTEGER DEFAULT 0,
    role TEXT DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    bio TEXT
);

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    type TEXT,
    image_url TEXT,
    download_url TEXT,
    linkvertise_url TEXT,
    user_id UUID REFERENCES users(id),
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    price INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Categories Table
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Threads Table
CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES forum_categories(id),
    user_id UUID REFERENCES users(id),
    views INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Replies Table
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES forum_threads(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spin Wheel Prizes Table
CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    coins INTEGER NOT NULL,
    probability DECIMAL(5,2) NOT NULL,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spin Wheel Tickets Table
CREATE TABLE IF NOT EXISTS spin_wheel_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    tickets INTEGER DEFAULT 0,
    last_daily_claim TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spin Wheel History Table
CREATE TABLE IF NOT EXISTS spin_wheel_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    prize_id UUID REFERENCES spin_wheel_prizes(id),
    coins_won INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Downloads Table
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    asset_id UUID REFERENCES assets(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coin Transactions Table
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_asset ON downloads(asset_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
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

-- Public read policies
CREATE POLICY "Public users read" ON users FOR SELECT USING (true);
CREATE POLICY "Public assets read" ON assets FOR SELECT USING (is_approved = true);
CREATE POLICY "Public forum read" ON forum_categories FOR SELECT USING (true);
CREATE POLICY "Public threads read" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Public replies read" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Public announcements read" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Public banners read" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public prizes read" ON spin_wheel_prizes FOR SELECT USING (is_active = true);
CREATE POLICY "Public testimonials read" ON testimonials FOR SELECT USING (is_approved = true);

-- =====================================================
-- SAMPLE DATA (From your database)
-- =====================================================

-- NOTE: Full data export available in complete_data_dump.sql
-- This includes 300+ users and all related data

-- Admin User
INSERT INTO users (id, discord_id, username, email, membership, coins, is_admin, created_at)
VALUES (
    'b8174ad5-693e-4cd7-865a-a844594dcbcd',
    'ADMIN_DISCORD_ID',
    'Admin',
    'admin@fivemtools.com',
    'admin',
    999999,
    true,
    NOW()
) ON CONFLICT (discord_id) DO NOTHING;

-- Sample Forum Categories
INSERT INTO forum_categories (name, description, icon, order_index) VALUES
('General Discussion', 'General topics about FiveM', '💬', 1),
('Script Help', 'Get help with your scripts', '🔧', 2),
('MLO Showcase', 'Share your MLO creations', '🏢', 3),
('Vehicle Releases', 'Share vehicle mods', '🚗', 4),
('Script Releases', 'Share your scripts', '📜', 5),
('Support', 'Technical support', '❓', 6)
ON CONFLICT DO NOTHING;

-- Sample Spin Wheel Prizes
INSERT INTO spin_wheel_prizes (name, coins, probability, color, is_active) VALUES
('Small Prize', 10, 40.00, '#3B82F6', true),
('Medium Prize', 25, 30.00, '#10B981', true),
('Large Prize', 50, 20.00, '#F59E0B', true),
('Jackpot', 100, 8.00, '#EF4444', true),
('Mega Jackpot', 500, 2.00, '#8B5CF6', true)
ON CONFLICT DO NOTHING;

-- Sample Announcements
INSERT INTO announcements (title, content, type, is_active) VALUES
('Welcome to FiveM Tools V7!', 'Explore our new features and resources.', 'info', true),
('New Assets Added', 'Check out the latest MLOs and scripts!', 'success', true),
('Maintenance Notice', 'Scheduled maintenance on weekends.', 'warning', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STATISTICS & SUMMARY
-- =====================================================

-- Total Users: 300+
-- Total Assets: 37
-- Forum Categories: 6
-- Spin Wheel Prizes: 5
-- Testimonials: 14

-- =====================================================
-- BACKUP & RESTORE INSTRUCTIONS
-- =====================================================

-- To backup:
-- pg_dump -h aws-1-us-east-1.pooler.supabase.com -p 6543 -U postgres.linnqtixdfjwbrixitrb -d postgres > backup.sql

-- To restore:
-- psql -h aws-1-us-east-1.pooler.supabase.com -p 6543 -U postgres.linnqtixdfjwbrixitrb -d postgres < backup.sql

-- =====================================================
-- ENVIRONMENT VARIABLES NEEDED
-- =====================================================

-- NEXT_PUBLIC_SUPABASE_URL=https://linnqtixdfjwbrixitrb.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
-- SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
-- DATABASE_URL=postgresql://postgres.linnqtixdfjwbrixitrb:cba3nFp4y4pEemqa@aws-1-us-east-1.pooler.supabase.com:6543/postgres
-- DIRECT_URL=postgresql://postgres.linnqtixdfjwbrixitrb:cba3nFp4y4pEemqa@aws-1-us-east-1.pooler.supabase.com:5432/postgres
-- DISCORD_CLIENT_ID=1445650115447754933
-- DISCORD_CLIENT_SECRET=[Your Secret]
-- NEXTAUTH_SECRET=[Your Secret]

-- =====================================================
-- END OF EXPORT
-- =====================================================
