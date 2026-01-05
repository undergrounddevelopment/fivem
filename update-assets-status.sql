-- Add a CHECK constraint to the `status` column in the `assets` table
ALTER TABLE assets
ADD CONSTRAINT chk_assets_status CHECK (status IN ('pending', 'active', 'approved', 'featured'));

-- Update existing rows to ensure they comply with the new constraint
UPDATE assets
SET status = 'pending'
WHERE status NOT IN ('pending', 'active', 'approved', 'featured');