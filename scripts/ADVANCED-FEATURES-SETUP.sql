-- This script sets up the database schema for advanced features.

-- 1. User Profiles: Add a bio column to the users table.
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Asset Reviews: Create tables and triggers for asset ratings and reviews.
CREATE TABLE IF NOT EXISTS asset_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(asset_id, user_id)
);

ALTER TABLE assets ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.00;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION update_asset_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE assets
  SET
    average_rating = (SELECT AVG(rating) FROM asset_reviews WHERE asset_id = NEW.asset_id),
    rating_count = (SELECT COUNT(*) FROM asset_reviews WHERE asset_id = NEW.asset_id)
  WHERE id = NEW.asset_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_review ON asset_reviews;
CREATE TRIGGER on_new_review
AFTER INSERT OR UPDATE OR DELETE ON asset_reviews
FOR EACH ROW
EXECUTE FUNCTION update_asset_rating();

-- 3. Notifications: Create the notifications table.
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id TEXT,
  actor_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
