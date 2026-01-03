-- CREATE MISSING ADVANCED TABLES - FiveM Tools V7
-- Run this in Supabase SQL Editor to fix missing tables

-- Admin Actions Log
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
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
    type VARCHAR(100) NOT NULL,
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
    source_pattern TEXT NOT NULL,
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
    identifier VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    requests INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(identifier, endpoint)
);

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_realtime_events_type ON realtime_events(type);

-- Sample data
INSERT INTO admin_actions (admin_id, action, target_type, target_id, reason) 
SELECT u.id, 'system_init', 'system', uuid_generate_v4(), 'System initialization'
FROM users u WHERE u.is_admin = true LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO security_events (type, severity, description) VALUES
('system_start', 'low', 'System started successfully'),
('database_init', 'medium', 'Database tables initialized')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All missing advanced tables created successfully!';
    RAISE NOTICE '🔧 Admin Panel: admin_actions, security_events';
    RAISE NOTICE '⚡ Real-time System: user_presence, realtime_events';
    RAISE NOTICE '🛡️ Security Monitoring: firewall_rules, rate_limits';
END $$;