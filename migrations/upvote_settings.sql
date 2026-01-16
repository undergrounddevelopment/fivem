-- Create upvote_settings table for admin panel configuration
CREATE TABLE IF NOT EXISTS upvote_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_upvotes INTEGER NOT NULL DEFAULT 1,
    max_upvotes INTEGER NOT NULL DEFAULT 50000,
    default_upvotes INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO upvote_settings (min_upvotes, max_upvotes, default_upvotes)
VALUES (1, 50000, 100)
ON CONFLICT DO NOTHING;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_upvote_settings_updated ON upvote_settings(updated_at DESC);
