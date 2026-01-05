-- Fix assets table columns to match CSV data
ALTER TABLE assets ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS download_link TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS features TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS installation TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS youtube_link TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS github_link TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS docs_link TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS linkvertise_url TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS require_linkvertise BOOLEAN DEFAULT FALSE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;

-- Copy data from old columns if they exist
UPDATE assets SET thumbnail = thumbnail_url WHERE thumbnail IS NULL AND thumbnail_url IS NOT NULL;
UPDATE assets SET download_link = download_url WHERE download_link IS NULL AND download_url IS NOT NULL;

-- Verify columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'assets' ORDER BY column_name;