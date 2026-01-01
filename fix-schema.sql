-- Fix Database Schema - Add Missing Columns
-- Run this to fix forum_categories and other missing columns

-- Add color column to forum_categories
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';

-- Add missing columns to other tables if needed
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'message-circle';
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 1;

-- Update existing categories with proper colors
UPDATE forum_categories SET 
  color = CASE 
    WHEN name ILIKE '%announcement%' THEN '#EF4444'
    WHEN name ILIKE '%general%' THEN '#22C55E'
    WHEN name ILIKE '%help%' THEN '#F59E0B'
    WHEN name ILIKE '%request%' THEN '#3B82F6'
    WHEN name ILIKE '%showcase%' THEN '#EC4899'
    WHEN name ILIKE '%marketplace%' THEN '#8B5CF6'
    ELSE '#3B82F6'
  END,
  icon = CASE 
    WHEN name ILIKE '%announcement%' THEN 'megaphone'
    WHEN name ILIKE '%general%' THEN 'message-circle'
    WHEN name ILIKE '%help%' THEN 'help-circle'
    WHEN name ILIKE '%request%' THEN 'code'
    WHEN name ILIKE '%showcase%' THEN 'star'
    WHEN name ILIKE '%marketplace%' THEN 'shopping-bag'
    ELSE 'message-circle'
  END;

-- Ensure spin_wheel_prizes has default prizes
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