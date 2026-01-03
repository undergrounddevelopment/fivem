-- Quick Fix: Add missing creator_id column
ALTER TABLE assets ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assets' AND column_name = 'creator_id';