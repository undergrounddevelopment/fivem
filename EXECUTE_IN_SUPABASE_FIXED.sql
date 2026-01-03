-- FiveM Tools V7 - Complete Database Schema (FIXED)
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discord_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar TEXT,
    membership VARCHAR(50) DEFAULT 'free' CHECK (membership IN ('free', 'vip', 'admin')),
    coins INTEGER DEFAULT 100,
    is_admin BOOLEAN DEFAULT FALSE,
    banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    bio TEXT,
    role VARCHAR(100),
    reputation INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    total_uploads INTEGER DEFAULT 0,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN ('scripts', 'mlo', 'vehicles', 'clothing')),
    framework VARCHAR(100) NOT NULL CHECK (framework IN ('standalone', 'esx', 'qbcore', 'qbox')),
    version VARCHAR(50) DEFAULT '1.0.0',
    coin_price INTEGER DEFAULT 0,
    download_url TEXT,
    thumbnail_url TEXT,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    file_size BIGINT,
    file_hash VARCHAR(255),
    virus_scan_status VARCHAR(50) DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'threat', 'error')),
    virus_scan_hash VARCHAR(255),
    virus_scan_date TIMESTAMP WITH TIME ZONE,
    report_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    requirements TEXT[],
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Forum Categories
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7) DEFAULT '#3b82f6',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    thread_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    moderators UUID[] DEFAULT '{}',
    permissions JSONB DEFAULT '{"can_post": ["free", "vip", "admin"], "can_reply": ["free", "vip", "admin"], "can_view": ["free", "vip", "admin"]}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Threads
CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    replies INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    report_count INTEGER DEFAULT 0,
    moderation_flags TEXT[] DEFAULT '{}',
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Forum Replies
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    report_count INTEGER DEFAULT 0,
    parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    download_method VARCHAR(50) DEFAULT 'direct',
    coins_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coin Transactions
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('earn', 'spend', 'admin_add', 'admin_remove')),
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spin Wheel Prizes
CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('coins', 'asset', 'membership', 'custom')),
    value INTEGER NOT NULL,
    probability DECIMAL(5,4) NOT NULL CHECK (probability >= 0 AND probability <= 1),
    color VARCHAR(7) DEFAULT '#3b82f6',
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spin Wheel Tickets
CREATE TABLE IF NOT EXISTS spin_wheel_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tickets INTEGER DEFAULT 0,
    last_earned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Spin Wheel History
CREATE TABLE IF NOT EXISTS spin_wheel_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES spin_wheel_prizes(id) ON DELETE SET NULL,
    prize_name VARCHAR(255) NOT NULL,
    prize_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    show_until TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position VARCHAR(50) DEFAULT 'hero' CHECK (position IN ('hero', 'sidebar', 'footer')),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    show_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    show_until TIMESTAMP WITH TIME ZONE,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Assets indexes
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_framework ON assets(framework);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_creator_id ON assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);
CREATE INDEX IF NOT EXISTS idx_assets_downloads ON assets(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_assets_rating ON assets(rating DESC);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATES
-- =============================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_categories_updated_at BEFORE UPDATE ON forum_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spin_wheel_tickets_updated_at BEFORE UPDATE ON spin_wheel_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default forum categories
INSERT INTO forum_categories (id, name, description, icon, color, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'General Discussion', 'General discussions about FiveM', 'chat', '#3b82f6', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Script Releases', 'Share your FiveM scripts', 'code', '#10b981', 2),
('550e8400-e29b-41d4-a716-446655440003', 'MLO Releases', 'Share your MLO creations', 'building', '#f59e0b', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Vehicle Releases', 'Share vehicle mods', 'car', '#ef4444', 4),
('550e8400-e29b-41d4-a716-446655440005', 'Support & Help', 'Get help with FiveM issues', 'help-circle', '#8b5cf6', 5),
('550e8400-e29b-41d4-a716-446655440006', 'Showcase', 'Show off your server', 'image', '#ec4899', 6)
ON CONFLICT (id) DO NOTHING;

-- Insert default spin wheel prizes
INSERT INTO spin_wheel_prizes (name, type, value, probability, color, icon) VALUES
('50 Coins', 'coins', 50, 0.3, '#10b981', 'coins'),
('100 Coins', 'coins', 100, 0.25, '#3b82f6', 'coins'),
('200 Coins', 'coins', 200, 0.2, '#f59e0b', 'coins'),
('500 Coins', 'coins', 500, 0.15, '#ef4444', 'coins'),
('1000 Coins', 'coins', 1000, 0.08, '#8b5cf6', 'coins'),
('VIP 1 Month', 'membership', 30, 0.02, '#ec4899', 'crown')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'FiveM Tools V7 Database Setup Complete! 🎉' as status;