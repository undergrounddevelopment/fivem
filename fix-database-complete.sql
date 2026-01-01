-- Complete Database Schema Fix
-- Run this to fix all schema issues

-- Fix forum_categories table
ALTER TABLE forum_categories 
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'message-circle',
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 1;

-- Fix assets table
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS download_url TEXT,
ADD COLUMN IF NOT EXISTS preview_images TEXT[],
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS uploader_id TEXT;

-- Fix announcements table
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS author_id TEXT,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'info',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Fix spin_wheel_prizes table - add unique constraint
ALTER TABLE spin_wheel_prizes 
ADD CONSTRAINT IF NOT EXISTS spin_wheel_prizes_name_key UNIQUE (name);

-- Insert forum categories with proper UUIDs
INSERT INTO forum_categories (id, name, description, icon, color, sort_order) VALUES
(gen_random_uuid(), 'Announcements', 'Official announcements and updates from the team', 'megaphone', '#EF4444', 1),
(gen_random_uuid(), 'General Discussion', 'Chat about anything FiveM related', 'message-circle', '#22C55E', 2),
(gen_random_uuid(), 'Help & Support', 'Get help with scripts, installation, and troubleshooting', 'help-circle', '#F59E0B', 3),
(gen_random_uuid(), 'Script Requests', 'Request new scripts and features', 'code', '#3B82F6', 4),
(gen_random_uuid(), 'Showcase', 'Show off your servers and creations', 'star', '#EC4899', 5),
(gen_random_uuid(), 'Marketplace', 'Buy, sell, and trade FiveM resources', 'shopping-bag', '#8B5CF6', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert spin wheel prizes
INSERT INTO spin_wheel_prizes (name, type, value, probability, color, icon) VALUES
('100 Coins', 'coins', 100, 30.0, '#FFD700', '💰'),
('250 Coins', 'coins', 250, 20.0, '#FFD700', '💰'),
('500 Coins', 'coins', 500, 15.0, '#FFD700', '💰'),
('1000 Coins', 'coins', 1000, 10.0, '#FFD700', '💰'),
('Free Script', 'item', 1, 8.0, '#00FF00', '📜'),
('Premium Access', 'membership', 7, 5.0, '#FF6B6B', '👑'),
('Jackpot 5000', 'coins', 5000, 2.0, '#FF0000', '🎰')
ON CONFLICT (name) DO NOTHING;

COMMIT;