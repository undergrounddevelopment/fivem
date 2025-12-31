-- SEED TESTIMONIALS DATA
-- Run this in Supabase SQL Editor

-- First, check if table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
        RAISE EXCEPTION 'Table testimonials does not exist!';
    END IF;
END $$;

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE testimonials RESTART IDENTITY CASCADE;

-- Insert sample testimonials with realistic data
INSERT INTO testimonials (
    username, 
    avatar, 
    rating, 
    content, 
    server_name, 
    upvotes_received, 
    is_featured, 
    is_verified, 
    badge,
    image_url
) VALUES
-- Verified Users
('JohnDoe_RP', 'https://i.pravatar.cc/150?img=1', 5, 
 'Amazing service! Got 10,000 upvotes in just 30 minutes. My server went from page 5 to page 1 on FiveM list. Highly recommended!', 
 'Los Santos Roleplay', 10000, true, true, 'verified', NULL),

('MikeGaming', 'https://i.pravatar.cc/150?img=2', 5,
 'Best upvote service I''ve ever used! Fast delivery, professional support, and my server is now in top 10. Worth every penny!',
 'Vice City RP', 15000, true, true, 'pro', NULL),

('SarahAdmin', 'https://i.pravatar.cc/150?img=3', 5,
 'Professional and reliable. Got 20k upvotes and my server population doubled! The UDG tool is a game changer.',
 'Liberty City RP', 20000, true, true, 'vip', NULL),

-- Premium Users
('AlexServer', 'https://i.pravatar.cc/150?img=4', 5,
 'Lifetime plan is the best investment! Unlimited upvotes and my server is always in top 5. Customer support is excellent!',
 'San Andreas RP', 50000, true, true, 'premium', NULL),

('EmmaRP', 'https://i.pravatar.cc/150?img=5', 5,
 'Got 8k upvotes in 20 minutes! Server went from 20 players to 80 players online. This tool really works!',
 'RedM Western RP', 8000, true, true, 'verified', NULL),

-- Regular Users
('DavidGamer', 'https://i.pravatar.cc/150?img=6', 5,
 'Fast and efficient! My server ranking improved dramatically. Highly recommend for any FiveM server owner.',
 'Eclipse RP', 12000, true, false, NULL, NULL),

('LisaAdmin', 'https://i.pravatar.cc/150?img=7', 5,
 'Excellent service! Got exactly what I paid for. Server is now getting more organic players thanks to better ranking.',
 'NoPixel Inspired', 18000, true, true, 'pro', NULL),

('ChrisOwner', 'https://i.pravatar.cc/150?img=8', 5,
 'Been using this for 3 months now. Consistent results every time. My server is always in top 20!',
 'GTA World', 25000, true, true, 'vip', NULL),

('JessicaRP', 'https://i.pravatar.cc/150?img=9', 5,
 'Amazing tool! Easy to use and delivers results fast. My server went from unknown to popular in days!',
 'Mafia City RP', 9500, true, false, NULL, NULL),

('RyanDev', 'https://i.pravatar.cc/150?img=10', 5,
 'As a developer, I appreciate the professional approach. Clean interface, fast delivery, great support!',
 'Project Homecoming', 14000, true, true, 'verified', NULL),

-- More testimonials
('TommyGTA', 'https://i.pravatar.cc/150?img=11', 5,
 'Got 30k upvotes with lifetime plan! Server is now #3 on FiveM list. Best decision ever!',
 'Los Santos Life', 30000, true, true, 'premium', NULL),

('NinaServer', 'https://i.pravatar.cc/150?img=12', 5,
 'Quick and reliable service. My server population tripled after using this. Highly recommended!',
 'City of Angels', 11000, true, false, NULL, NULL),

('KevinRP', 'https://i.pravatar.cc/150?img=13', 5,
 'Professional service with great results. Server went from 15 to 60 players online. Worth it!',
 'New York RP', 13500, true, true, 'pro', NULL),

('OliviaGaming', 'https://i.pravatar.cc/150?img=14', 5,
 'Fast delivery and excellent support! My server is now getting noticed by more players.',
 'Miami RP', 7800, true, false, NULL, NULL),

('BrianOwner', 'https://i.pravatar.cc/150?img=15', 5,
 'Best upvote service on the market! Got 40k upvotes and server is thriving. Thank you!',
 'Chicago RP', 40000, true, true, 'premium', NULL);

-- Verify insertion
SELECT 
    COUNT(*) as total_testimonials,
    SUM(upvotes_received) as total_upvotes,
    ROUND(AVG(rating), 2) as avg_rating,
    COUNT(CASE WHEN is_verified THEN 1 END) as verified_count,
    COUNT(CASE WHEN is_featured THEN 1 END) as featured_count
FROM testimonials;

-- Show sample data
SELECT 
    username, 
    rating, 
    upvotes_received, 
    is_verified, 
    badge,
    created_at
FROM testimonials
ORDER BY created_at DESC
LIMIT 10;

COMMIT;
