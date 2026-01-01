-- Clean data import - only import existing tables data
-- Skip TRUNCATE for tables that don't exist

-- Set session for data import
SET session_replication_role = replica;
SET client_min_messages = warning;
SET client_encoding = 'UTF8';

-- Import users data first
INSERT INTO public.users (id, discord_id, username, email, avatar, membership, coins, reputation, downloads, points, is_banned, ban_reason, is_admin, created_at, updated_at, last_seen, spin_tickets, role, is_active, xp, level, bio)
VALUES 
    ('006e373e-6d58-4a75-bbe6-24367294b8fe', '1398251381835432059', 'ken.thor_', 'discordboscarato@gmail.com', 'https://cdn.discordapp.com/avatars/1398251381835432059/39a0f5b5b87406faf5a1762abd4b3abd.png', 'free', 100, 0, 0, 0, false, NULL, false, '2025-12-21T12:38:25.575841+00:00', '2025-12-29T16:05:58.955974+00:00', '2025-12-29T16:05:37.668+00:00', 0, 'member', true, 0, 1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Import assets data
INSERT INTO public.assets (id, title, description, category, file_url, image_url, download_count, rating, is_active, created_at, updated_at)
VALUES 
    ('default-asset-1', 'FiveM Vehicle Pack', 'Collection of high-quality vehicles for FiveM', 'vehicles', 'https://example.com/vehicle-pack.zip', 'https://example.com/vehicle-pack.jpg', 150, 4.5, true, '2025-12-01T10:00:00+00:00', '2025-12-29T15:00:00+00:00'),
    ('default-asset-2', 'Police EUP Pack', 'Enhanced police uniforms and equipment', 'eup', 'https://example.com/police-eup.zip', 'https://example.com/police-eup.jpg', 89, 4.2, true, '2025-12-05T14:30:00+00:00', '2025-12-28T18:20:00+00:00'),
    ('default-asset-3', 'Map Expansion', 'New map areas and locations', 'maps', 'https://example.com/map-expansion.zip', 'https://example.com/map-expansion.jpg', 67, 4.8, true, '2025-12-10T09:15:00+00:00', '2025-12-27T12:45:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Import forum threads data
INSERT INTO public.forum_threads (id, title, content, category_id, user_id, is_pinned, is_locked, reply_count, view_count, created_at, updated_at)
VALUES 
    ('thread-1', 'Welcome to FiveM Tools', 'Welcome everyone to our new community! Feel free to share your thoughts and suggestions.', NULL, '006e373e-6d58-4a75-bbe6-24367294b8fe', true, false, 5, 234, '2025-12-20T08:00:00+00:00', '2025-12-29T14:30:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Import forum categories
INSERT INTO public.forum_categories (id, name, description, icon, order_index, created_at)
VALUES 
    ('cat-general', 'General Discussion', 'General topics and discussions', 'message-square', 1, '2025-12-15T10:00:00+00:00'),
    ('cat-support', 'Support', 'Get help with FiveM tools', 'help-circle', 2, '2025-12-15T10:00:00+00:00'),
    ('cat-releases', 'Releases', 'New tool releases and updates', 'package', 3, '2025-12-15T10:00:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Import forum ranks
INSERT INTO public.forum_ranks (id, name, min_posts, color, icon, created_at)
VALUES 
    ('rank-newbie', 'Newbie', 0, '#95a5a6', 'user', '2025-12-15T10:00:00+00:00'),
    ('rank-member', 'Member', 10, '#3498db', 'user-check', '2025-12-15T10:00:00+00:00'),
    ('rank-veteran', 'Veteran', 50, '#9b59b6', 'award', '2025-12-15T10:00:00+00:00'),
    ('rank-admin', 'Admin', 100, '#e74c3c', 'shield', '2025-12-15T10:00:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Import settings
INSERT INTO public.settings (key, value, description)
VALUES 
    ('site_name', '"FiveM Tools"', 'Site name'),
    ('site_description', '"Best FiveM tools and resources"', 'Site description'),
    ('coins_per_download', '10', 'Coins awarded per download'),
    ('spin_cost', '10', 'Cost per spin in coins'),
    ('daily_bonus_coins', '50', 'Daily login bonus coins'),
    ('max_downloads_per_day', '5', 'Maximum downloads per free user'),
    ('enable_registration', 'true', 'Allow new user registration'),
    ('maintenance_mode', 'false', 'Site maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Import testimonials
INSERT INTO public.testimonials (id, user_id, content, rating, is_featured, created_at)
VALUES 
    ('test-1', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'Amazing FiveM tools! The spin wheel feature is so much fun and I love the daily rewards system.', 5, true, '2025-12-25T10:00:00+00:00'),
    ('test-2', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'Great community and excellent support. The download system works perfectly.', 4, false, '2025-12-26T14:30:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Import spin history
INSERT INTO public.spin_history (id, user_id, prize_type, prize_value, spin_cost, created_at)
VALUES 
    ('spin-1', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'coins', 50, 10, '2025-12-28T15:30:00+00:00'),
    ('spin-2', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'spin_ticket', 2, 10, '2025-12-29T10:15:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Import downloads
INSERT INTO public.downloads (id, user_id, asset_id, downloaded_at)
VALUES 
    ('dl-1', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'default-asset-1', '2025-12-27T16:45:00+00:00'),
    ('dl-2', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'default-asset-2', '2025-12-28T11:20:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Create profiles for existing users
INSERT INTO public.profiles (id, username, discord_username, discord_avatar, level, xp, total_downloads, updated_at)
SELECT 
    id, 
    username, 
    username,
    avatar,
    level,
    xp,
    downloads,
    updated_at
FROM public.users 
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Update sequences
SELECT setval('public.users_id_seq', (SELECT COALESCE(MAX(id), '00000000-0000-0000-0000-000000000001')::uuid + '1'::uuid FROM public.users));
SELECT setval('public.assets_id_seq', (SELECT COALESCE(MAX(id), '00000000-0000-0000-0000-000000000001')::uuid + '1'::uuid FROM public.assets));
SELECT setval('public.forum_threads_id_seq', (SELECT COALESCE(MAX(id), '00000000-0000-0000-0000-000000000001')::uuid + '1'::uuid FROM public.forum_threads));
SELECT setval('public.forum_categories_id_seq', (SELECT COALESCE(MAX(id), '00000000-0000-0000-0000-000000000001')::uuid + '1'::uuid FROM public.forum_categories));
SELECT setval('public.forum_ranks_id_seq', (SELECT COALESCE(MAX(id), '00000000-0000-0000-0000-000000000001')::uuid + '1'::uuid FROM public.forum_ranks));
SELECT setval('public.testimonials_id_seq', (SELECT COALESCE(MAX(id), '00000000-0000-0000-0000-000000000001')::uuid + '1'::uuid FROM public.testimonials));
SELECT setval('public.spin_history_id_seq', (SELECT COALESCE(MAX(id), '00000000-0000-0000-0000-000000000001')::uuid + '1'::uuid FROM public.spin_history));
SELECT setval('public.downloads_id_seq', (SELECT COALESCE(MAX(id), '00000000-0000-0000-0000-000000000001')::uuid + '1'::uuid FROM public.downloads));

-- Data import completed!
