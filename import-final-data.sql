-- Final data import with proper UUID values
-- Set session for data import
SET session_replication_role = replica;
SET client_min_messages = warning;

-- Import users data
INSERT INTO public.users (id, discord_id, username, email, avatar, membership, coins, reputation, downloads, points, is_banned, ban_reason, is_admin, created_at, updated_at, last_seen, spin_tickets, role, is_active, xp, level, bio)
VALUES 
    ('006e373e-6d58-4a75-bbe6-24367294b8fe', '1398251381835432059', 'ken.thor_', 'discordboscarato@gmail.com', 'https://cdn.discordapp.com/avatars/1398251381835432059/39a0f5b5b87406faf5a1762abd4b3abd.png', 'free', 100, 0, 0, 0, false, NULL, false, '2025-12-21T12:38:25.575841+00:00', '2025-12-29T16:05:58.955974+00:00', '2025-12-29T16:05:37.668+00:00', 0, 'member', true, 0, 1, NULL)
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
    ('550e8400-e29b-41d4-a716-446655440001', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'Amazing FiveM tools! The spin wheel feature is so much fun and I love the daily rewards system.', 5, true, '2025-12-25T10:00:00+00:00'),
    ('550e8400-e29b-41d4-a716-446655440002', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'Great community and excellent support. The download system works perfectly.', 4, false, '2025-12-26T14:30:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Import spin history
INSERT INTO public.spin_history (id, user_id, prize_type, prize_value, spin_cost, created_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440003', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'coins', 50, 10, '2025-12-28T15:30:00+00:00'),
    ('550e8400-e29b-41d4-a716-446655440004', '006e373e-6d58-4a75-bbe6-24367294b8fe', 'spin_ticket', 2, 10, '2025-12-29T10:15:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Import downloads
INSERT INTO public.downloads (id, user_id, asset_id, downloaded_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440005', '006e373e-6d58-4a75-bbe6-24367294b8fe', '550e8400-e29b-41d4-a716-446655440006', '2025-12-27T16:45:00+00:00'),
    ('550e8400-e29b-41d4-a716-446655440007', '006e373e-6d58-4a75-bbe6-24367294b8fe', '550e8400-e29b-41d4-a716-446655440008', '2025-12-28T11:20:00+00:00')
ON CONFLICT (id) DO NOTHING;

-- Create profiles for existing users
INSERT INTO public.profiles (id, user_id, username, discord_username, discord_avatar, level, xp, total_downloads, updated_at)
SELECT 
    gen_random_uuid(),
    id, 
    username, 
    username,
    avatar,
    level,
    xp,
    downloads,
    updated_at
FROM public.users 
WHERE id NOT IN (SELECT user_id FROM public.profiles);

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Data import completed!
