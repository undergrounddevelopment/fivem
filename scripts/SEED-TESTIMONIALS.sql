-- Seed Testimonials Data
-- Run this to add sample testimonials to database

-- Insert sample testimonials
INSERT INTO testimonials (username, avatar, rating, content, server_name, upvotes_received, is_verified, is_featured, badge, image_url) VALUES
('JohnDoe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 5, 'Amazing upvote service! My server went from 50 to 500 players in just 2 weeks. The UDG system is incredibly fast and reliable. Highly recommended for any serious FiveM server owner!', 'Los Santos Roleplay', 15000, true, true, 'verified', NULL),
('ServerOwner123', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Owner', 5, 'Best investment I made for my server! The upvotes are delivered smoothly and the support team is amazing. Got my lifetime license and never looked back!', 'Grand Theft Roleplay', 25000, true, true, 'vip', NULL),
('RPMaster', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master', 5, 'FiveM Tools V7 changed everything for my server. We are now in the top 10 servers on CFX! The analytics and boost features are game-changers.', 'Eclipse RP', 30000, true, true, 'premium', NULL),
('AdminGamer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 4, 'Great service overall. The upvote delivery is fast and the pricing is fair. Customer support responded within minutes when I had questions.', 'NoPixel Clone', 12000, true, true, 'pro', NULL),
('FiveMDev', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev', 5, 'As a developer, I appreciate the clean API and reliable service. My clients love the results and I recommend this to all server owners.', 'Developer Server', 8000, true, true, 'verified', NULL),
('CommunityLeader', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leader', 5, 'Incredible results! Our server population doubled in the first month. The lifetime plan is worth every penny. Thank you FiveM Tools!', 'City Life RP', 20000, true, true, 'vip', NULL),
('ServerAdmin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ServerAdmin', 5, 'Professional service with real results. The upvotes helped us reach the top 20 servers. Support team is very helpful and responsive.', 'Mafia Roleplay', 18000, false, true, NULL, NULL),
('GamingPro', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gaming', 4, 'Good service, delivered as promised. The monthly plan is perfect for testing before committing to lifetime. Definitely recommend!', 'Street Racing RP', 10000, false, true, NULL, NULL),
('RPOwner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=RPOwner', 5, 'Best upvote service on the market! Fast delivery, great support, and amazing results. My server is thriving thanks to FiveM Tools V7!', 'Hardcore RP', 22000, true, true, 'premium', NULL),
('ServerHost', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host', 5, 'Outstanding service! The UDG system is powerful and easy to use. Got my server from 0 to 300 players in 3 weeks. Absolutely worth it!', 'Paradise City', 16000, true, true, 'verified', NULL)
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT COUNT(*) as total_testimonials FROM testimonials;
SELECT * FROM testimonials ORDER BY created_at DESC LIMIT 5;
