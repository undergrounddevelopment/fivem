-- This script sets up the forum leveling system.

-- Step 1: Create the forum_ranks table
CREATE TABLE IF NOT EXISTS forum_ranks (
  level INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  badge_url TEXT
);

-- Step 2: Add columns to the users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Step 3: Seed the forum_ranks table
INSERT INTO forum_ranks (level, name, xp_required, badge_url)
VALUES
  (1, 'Newbie', 0, '/badges/rank_1.png'),
  (2, 'Member', 100, '/badges/rank_2.png'),
  (3, 'Active Member', 500, '/badges/rank_3.png'),
  (4, 'Veteran', 1500, '/badges/rank_4.png'),
  (5, 'Legend', 5000, '/badges/rank_5.png')
ON CONFLICT (level) DO NOTHING;

-- Step 4: Create the function to award XP and update rank
CREATE OR REPLACE FUNCTION award_xp_and_update_rank(p_user_id TEXT, xp_to_add INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
  rank_info RECORD;
BEGIN
  -- Update user's XP
  UPDATE users
  SET xp = xp + xp_to_add
  WHERE discord_id = p_user_id
  RETURNING xp, level INTO new_xp, new_level;

  -- Check for level up
  SELECT * INTO rank_info FROM forum_ranks
  WHERE xp_required <= new_xp
  ORDER BY level DESC
  LIMIT 1;

  IF FOUND AND rank_info.level > new_level THEN
    UPDATE users
    SET level = rank_info.level
    WHERE discord_id = p_user_id;

    INSERT INTO notifications (user_id, type, related_id)
    VALUES (p_user_id, 'new_rank', rank_info.name);
  END IF;
END;
$$;

-- Step 5: Create triggers for forum activity
CREATE OR REPLACE FUNCTION award_xp_for_thread()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM award_xp_and_update_rank(NEW.author_id, 15);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_thread ON forum_threads;
CREATE TRIGGER on_new_thread
AFTER INSERT ON forum_threads
FOR EACH ROW
EXECUTE FUNCTION award_xp_for_thread();

CREATE OR REPLACE FUNCTION award_xp_for_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM award_xp_and_update_rank(NEW.author_id, 5);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_reply ON forum_replies;
CREATE TRIGGER on_new_reply
AFTER INSERT ON forum_replies
FOR EACH ROW
EXECUTE FUNCTION award_xp_for_reply();
