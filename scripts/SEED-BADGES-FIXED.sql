-- Seeding professional badges with your custom PNG assets and precise tiering
INSERT INTO badges (id, name, description, image_url, min_xp, max_xp, color, tier)
VALUES 
  ('tier-1', 'Beginner', 'Starting your journey in the FiveM world.', '/images/badge1.png', 0, 999, '#84cc16', 1),
  ('tier-2', 'Enthusiast', 'Showing active participation and growth.', '/images/badge2.png', 1000, 4999, '#a855f7', 2),
  ('tier-3', 'Expert', 'A well-known contributor with high expertise.', '/images/badge3.png', 5000, 14999, '#ef4444', 3),
  ('tier-4', 'Elite', 'One of the top members in our community.', '/images/badge4.png', 15000, 49999, '#0ea5e9', 4),
  ('tier-5', 'Legend', 'A legendary figure whose name is known by all.', '/images/badge5.png', 50000, NULL, '#eab308', 5)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  min_xp = EXCLUDED.min_xp,
  max_xp = EXCLUDED.max_xp,
  tier = EXCLUDED.tier;
