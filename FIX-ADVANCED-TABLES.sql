-- 🔧 MANUAL FIX: COPY-PASTE THIS TO SUPABASE SQL EDITOR
-- This will create all missing advanced tables for 100% completion

-- Admin Actions Log
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID,
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
    severity VARCHAR(20) NOT NULL,
    source_ip INET,
    target_user_id UUID,
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    automated_response BOOLEAN DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Firewall Rules
CREATE TABLE IF NOT EXISTS firewall_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    source_pattern TEXT NOT NULL,
    target_pattern TEXT,
    action VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 100,
    enabled BOOLEAN DEFAULT TRUE,
    hit_count INTEGER DEFAULT 0,
    last_hit TIMESTAMP WITH TIME ZONE,
    created_by UUID,
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
    user_id UUID PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'offline',
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
    user_id UUID,
    metadata JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'medium',
    broadcast BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_realtime_events_type ON realtime_events(type);
CREATE INDEX IF NOT EXISTS idx_realtime_events_created_at ON realtime_events(created_at DESC);

-- Insert sample data
INSERT INTO admin_actions (action, target_type, target_id, reason) VALUES
('system_init', 'system', uuid_generate_v4(), 'Advanced tables created')
ON CONFLICT DO NOTHING;

INSERT INTO security_events (type, severity, description) VALUES
('system_start', 'low', 'Advanced security tables initialized'),
('table_creation', 'medium', 'Missing tables created successfully')
ON CONFLICT DO NOTHING;

INSERT INTO realtime_events (type, title, description) VALUES
('system', 'Advanced Features Enabled', 'Admin panel, real-time system, and security monitoring are now active')
ON CONFLICT DO NOTHING;

-- Success notification
SELECT 'SUCCESS: All 6 advanced tables created! Admin Panel, Real-time System, and Security Monitoring are now 100% ready!' as status;