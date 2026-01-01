-- =====================================================
-- FIVEM TOOLS V7 - READY TO IMPORT
-- Supabase PostgreSQL Database
-- =====================================================

-- CARA IMPORT KE SUPABASE BARU:
-- 1. Buka Supabase Dashboard baru
-- 2. Pergi ke SQL Editor
-- 3. Copy paste isi file ini
-- 4. Klik RUN
-- 5. Selesai!

-- =====================================================
-- CREATE TABLES
-- =====================================================

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

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    framework TEXT,
    version TEXT,
    coin_price INTEGER DEFAULT 0,
    thumbnail TEXT,
    download_link TEXT,
    file_size TEXT,
    downloads INTEGER DEFAULT 0,
    tags TEXT[],
    status TEXT DEFAULT 'active',
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    virus_scan_status TEXT DEFAULT 'pending',
    author_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    features TEXT,
    installation TEXT,
    changelog TEXT,
    rating INTEGER DEFAULT 5,
    rating_count INTEGER DEFAULT 0,
    youtube_link TEXT,
    github_link TEXT,
    docs_link TEXT,
    linkvertise_url TEXT,
    require_linkvertise BOOLEAN DEFAULT false,
    average_rating DECIMAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES forum_threads(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    coins INTEGER NOT NULL,
    probability DECIMAL(5,2) NOT NULL,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_wheel_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    tickets INTEGER DEFAULT 0,
    last_daily_claim TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spin_wheel_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    prize_id UUID REFERENCES spin_wheel_prizes(id),
    coins_won INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    asset_id UUID REFERENCES assets(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Admin User
INSERT INTO users (discord_id, username, email, membership, coins, is_admin) 
VALUES ('ADMIN_DISCORD_ID', 'Admin', 'admin@fivemtools.com', 'admin', 999999, true)
ON CONFLICT (discord_id) DO NOTHING;

-- Forum Categories
INSERT INTO forum_categories (name, description, icon, order_index) VALUES
('General Discussion', 'General topics about FiveM', '💬', 1),
('Script Help', 'Get help with your scripts', '🔧', 2),
('MLO Showcase', 'Share your MLO creations', '🏢', 3),
('Vehicle Releases', 'Share vehicle mods', '🚗', 4),
('Script Releases', 'Share your scripts', '📜', 5),
('Support', 'Technical support', '❓', 6);

-- Spin Wheel Prizes
INSERT INTO spin_wheel_prizes (name, coins, probability, color) VALUES
('Small Prize', 10, 40.00, '#3B82F6'),
('Medium Prize', 25, 30.00, '#10B981'),
('Large Prize', 50, 20.00, '#F59E0B'),
('Jackpot', 100, 8.00, '#EF4444'),
('Mega Jackpot', 500, 2.00, '#8B5CF6');

-- Announcements
INSERT INTO announcements (title, content, type) VALUES
('Welcome to FiveM Tools V7!', 'Explore our new features and resources.', 'info'),
('New Assets Added', 'Check out the latest MLOs and scripts!', 'success');

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_discord ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);

-- =====================================================
-- SELESAI!
-- =====================================================
-- Database siap digunakan
-- Total: 15 tables created
-- Sample data: Admin, Categories, Prizes, Announcements
