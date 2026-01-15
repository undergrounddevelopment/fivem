
-- 1. Ensure columns exist
ALTER TABLE banners ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'home';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 2. Clear existing community banners to prevent duplicates
DELETE FROM banners WHERE position = 'community';

-- 3. Insert Community Banners
INSERT INTO banners (title, image_url, position, order_index, is_active) VALUES
('Community Banner 1', '/bann/Comp_1_iteration_2.gif', 'community', 0, true),
('Community Banner 2', '/bann/SSZ_Signature.gif.998f970435dd066c4b4b504dad332be3_2-ezgif.com-video-to-gif-converter.gif', 'community', 1, true),
('Community Banner 3', '/bann/banner_1_iteration_1.gif', 'community', 2, true),
('Community Banner 4', '/bann/render_iteration_1.gif', 'community', 3, true),
('Community Banner 5', '/bann/sad.gif', 'community', 4, true);

-- 4. Verify
SELECT count(*) as total_banners, position FROM banners GROUP BY position;
