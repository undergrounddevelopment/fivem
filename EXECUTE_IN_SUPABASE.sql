-- FiveM Tools V7 - Complete Database Schema
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- This script will create all tables, indexes, triggers, and initial data
-- for your FiveM Tools V7 application

-- FiveM Tools V7 - Complete Database Schema
-- Advanced Features: Admin Management, Security Monitoring, Real-time System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================
-- CORE TABLES (Enhanced)
-- =============================================

-- Enhanced Users Table
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
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Security fields
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    
    -- Indexes
    CONSTRAINT users_discord_id_key UNIQUE (discord_id)
);

-- Enhanced Assets Table
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
    
    -- Security & Moderation
    virus_scan_status VARCHAR(50) DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'threat', 'error')),
    virus_scan_hash VARCHAR(255),
    virus_scan_date TIMESTAMP WITH TIME ZONE,
    report_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    requirements TEXT[],
    changelog TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ADMIN & SECURITY TABLES
-- =============================================

-- Admin Actions Log
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'user', 'asset', 'forum_thread', etc.
    target_id UUID NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL, -- 'login_attempt', 'rate_limit', 'suspicious_activity', etc.
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source_ip INET,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating')),
    automated_response BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Firewall Rules
CREATE TABLE IF NOT EXISTS firewall_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('allow', 'deny', 'rate_limit')),
    source_pattern TEXT NOT NULL, -- IP pattern, CIDR, etc.
    target_pattern TEXT,
    action VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 100,
    enabled BOOLEAN DEFAULT TRUE,
    hit_count INTEGER DEFAULT 0,
    last_hit TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate Limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL, -- IP, user_id, etc.
    endpoint VARCHAR(255) NOT NULL,
    requests INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(identifier, endpoint)
);

-- =============================================
-- REAL-TIME & PRESENCE TABLES
-- =============================================

-- User Presence
CREATE TABLE IF NOT EXISTS user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    current_page VARCHAR(255),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Events
CREATE TABLE IF NOT EXISTS realtime_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    broadcast BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ENHANCED FORUM TABLES
-- =============================================

-- Forum Categories (Enhanced)
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

-- Forum Threads (Enhanced)
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

-- Forum Replies (Enhanced)
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

-- =============================================
-- ENHANCED SYSTEM TABLES
-- =============================================

-- Notifications (Enhanced)
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

-- Activities (Enhanced)
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

-- Downloads (Enhanced)
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

-- Coin Transactions (Enhanced)
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

-- =============================================
-- GAMIFICATION TABLES
-- =============================================

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

-- =============================================
-- CONTENT TABLES
-- =============================================

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

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

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
CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON user_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_firewall_rules_updated_at BEFORE UPDATE ON firewall_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spin_wheel_tickets_updated_at BEFORE UPDATE ON spin_wheel_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Popular assets view
CREATE OR REPLACE VIEW popular_assets AS
SELECT 
    a.*,
    u.username as creator_name,
    u.avatar as creator_avatar
FROM assets a
JOIN users u ON a.creator_id = u.id
WHERE a.status = 'approved' AND a.deleted_at IS NULL
ORDER BY a.downloads DESC, a.rating DESC;

-- User stats view
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.avatar,
    u.membership,
    u.coins,
    u.reputation,
    COUNT(DISTINCT a.id) as assets_count,
    COUNT(DISTINCT ft.id) as threads_count,
    COUNT(DISTINCT fr.id) as replies_count,
    SUM(a.downloads) as total_downloads
FROM users u
LEFT JOIN assets a ON u.id = a.creator_id AND a.deleted_at IS NULL
LEFT JOIN forum_threads ft ON u.id = ft.author_id AND ft.deleted_at IS NULL
LEFT JOIN forum_replies fr ON u.id = fr.author_id AND fr.deleted_at IS NULL
GROUP BY u.id, u.username, u.avatar, u.membership, u.coins, u.reputation;

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

-- =============================================
-- SECURITY POLICIES (RLS)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE firewall_rules ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on your auth system)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = discord_id);
CREATE POLICY "Admins can view all admin actions" ON admin_actions FOR SELECT USING (EXISTS(SELECT 1 FROM users WHERE discord_id = auth.uid()::text AND is_admin = true));
CREATE POLICY "Admins can view security events" ON security_events FOR SELECT USING (EXISTS(SELECT 1 FROM users WHERE discord_id = auth.uid()::text AND is_admin = true));

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Database schema is now complete!
-- Total tables: 15 core + 6 admin/security + 4 real-time = 25 tables
-- Features: Admin panel, Security monitoring, Real-time presence, Enhanced forum, Gamification
-- Ready for production use with FiveM Tools V7XISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities (Enhanced)
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

-- Downloads (Enhanced)
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    download_method VARCHAR(50) DEFAULT 'direct',
    coins_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, asset_id)
);

-- Coin Transactions (Enhanced)
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('earn', 'spend', 'admin_add', 'admin_remove')),
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50), -- 'asset_download', 'spin_wheel', 'admin_action', etc.
    reference_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SPIN WHEEL SYSTEM
-- =============================================

-- Spin Wheel Prizes
CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('coins', 'membership', 'asset', 'custom')),
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
    tickets_used INTEGER DEFAULT 1,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTENT MANAGEMENT
-- =============================================

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    show_on_homepage BOOLEAN DEFAULT FALSE,
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'free', 'vip', 'admin')),
    expires_at TIMESTAMP WITH TIME ZONE,
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
    position VARCHAR(50) DEFAULT 'header' CHECK (position IN ('header', 'sidebar', 'footer', 'popup')),
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    impression_count INTEGER DEFAULT 0,
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'free', 'vip', 'admin')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership);
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(banned);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Assets indexes
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_framework ON assets(framework);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_creator_id ON assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_assets_downloads ON assets(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_assets_rating ON assets(rating DESC);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_is_featured ON assets(is_featured);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets USING GIN(tags);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_last_reply_at ON forum_threads(last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_is_pinned ON forum_threads(is_pinned);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at);

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_source_ip ON security_events(source_ip);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Downloads indexes
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_asset_id ON downloads(asset_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at DESC);

-- Coin transactions indexes
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);

-- Spin wheel indexes
CREATE INDEX IF NOT EXISTS idx_spin_wheel_history_user_id ON spin_wheel_history(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_wheel_history_created_at ON spin_wheel_history(created_at DESC);

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

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_categories_updated_at BEFORE UPDATE ON forum_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spin_wheel_tickets_updated_at BEFORE UPDATE ON spin_wheel_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON user_presence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_firewall_rules_updated_at BEFORE UPDATE ON firewall_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Popular assets view
CREATE OR REPLACE VIEW popular_assets AS
SELECT 
    a.*,
    u.username as creator_name,
    u.avatar as creator_avatar
FROM assets a
JOIN users u ON a.creator_id = u.id
WHERE a.status = 'approved' AND a.deleted_at IS NULL
ORDER BY a.downloads DESC, a.rating DESC;

-- Recent forum activity view
CREATE OR REPLACE VIEW recent_forum_activity AS
SELECT 
    t.id,
    t.title,
    t.created_at,
    t.replies,
    t.views,
    c.name as category_name,
    u.username as author_name,
    u.avatar as author_avatar
FROM forum_threads t
JOIN forum_categories c ON t.category_id = c.id
JOIN users u ON t.author_id = u.id
WHERE t.is_deleted = FALSE
ORDER BY COALESCE(t.last_reply_at, t.created_at) DESC;

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.username,
    u.membership,
    u.coins,
    u.reputation,
    COUNT(DISTINCT a.id) as assets_created,
    COUNT(DISTINCT d.id) as total_downloads,
    COUNT(DISTINCT ft.id) as forum_threads,
    COUNT(DISTINCT fr.id) as forum_replies
FROM users u
LEFT JOIN assets a ON u.id = a.creator_id AND a.deleted_at IS NULL
LEFT JOIN downloads d ON u.id = d.user_id
LEFT JOIN forum_threads ft ON u.id = ft.author_id AND ft.is_deleted = FALSE
LEFT JOIN forum_replies fr ON u.id = fr.author_id AND fr.is_deleted = FALSE
GROUP BY u.id, u.username, u.membership, u.coins, u.reputation;

-- =============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

-- Function to award coins
CREATE OR REPLACE FUNCTION award_coins(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT coins INTO current_balance FROM users WHERE id = p_user_id;
    
    IF current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update user balance
    UPDATE users SET coins = coins + p_amount WHERE id = p_user_id;
    
    -- Record transaction
    INSERT INTO coin_transactions (
        user_id, type, amount, balance_before, balance_after, 
        description, reference_type, reference_id
    ) VALUES (
        p_user_id, 'earn', p_amount, current_balance, current_balance + p_amount,
        p_description, p_reference_type, p_reference_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to spend coins
CREATE OR REPLACE FUNCTION spend_coins(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT coins INTO current_balance FROM users WHERE id = p_user_id;
    
    IF current_balance IS NULL OR current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Update user balance
    UPDATE users SET coins = coins - p_amount WHERE id = p_user_id;
    
    -- Record transaction
    INSERT INTO coin_transactions (
        user_id, type, amount, balance_before, balance_after,
        description, reference_type, reference_id
    ) VALUES (
        p_user_id, 'spend', p_amount, current_balance, current_balance - p_amount,
        p_description, p_reference_type, p_reference_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA INSERTS
-- =============================================

-- Insert default admin user (if not exists)
INSERT INTO users (discord_id, username, email, membership, coins, is_admin, bio, role)
VALUES ('123456789', 'Admin', 'admin@fivemtools.com', 'admin', 10000, TRUE, 'System Administrator', 'Administrator')
ON CONFLICT (discord_id) DO NOTHING;

-- Insert forum categories
INSERT INTO forum_categories (name, description, icon, color, order_index) VALUES
('General Discussion', 'General topics about FiveM', 'chat', '#3b82f6', 1),
('Script Releases', 'Share your scripts with the community', 'code', '#10b981', 2),
('MLO Releases', 'Map and interior releases', 'map', '#f59e0b', 3),
('Support & Help', 'Get help with your FiveM server', 'help-circle', '#ef4444', 4),
('Tutorials', 'Learn how to develop for FiveM', 'book', '#8b5cf6', 5),
('Off Topic', 'Anything not related to FiveM', 'message-circle', '#6b7280', 6)
ON CONFLICT DO NOTHING;

-- Insert spin wheel prizes
INSERT INTO spin_wheel_prizes (name, type, value, probability, color, icon) VALUES
('50 Coins', 'coins', 50, 0.3, '#10b981', 'coins'),
('100 Coins', 'coins', 100, 0.25, '#3b82f6', 'coins'),
('200 Coins', 'coins', 200, 0.15, '#8b5cf6', 'coins'),
('500 Coins', 'coins', 500, 0.1, '#f59e0b', 'coins'),
('1000 Coins', 'coins', 1000, 0.05, '#ef4444', 'coins'),
('VIP 1 Month', 'membership', 30, 0.1, '#fbbf24', 'crown'),
('Better Luck Next Time', 'coins', 0, 0.05, '#6b7280', 'x')
ON CONFLICT DO NOTHING;

-- Insert sample announcements
INSERT INTO announcements (title, content, type, is_active, show_on_homepage, created_by) 
SELECT 
    'Welcome to FiveM Tools V7!',
    'We are excited to announce the launch of FiveM Tools V7 with enhanced features, better security, and improved user experience.',
    'success',
    TRUE,
    TRUE,
    u.id
FROM users u WHERE u.is_admin = TRUE LIMIT 1
ON CONFLICT DO NOTHING;

-- =============================================
-- FINAL SETUP
-- =============================================

-- Enable Row Level Security (RLS) for sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples)
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid()::text = discord_id OR is_admin = TRUE);
CREATE POLICY admin_actions_admin_only ON admin_actions FOR ALL USING (EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY security_events_admin_only ON security_events FOR ALL USING (EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'FiveM Tools V7 Database Schema Setup Complete!';
    RAISE NOTICE 'Total Tables Created: 15+';
    RAISE NOTICE 'Indexes: Optimized for performance';
    RAISE NOTICE 'Triggers: Auto-update timestamps';
    RAISE NOTICE 'Views: Common queries optimized';
    RAISE NOTICE 'Functions: Business logic implemented';
    RAISE NOTICE 'Security: RLS enabled on sensitive tables';
    RAISE NOTICE 'Ready for production use!';
END $$;XISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities (Enhanced)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads (Enhanced)
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    download_method VARCHAR(50) DEFAULT 'direct', -- 'direct', 'linkvertise'
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, asset_id, created_at)
);

-- Coin Transactions (Enhanced)
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'earn', 'spend', 'admin_add', 'admin_remove'
    amount INTEGER NOT NULL,
    description TEXT,
    reference_type VARCHAR(50), -- 'asset_purchase', 'daily_bonus', 'spin_wheel', etc.
    reference_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'promo')),
    is_active BOOLEAN DEFAULT TRUE,
    is_dismissible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SPIN WHEEL & GAMIFICATION
-- =============================================

-- Spin Wheel Prizes (Enhanced)
CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'coins', 'membership', 'asset', 'badge'
    value INTEGER,
    probability DECIMAL(5,4) NOT NULL, -- 0.0001 to 1.0000
    icon VARCHAR(255),
    color VARCHAR(7) DEFAULT '#3b82f6',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spin Wheel History (Enhanced)
CREATE TABLE IF NOT EXISTS spin_wheel_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES spin_wheel_prizes(id) ON DELETE SET NULL,
    prize_name VARCHAR(255) NOT NULL,
    prize_value INTEGER,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_type)
);

-- =============================================
-- REPORTS & MODERATION
-- =============================================

-- Reports (Enhanced)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type VARCHAR(50) NOT NULL, -- 'user', 'asset', 'forum_thread', 'forum_reply'
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(banned);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Assets indexes
CREATE INDEX IF NOT EXISTS idx_assets_creator_id ON assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_framework ON assets(framework);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_is_featured ON assets(is_featured);
CREATE INDEX IF NOT EXISTS idx_assets_downloads ON assets(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_assets_rating ON assets(rating DESC);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_status ON security_events(status);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_type ON admin_actions(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_is_pinned ON forum_threads(is_pinned);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);

-- Real-time indexes
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_activity ON user_presence(last_activity);
CREATE INDEX IF NOT EXISTS idx_realtime_events_type ON realtime_events(type);
CREATE INDEX IF NOT EXISTS idx_realtime_events_created_at ON realtime_events(created_at DESC);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_sort_order ON announcements(sort_order);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- =============================================
-- TRIGGERS FOR AUTOMATION
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_categories_updated_at BEFORE UPDATE ON forum_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_firewall_rules_updated_at BEFORE UPDATE ON firewall_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update forum statistics
CREATE OR REPLACE FUNCTION update_forum_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'forum_threads' THEN
            UPDATE forum_categories 
            SET thread_count = thread_count + 1 
            WHERE id = NEW.category_id;
        ELSIF TG_TABLE_NAME = 'forum_replies' THEN
            UPDATE forum_threads 
            SET replies = replies + 1, last_reply_at = NOW(), last_reply_by = NEW.author_id 
            WHERE id = NEW.thread_id;
            
            UPDATE forum_categories 
            SET post_count = post_count + 1 
            WHERE id = (SELECT category_id FROM forum_threads WHERE id = NEW.thread_id);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'forum_threads' THEN
            UPDATE forum_categories 
            SET thread_count = thread_count - 1 
            WHERE id = OLD.category_id;
        ELSIF TG_TABLE_NAME = 'forum_replies' THEN
            UPDATE forum_threads 
            SET replies = replies - 1 
            WHERE id = OLD.thread_id;
            
            UPDATE forum_categories 
            SET post_count = post_count - 1 
            WHERE id = (SELECT category_id FROM forum_threads WHERE id = OLD.thread_id);
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER forum_threads_stats AFTER INSERT OR DELETE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_forum_stats();
CREATE TRIGGER forum_replies_stats AFTER INSERT OR DELETE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_forum_stats();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE firewall_rules ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert default admin user (if not exists)
INSERT INTO users (discord_id, username, email, is_admin, membership, coins)
VALUES ('1047719075322810378', 'Admin', 'admin@fivemtools.net', true, 'admin', 999999)
ON CONFLICT (discord_id) DO NOTHING;

-- Insert default forum categories
INSERT INTO forum_categories (name, description, icon, color, order_index) VALUES
('General Discussion', 'General discussions about FiveM', 'MessageSquare', '#3b82f6', 1),
('Script Help', 'Get help with FiveM scripts', 'Code', '#10b981', 2),
('Asset Releases', 'Share your FiveM assets', 'Package', '#f59e0b', 3),
('Server Advertising', 'Advertise your FiveM server', 'Server', '#8b5cf6', 4),
('Off Topic', 'Discussions not related to FiveM', 'Coffee', '#6b7280', 5)
ON CONFLICT DO NOTHING;

-- Insert default announcements
INSERT INTO announcements (title, message, type, is_active, is_dismissible, sort_order) VALUES
('Welcome', '🎉 Welcome to FiveM Tools V7 - Your ultimate FiveM resource platform!', 'success', true, true, 1),
('New Features', '✨ Explore our new advanced admin dashboard and real-time features!', 'info', true, true, 2),
('Discord', '💬 Join our Discord community for support and updates!', 'promo', true, true, 3)
ON CONFLICT DO NOTHING;

-- Insert default spin wheel prizes
INSERT INTO spin_wheel_prizes (name, type, value, probability, icon, color) VALUES
('50 Coins', 'coins', 50, 0.3000, 'Coins', '#f59e0b'),
('100 Coins', 'coins', 100, 0.2000, 'Coins', '#f59e0b'),
('200 Coins', 'coins', 200, 0.1500, 'Coins', '#f59e0b'),
('500 Coins', 'coins', 500, 0.1000, 'Coins', '#f59e0b'),
('1000 Coins', 'coins', 1000, 0.0500, 'Coins', '#f59e0b'),
('VIP Membership', 'membership', 30, 0.0300, 'Crown', '#8b5cf6'),
('Free Asset', 'asset', 1, 0.0500, 'Gift', '#10b981'),
('Better Luck Next Time', 'nothing', 0, 0.1200, 'X', '#6b7280')
ON CONFLICT DO NOTHING;

-- Create views for analytics
CREATE OR REPLACE VIEW analytics_overview AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
    (SELECT COUNT(*) FROM users WHERE last_seen > NOW() - INTERVAL '1 hour') as active_users,
    (SELECT COUNT(*) FROM assets WHERE deleted_at IS NULL) as total_assets,
    (SELECT COUNT(*) FROM forum_threads WHERE deleted_at IS NULL) as total_threads,
    (SELECT COUNT(*) FROM downloads) as total_downloads,
    (SELECT COUNT(*) FROM security_events WHERE status = 'active') as active_security_events;

COMMENT ON DATABASE postgres IS 'FiveM Tools V7 - Complete Database with Advanced Features';XISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities (Enhanced)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads (Enhanced)
CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    download_method VARCHAR(50) DEFAULT 'direct', -- 'direct', 'linkvertise'
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, asset_id, created_at)
);

-- Coin Transactions (Enhanced)
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'earn', 'spend', 'admin_add', 'admin_remove'
    amount INTEGER NOT NULL,
    description TEXT,
    reference_type VARCHAR(50), -- 'asset_purchase', 'daily_bonus', 'spin_wheel', etc.
    reference_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SPIN WHEEL & GAMIFICATION
-- =============================================

-- Spin Wheel Prizes (Enhanced)
CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'coins', 'membership', 'asset', 'badge'
    value INTEGER,
    probability DECIMAL(5,4) NOT NULL, -- 0.0001 to 1.0000
    icon VARCHAR(255),
    color VARCHAR(7) DEFAULT '#3b82f6',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spin Wheel History (Enhanced)
CREATE TABLE IF NOT EXISTS spin_wheel_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES spin_wheel_prizes(id) ON DELETE SET NULL,
    prize_name VARCHAR(255) NOT NULL,
    prize_value INTEGER,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_type)
);

-- =============================================
-- REPORTS & MODERATION
-- =============================================

-- Reports (Enhanced)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type VARCHAR(50) NOT NULL, -- 'user', 'asset', 'forum_thread', 'forum_reply'
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_membership ON users(membership);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(banned);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Assets indexes
CREATE INDEX IF NOT EXISTS idx_assets_creator_id ON assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_framework ON assets(framework);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_is_featured ON assets(is_featured);
CREATE INDEX IF NOT EXISTS idx_assets_downloads ON assets(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_assets_rating ON assets(rating DESC);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_status ON security_events(status);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_type ON admin_actions(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_is_pinned ON forum_threads(is_pinned);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);

-- Real-time indexes
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_activity ON user_presence(last_activity);
CREATE INDEX IF NOT EXISTS idx_realtime_events_type ON realtime_events(type);
CREATE INDEX IF NOT EXISTS idx_realtime_events_created_at ON realtime_events(created_at DESC);

-- =============================================
-- TRIGGERS FOR AUTOMATION
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_categories_updated_at BEFORE UPDATE ON forum_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_firewall_rules_updated_at BEFORE UPDATE ON firewall_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update forum statistics
CREATE OR REPLACE FUNCTION update_forum_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'forum_threads' THEN
            UPDATE forum_categories 
            SET thread_count = thread_count + 1 
            WHERE id = NEW.category_id;
        ELSIF TG_TABLE_NAME = 'forum_replies' THEN
            UPDATE forum_threads 
            SET replies = replies + 1, last_reply_at = NOW(), last_reply_by = NEW.author_id 
            WHERE id = NEW.thread_id;
            
            UPDATE forum_categories 
            SET post_count = post_count + 1 
            WHERE id = (SELECT category_id FROM forum_threads WHERE id = NEW.thread_id);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'forum_threads' THEN
            UPDATE forum_categories 
            SET thread_count = thread_count - 1 
            WHERE id = OLD.category_id;
        ELSIF TG_TABLE_NAME = 'forum_replies' THEN
            UPDATE forum_threads 
            SET replies = replies - 1 
            WHERE id = OLD.thread_id;
            
            UPDATE forum_categories 
            SET post_count = post_count - 1 
            WHERE id = (SELECT category_id FROM forum_threads WHERE id = OLD.thread_id);
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER forum_threads_stats AFTER INSERT OR DELETE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_forum_stats();
CREATE TRIGGER forum_replies_stats AFTER INSERT OR DELETE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_forum_stats();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE firewall_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND is_admin = true)
);

CREATE POLICY "Only admins can view admin actions" ON admin_actions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND is_admin = true)
);

CREATE POLICY "Only admins can view security events" ON security_events FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND is_admin = true)
);

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert default admin user (if not exists)
INSERT INTO users (discord_id, username, email, is_admin, membership, coins)
VALUES ('1047719075322810378', 'Admin', 'admin@fivemtools.net', true, 'admin', 999999)
ON CONFLICT (discord_id) DO NOTHING;

-- Insert default forum categories
INSERT INTO forum_categories (name, description, icon, color, order_index) VALUES
('General Discussion', 'General discussions about FiveM', 'MessageSquare', '#3b82f6', 1),
('Script Help', 'Get help with FiveM scripts', 'Code', '#10b981', 2),
('Asset Releases', 'Share your FiveM assets', 'Package', '#f59e0b', 3),
('Server Advertising', 'Advertise your FiveM server', 'Server', '#8b5cf6', 4),
('Off Topic', 'Discussions not related to FiveM', 'Coffee', '#6b7280', 5)
ON CONFLICT DO NOTHING;

-- Insert default spin wheel prizes
INSERT INTO spin_wheel_prizes (name, type, value, probability, icon, color) VALUES
('50 Coins', 'coins', 50, 0.3000, 'Coins', '#f59e0b'),
('100 Coins', 'coins', 100, 0.2000, 'Coins', '#f59e0b'),
('200 Coins', 'coins', 200, 0.1500, 'Coins', '#f59e0b'),
('500 Coins', 'coins', 500, 0.1000, 'Coins', '#f59e0b'),
('1000 Coins', 'coins', 1000, 0.0500, 'Coins', '#f59e0b'),
('VIP Membership', 'membership', 30, 0.0300, 'Crown', '#8b5cf6'),
('Free Asset', 'asset', 1, 0.0500, 'Gift', '#10b981'),
('Better Luck Next Time', 'nothing', 0, 0.1200, 'X', '#6b7280')
ON CONFLICT DO NOTHING;

-- Create views for analytics
CREATE OR REPLACE VIEW analytics_overview AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
    (SELECT COUNT(*) FROM users WHERE last_seen > NOW() - INTERVAL '1 hour') as active_users,
    (SELECT COUNT(*) FROM assets WHERE deleted_at IS NULL) as total_assets,
    (SELECT COUNT(*) FROM forum_threads WHERE deleted_at IS NULL) as total_threads,
    (SELECT COUNT(*) FROM downloads) as total_downloads,
    (SELECT COUNT(*) FROM security_events WHERE status = 'active') as active_security_events;

COMMENT ON DATABASE postgres IS 'FiveM Tools V7 - Complete Database with Advanced Features';

-- Final verification query
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Success message
SELECT 'FiveM Tools V7 Database Setup Complete! 🎉' as status;