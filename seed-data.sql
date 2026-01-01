-- FiveM Tools V7 - Sample Data

-- Insert Admin User
INSERT INTO users (discord_id, username, email, avatar, membership, coins, reputation, is_admin, role, level, xp) VALUES
('1047719075322810378', 'Admin', 'admin@fivemtools.net', 'https://cdn.discordapp.com/avatars/1047719075322810378/avatar.png', 'premium', 10000, 100, true, 'admin', 10, 5000);

-- Insert Sample Users
INSERT INTO users (discord_id, username, email, membership, coins, reputation, level, xp) VALUES
('user001', 'JohnDoe', 'john@example.com', 'free', 500, 25, 3, 300),
('user002', 'JaneSmith', 'jane@example.com', 'premium', 2000, 50, 5, 1200),
('user003', 'DevMaster', 'dev@example.com', 'vip', 5000, 150, 8, 3500);

-- Insert Forum Categories
INSERT INTO forum_categories (name, description, icon, color, sort_order) VALUES
('General Discussion', 'Diskusi umum tentang FiveM', '💬', '#3b82f6', 1),
('Script Help', 'Bantuan untuk script dan coding', '🔧', '#10b981', 2),
('MLO Showcase', 'Showcase MLO terbaik', '🏢', '#f59e0b', 3),
('Server Setup', 'Panduan setup server FiveM', '⚙️', '#8b5cf6', 4),
('Bug Reports', 'Laporkan bug dan masalah', '🐛', '#ef4444', 5),
('Suggestions', 'Saran dan feedback', '💡', '#06b6d4', 6);

-- Insert Sample Assets
INSERT INTO assets (title, description, category, framework, version, coin_price, thumbnail, download_link, file_size, downloads, tags, status, is_verified, is_featured, author_id) 
SELECT 
  'Advanced Police System',
  'Sistem polisi lengkap dengan MDT, dispatch, dan jail system',
  'script',
  'ESX',
  '2.1.0',
  500,
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
  'https://example.com/download/police',
  '15.2 MB',
  1250,
  ARRAY['police', 'mdt', 'dispatch'],
  'approved',
  true,
  true,
  id
FROM users WHERE username = 'Admin' LIMIT 1;

INSERT INTO assets (title, description, category, framework, version, coin_price, thumbnail, download_link, file_size, downloads, tags, status, is_verified, author_id)
SELECT 
  'Modern Car Dealership MLO',
  'MLO dealership mobil modern dengan interior detail',
  'mlo',
  'Standalone',
  '1.0.0',
  300,
  'https://images.unsplash.com/photo-1562911791-c7a97b729ec5',
  'https://example.com/download/dealership',
  '45.8 MB',
  890,
  ARRAY['mlo', 'dealership', 'cars'],
  'approved',
  true,
  id
FROM users WHERE username = 'DevMaster' LIMIT 1;

-- Insert Announcements
INSERT INTO announcements (title, message, type, is_active, sort_order) VALUES
('Welcome to FiveM Tools V7!', 'Platform terbaru untuk download scripts dan MLOs gratis!', 'success', true, 1),
('New Premium Features', 'Dapatkan akses unlimited dengan membership premium!', 'info', true, 2);

-- Insert Banners
INSERT INTO banners (title, image_url, link, position, is_active, sort_order) VALUES
('Premium Membership', 'https://images.unsplash.com/photo-1557683316-973673baf926', '/premium', 'home', true, 1),
('Discord Community', 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41', 'https://discord.gg/fivemtools', 'home', true, 2);

-- Insert Spin Wheel Prizes
INSERT INTO spin_wheel_prizes (name, type, value, probability, color, icon, is_active, sort_order) VALUES
('50 Coins', 'coins', 50, 30.00, '#fbbf24', '🪙', true, 1),
('100 Coins', 'coins', 100, 25.00, '#f59e0b', '🪙', true, 2),
('200 Coins', 'coins', 200, 15.00, '#f97316', '💰', true, 3),
('500 Coins', 'coins', 500, 10.00, '#ef4444', '💎', true, 4),
('1 Day Premium', 'premium', 1, 8.00, '#8b5cf6', '⭐', true, 5),
('3 Days Premium', 'premium', 3, 5.00, '#7c3aed', '✨', true, 6),
('7 Days Premium', 'premium', 7, 3.00, '#6d28d9', '🌟', true, 7),
('Better Luck', 'nothing', 0, 4.00, '#6b7280', '😢', true, 8);

-- Insert Sample Testimonials
INSERT INTO testimonials (user_id, asset_id, rating, comment, is_approved)
SELECT 
  u.id,
  a.id,
  5,
  'Script yang sangat bagus! Mudah diinstall dan berfungsi sempurna!',
  true
FROM users u, assets a 
WHERE u.username = 'JohnDoe' AND a.title LIKE '%Police%'
LIMIT 1;

INSERT INTO testimonials (user_id, asset_id, rating, comment, is_approved)
SELECT 
  u.id,
  a.id,
  4,
  'MLO keren, detail banget. Recommended!',
  true
FROM users u, assets a 
WHERE u.username = 'JaneSmith' AND a.title LIKE '%Dealership%'
LIMIT 1;

-- Insert Sample Forum Thread
INSERT INTO forum_threads (title, content, category_id, author_id, status, replies_count, views, is_pinned)
SELECT 
  'Welcome to FiveM Tools Forum!',
  'Selamat datang di forum FiveM Tools! Silakan diskusi dan berbagi pengalaman kalian di sini.',
  c.id,
  u.id,
  'approved',
  0,
  150,
  true
FROM forum_categories c, users u
WHERE c.name = 'General Discussion' AND u.username = 'Admin'
LIMIT 1;

-- Insert Activities
INSERT INTO activities (user_id, type, action, metadata)
SELECT id, 'user', 'registered', '{"source": "discord"}'::jsonb
FROM users WHERE username != 'Admin';

INSERT INTO activities (user_id, type, action, target_id, metadata)
SELECT u.id, 'asset', 'uploaded', a.id, '{"asset_type": "script"}'::jsonb
FROM users u, assets a
WHERE u.username = 'Admin' AND a.title LIKE '%Police%'
LIMIT 1;

COMMIT;
