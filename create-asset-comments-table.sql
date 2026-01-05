-- Create asset_comments table
CREATE TABLE IF NOT EXISTS asset_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_asset_comments_asset_id ON asset_comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_comments_user_id ON asset_comments(user_id);

-- Enable RLS
ALTER TABLE asset_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view comments" ON asset_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON asset_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own comments" ON asset_comments FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own comments" ON asset_comments FOR DELETE USING (auth.uid()::text = user_id);
