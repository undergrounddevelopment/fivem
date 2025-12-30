-- SEED DATA FOR FIVEM TOOLS V7
-- Run this in Supabase SQL Editor

-- 1. Insert Forum Categories
INSERT INTO forum_categories (name, description, slug, icon, color, sort_order, is_active) VALUES
('General Discussion', 'General FiveM discussions and community chat', 'general', 'message-circle', '#22C55E', 1, true),
('Help & Support', 'Get help with scripts, installation, and troubleshooting', 'help', 'help-circle', '#F59E0B', 2, true),
('Script Requests', 'Request new scripts and features', 'requests', 'code', '#3B82F6', 3, true),
('Showcase', 'Show off your servers and creations', 'showcase', 'star', '#EC4899', 4, true),
('Marketplace', 'Buy, sell, and trade FiveM resources', 'marketplace', 'shopping-bag', '#8B5CF6', 5, true),
('Announcements', 'Official announcements and updates', 'announcements', 'megaphone', '#EF4444', 0, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Sample Assets (if none exist)
INSERT INTO assets (title, description, category, framework, version, coin_price, thumbnail, download_link, status, downloads, likes, is_verified, is_featured, tags) VALUES
('QB Banking System', 'Advanced banking system with ATM, mobile banking, and more', 'scripts', 'qbcore', '1.0.0', 0, 'https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/fivembanner.gif', 'https://example.com/download', 'active', 1250, 89, true, true, ARRAY['banking', 'qbcore', 'economy']),
('Modern MLO Pack', 'Collection of modern interiors for your server', 'mlo', 'standalone', '1.0.0', 100, 'https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/fivembanner.gif', 'https://example.com/download', 'active', 890, 67, true, true, ARRAY['mlo', 'interior', 'modern']),
('Police Vehicle Pack', 'High quality police vehicles', 'vehicles', 'standalone', '1.0.0', 50, 'https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/fivembanner.gif', 'https://example.com/download', 'active', 2100, 145, true, true, ARRAY['vehicles', 'police', 'emergency']),
('EUP Clothing Pack', 'Emergency Uniform Pack for FiveM', 'clothing', 'standalone', '1.0.0', 0, 'https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/fivembanner.gif', 'https://example.com/download', 'active', 1560, 98, true, false, ARRAY['eup', 'clothing', 'uniform'])
ON CONFLICT DO NOTHING;

-- 3. Insert Spin Wheel Prizes (if none exist)
INSERT INTO spin_wheel_prizes (name, type, value, probability, color, icon, sort_order, is_active) VALUES
('50 Coins', 'coins', 50, 30.0, '#22C55E', 'coins', 1, true),
('100 Coins', 'coins', 100, 25.0, '#3B82F6', 'coins', 2, true),
('250 Coins', 'coins', 250, 15.0, '#8B5CF6', 'coins', 3, true),
('500 Coins', 'coins', 500, 10.0, '#EC4899', 'coins', 4, true),
('1000 Coins', 'coins', 1000, 5.0, '#EF4444', 'coins', 5, true),
('Free Spin', 'ticket', 1, 10.0, '#F59E0B', 'ticket', 6, true),
('Better Luck', 'nothing', 0, 5.0, '#6B7280', 'x', 7, true)
ON CONFLICT DO NOTHING;

-- 4. Insert Announcements
INSERT INTO announcements (title, content, type, is_active, priority) VALUES
('Welcome to FiveM Tools V7!', 'Thank you for joining our community. Explore thousands of free resources!', 'info', true, 1),
('New Features Added', 'Check out our new spin wheel and daily rewards system!', 'success', true, 2)
ON CONFLICT DO NOTHING;

-- 5. Insert Testimonials
INSERT INTO testimonials (user_id, username, avatar, content, rating, is_featured) VALUES
('system', 'John Doe', null, 'Amazing platform! Found everything I needed for my server.', 5, true),
('system', 'Jane Smith', null, 'Best FiveM resource hub out there. Highly recommended!', 5, true),
('system', 'Mike Johnson', null, 'Great community and tons of free resources. Love it!', 5, false)
ON CONFLICT DO NOTHING;

-- Verify counts
SELECT 
  (SELECT COUNT(*) FROM forum_categories) as categories,
  (SELECT COUNT(*) FROM assets) as assets,
  (SELECT COUNT(*) FROM spin_wheel_prizes) as prizes,
  (SELECT COUNT(*) FROM announcements) as announcements,
  (SELECT COUNT(*) FROM testimonials) as testimonials;
