-- ADVISOR CENTER FIXES (Security & Performance)
-- Date: 2026-01-17
-- Scope: Public Schema (Scoped to avoid permission issues)

-- [1] Security: Enable RLS on remaining tables
ALTER TABLE IF EXISTS public.spin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.spin_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.temp_spin_history ENABLE ROW LEVEL SECURITY;

-- [2] Security Policies for newly enabled tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spin_settings' AND policyname = 'Enable all for authenticated users') THEN
        CREATE POLICY "Enable all for authenticated users" ON public.spin_settings
        FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spin_prizes' AND policyname = 'ReadOnly for public') THEN
        CREATE POLICY "ReadOnly for public" ON public.spin_prizes
        FOR SELECT TO public USING (true);
    END IF;
END $$;

-- [3] Performance: Add missing indexes for Foreign Keys (Public Schema)

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_asset_id ON public.comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_menus_parent_id ON public.dynamic_menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_post_id ON public.forum_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_thread_id ON public.forum_likes(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON public.forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_public_notifications_asset_id ON public.public_notifications(asset_id);
CREATE INDEX IF NOT EXISTS idx_reviews_asset_id ON public.reviews(asset_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON public.site_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_spin_wheel_history_prize_id ON public.spin_wheel_history(prize_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);

-- [4] Performance Check
ANALYZE public.activity_logs;
ANALYZE public.comments;
ANALYZE public.forum_threads;
ANALYZE public.spin_wheel_history;
