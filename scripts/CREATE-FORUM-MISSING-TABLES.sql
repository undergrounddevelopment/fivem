-- ============================================
-- FORUM MISSING TABLES - 100% COMPLETION
-- ============================================
-- Run this in Supabase SQL Editor
-- Purpose: Add missing tables for full forum functionality

-- 1. FORUM BOOKMARKS TABLE
-- Allows users to save/bookmark threads
CREATE TABLE IF NOT EXISTS forum_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_thread_bookmark UNIQUE(user_id, thread_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON forum_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_thread_id ON forum_bookmarks(thread_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON forum_bookmarks(created_at DESC);

COMMENT ON TABLE forum_bookmarks IS 'User saved/bookmarked threads';
COMMENT ON COLUMN forum_bookmarks.user_id IS 'User who bookmarked';
COMMENT ON COLUMN forum_bookmarks.thread_id IS 'Bookmarked thread';

-- 2. NESTED REPLIES SUPPORT
-- Add parent_reply_id to support reply-to-reply
ALTER TABLE forum_replies 
ADD COLUMN IF NOT EXISTS parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_replies_parent_id ON forum_replies(parent_reply_id);

COMMENT ON COLUMN forum_replies.parent_reply_id IS 'Parent reply ID for nested replies';

-- 3. DISLIKES SUPPORT
-- Add dislikes column to threads and replies
ALTER TABLE forum_threads 
ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0 CHECK (dislikes >= 0);

ALTER TABLE forum_replies 
ADD COLUMN IF NOT EXISTS dislikes INTEGER DEFAULT 0 CHECK (dislikes >= 0);

COMMENT ON COLUMN forum_threads.dislikes IS 'Number of dislikes on thread';
COMMENT ON COLUMN forum_replies.dislikes IS 'Number of dislikes on reply';

-- 4. FORUM DISLIKES TABLE (Alternative approach - more detailed)
-- Tracks individual dislike actions
CREATE TABLE IF NOT EXISTS forum_dislikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('thread', 'reply')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_target_dislike UNIQUE(user_id, target_id, target_type)
);

CREATE INDEX IF NOT EXISTS idx_dislikes_user_id ON forum_dislikes(user_id);
CREATE INDEX IF NOT EXISTS idx_dislikes_target ON forum_dislikes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_dislikes_created_at ON forum_dislikes(created_at DESC);

COMMENT ON TABLE forum_dislikes IS 'Individual dislike actions on threads/replies';

-- 5. FORUM ATTACHMENTS TABLE
-- Store images and files attached to threads/replies
CREATE TABLE IF NOT EXISTS forum_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_thread_or_reply CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR 
    (thread_id IS NULL AND reply_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_attachments_thread_id ON forum_attachments(thread_id);
CREATE INDEX IF NOT EXISTS idx_attachments_reply_id ON forum_attachments(reply_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON forum_attachments(created_at DESC);

COMMENT ON TABLE forum_attachments IS 'File attachments for threads and replies';
COMMENT ON CONSTRAINT check_thread_or_reply ON forum_attachments IS 'Attachment must belong to either thread or reply, not both';

-- 6. FORUM MENTIONS TABLE
-- Track @mentions in threads and replies
CREATE TABLE IF NOT EXISTS forum_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentioner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_mention_thread_or_reply CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR 
    (thread_id IS NULL AND reply_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user ON forum_mentions(mentioned_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_mentions_thread_id ON forum_mentions(thread_id);
CREATE INDEX IF NOT EXISTS idx_mentions_reply_id ON forum_mentions(reply_id);
CREATE INDEX IF NOT EXISTS idx_mentions_created_at ON forum_mentions(created_at DESC);

COMMENT ON TABLE forum_mentions IS 'User mentions in forum content';
COMMENT ON COLUMN forum_mentions.mentioned_user_id IS 'User who was mentioned';
COMMENT ON COLUMN forum_mentions.mentioner_user_id IS 'User who mentioned';

-- 7. FORUM SEARCH INDEX
-- Full-text search support for threads
ALTER TABLE forum_threads 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION forum_threads_search_vector_update() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic search vector update
DROP TRIGGER IF EXISTS forum_threads_search_vector_trigger ON forum_threads;
CREATE TRIGGER forum_threads_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, content
  ON forum_threads
  FOR EACH ROW
  EXECUTE FUNCTION forum_threads_search_vector_update();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_forum_threads_search_vector 
  ON forum_threads USING GIN(search_vector);

-- Update existing threads with search vectors
UPDATE forum_threads 
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'B')
WHERE search_vector IS NULL;

COMMENT ON COLUMN forum_threads.search_vector IS 'Full-text search vector for title and content';

-- 8. FORUM EDIT HISTORY TABLE
-- Track edits to threads and replies
CREATE TABLE IF NOT EXISTS forum_edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  editor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_content TEXT NOT NULL,
  new_content TEXT NOT NULL,
  edit_reason VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_edit_thread_or_reply CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR 
    (thread_id IS NULL AND reply_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_edit_history_thread_id ON forum_edit_history(thread_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_reply_id ON forum_edit_history(reply_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_editor ON forum_edit_history(editor_user_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_created_at ON forum_edit_history(created_at DESC);

COMMENT ON TABLE forum_edit_history IS 'Edit history for threads and replies';

-- 9. FORUM VIEWS TABLE (Detailed tracking)
-- Track individual thread views for analytics
CREATE TABLE IF NOT EXISTS forum_thread_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thread_views_thread_id ON forum_thread_views(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_views_user_id ON forum_thread_views(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_views_viewed_at ON forum_thread_views(viewed_at DESC);

COMMENT ON TABLE forum_thread_views IS 'Detailed thread view tracking';

-- 10. FORUM POLLS TABLE (Bonus feature)
-- Add poll functionality to threads
CREATE TABLE IF NOT EXISTS forum_polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of poll options
  allow_multiple BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_thread_poll UNIQUE(thread_id)
);

CREATE INDEX IF NOT EXISTS idx_polls_thread_id ON forum_polls(thread_id);
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON forum_polls(expires_at);

COMMENT ON TABLE forum_polls IS 'Polls attached to forum threads';

-- 11. FORUM POLL VOTES TABLE
CREATE TABLE IF NOT EXISTS forum_poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES forum_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_poll_option UNIQUE(poll_id, user_id, option_index)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON forum_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON forum_poll_votes(user_id);

COMMENT ON TABLE forum_poll_votes IS 'User votes on forum polls';

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE forum_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_dislikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_thread_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_poll_votes ENABLE ROW LEVEL SECURITY;

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON forum_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON forum_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON forum_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Dislikes policies (similar to likes)
CREATE POLICY "Anyone can view dislikes" ON forum_dislikes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can dislike" ON forum_dislikes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their dislikes" ON forum_dislikes
  FOR DELETE USING (auth.uid() = user_id);

-- Attachments policies
CREATE POLICY "Anyone can view attachments" ON forum_attachments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload attachments" ON forum_attachments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Mentions policies
CREATE POLICY "Users can view their mentions" ON forum_mentions
  FOR SELECT USING (auth.uid() = mentioned_user_id);

CREATE POLICY "Authenticated users can create mentions" ON forum_mentions
  FOR INSERT WITH CHECK (auth.uid() = mentioner_user_id);

CREATE POLICY "Users can mark mentions as read" ON forum_mentions
  FOR UPDATE USING (auth.uid() = mentioned_user_id);

-- Thread views policies
CREATE POLICY "Anyone can create thread views" ON forum_thread_views
  FOR INSERT WITH CHECK (true);

-- Polls policies
CREATE POLICY "Anyone can view polls" ON forum_polls
  FOR SELECT USING (true);

CREATE POLICY "Thread authors can create polls" ON forum_polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forum_threads 
      WHERE id = thread_id AND author_id = auth.uid()
    )
  );

-- Poll votes policies
CREATE POLICY "Anyone can view poll votes" ON forum_poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON forum_poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get thread with all related data
CREATE OR REPLACE FUNCTION get_thread_with_details(thread_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'thread', row_to_json(t.*),
    'author', row_to_json(u.*),
    'replies_count', (SELECT COUNT(*) FROM forum_replies WHERE thread_id = thread_uuid AND is_deleted = false),
    'bookmarks_count', (SELECT COUNT(*) FROM forum_bookmarks WHERE thread_id = thread_uuid),
    'attachments', (SELECT json_agg(row_to_json(a.*)) FROM forum_attachments a WHERE a.thread_id = thread_uuid)
  ) INTO result
  FROM forum_threads t
  LEFT JOIN users u ON t.author_id = u.id
  WHERE t.id = thread_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to increment thread views safely
CREATE OR REPLACE FUNCTION increment_thread_views(thread_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_threads 
  SET views = COALESCE(views, 0) + 1 
  WHERE id = thread_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all tables exist
DO $$
DECLARE
  tables TEXT[] := ARRAY[
    'forum_bookmarks',
    'forum_dislikes',
    'forum_attachments',
    'forum_mentions',
    'forum_edit_history',
    'forum_thread_views',
    'forum_polls',
    'forum_poll_votes'
  ];
  tbl TEXT;
  count INTEGER;
BEGIN
  RAISE NOTICE '=== FORUM TABLES VERIFICATION ===';
  FOREACH tbl IN ARRAY tables LOOP
    SELECT COUNT(*) INTO count 
    FROM information_schema.tables 
    WHERE table_name = tbl;
    
    IF count > 0 THEN
      RAISE NOTICE '✅ % exists', tbl;
    ELSE
      RAISE NOTICE '❌ % missing', tbl;
    END IF;
  END LOOP;
  RAISE NOTICE '=== VERIFICATION COMPLETE ===';
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 FORUM MISSING TABLES CREATED SUCCESSFULLY!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Created Tables:';
  RAISE NOTICE '   - forum_bookmarks (save threads)';
  RAISE NOTICE '   - forum_dislikes (dislike system)';
  RAISE NOTICE '   - forum_attachments (file uploads)';
  RAISE NOTICE '   - forum_mentions (@user mentions)';
  RAISE NOTICE '   - forum_edit_history (edit tracking)';
  RAISE NOTICE '   - forum_thread_views (view analytics)';
  RAISE NOTICE '   - forum_polls (poll feature)';
  RAISE NOTICE '   - forum_poll_votes (poll voting)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Added Columns:';
  RAISE NOTICE '   - forum_replies.parent_reply_id (nested replies)';
  RAISE NOTICE '   - forum_threads.dislikes (dislike count)';
  RAISE NOTICE '   - forum_replies.dislikes (dislike count)';
  RAISE NOTICE '   - forum_threads.search_vector (full-text search)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Created Indexes: 20+ indexes for performance';
  RAISE NOTICE '✅ RLS Policies: Enabled on all tables';
  RAISE NOTICE '✅ Helper Functions: 2 utility functions';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Create API endpoints for new features';
  RAISE NOTICE '   2. Update frontend components';
  RAISE NOTICE '   3. Test all functionality';
  RAISE NOTICE '';
END $$;
