-- 1. Fix Function Search Paths (Security Best Practice)

-- Triggers (take no arguments)
ALTER FUNCTION public.update_thread_likes_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_thread_reply_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_user_level_and_badge() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_asset_rating() SET search_path = public, pg_temp;
ALTER FUNCTION public.award_xp_for_reply() SET search_path = public, pg_temp;
ALTER FUNCTION public.award_xp_for_thread() SET search_path = public, pg_temp;

-- RPCs / Helper Functions
-- Note: Matching signatures from backup_clean_utf8.sql (user_id is TEXT in existing functions)
ALTER FUNCTION public.handle_daily_claim(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_level(integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_current_badge(integer) SET search_path = public, pg_temp;

-- Assuming award_xp also uses text for user_id based on handle_daily_claim convention
ALTER FUNCTION public.award_xp(text, integer, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.award_xp_and_update_rank(text, integer) SET search_path = public, pg_temp;

-- 2. Enable RLS on Public Tables
ALTER TABLE IF EXISTS public.temp_spin_history ENABLE ROW LEVEL SECURITY;

-- 3. Fix "Always True" Service Role Policies
-- Activity Logs
DROP POLICY IF EXISTS "Service role full access activities" ON public.activities;
CREATE POLICY "Service role full access activities" ON public.activities TO service_role USING (true) WITH CHECK (true);

-- Announcements
DROP POLICY IF EXISTS "Allow service role all announcements" ON public.announcements;
CREATE POLICY "Allow service role all announcements" ON public.announcements TO service_role USING (true) WITH CHECK (true);

-- Asset Ratings & Reviews
DROP POLICY IF EXISTS "Service role full access ratings" ON public.asset_ratings;
CREATE POLICY "Service role full access ratings" ON public.asset_ratings TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access asset_reviews" ON public.asset_reviews;
CREATE POLICY "Service role full access asset_reviews" ON public.asset_reviews TO service_role USING (true) WITH CHECK (true);

-- Assets
DROP POLICY IF EXISTS "Admins full access assets" ON public.assets;
CREATE POLICY "Admins full access assets" ON public.assets TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access assets" ON public.assets;
CREATE POLICY "Service role full access assets" ON public.assets TO service_role USING (true) WITH CHECK (true);

-- Banners
DROP POLICY IF EXISTS "Allow service role all banners" ON public.banners;
CREATE POLICY "Allow service role all banners" ON public.banners TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access banners" ON public.banners;
CREATE POLICY "Service role full access banners" ON public.banners TO service_role USING (true) WITH CHECK (true);

-- Daily Rewards & Tickets
DROP POLICY IF EXISTS "Service role full access daily_rewards" ON public.daily_rewards;
CREATE POLICY "Service role full access daily_rewards" ON public.daily_rewards TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role all daily_spin_tickets" ON public.daily_spin_tickets;
CREATE POLICY "Allow service role all daily_spin_tickets" ON public.daily_spin_tickets TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage tickets" ON public.daily_spin_tickets;
CREATE POLICY "Service role can manage tickets" ON public.daily_spin_tickets TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access daily_spin_tickets" ON public.daily_spin_tickets;
CREATE POLICY "Service role full access daily_spin_tickets" ON public.daily_spin_tickets TO service_role USING (true) WITH CHECK (true);

-- Downloads
DROP POLICY IF EXISTS "Service role full access downloads" ON public.downloads;
CREATE POLICY "Service role full access downloads" ON public.downloads TO service_role USING (true) WITH CHECK (true);

-- Likes
DROP POLICY IF EXISTS "Service role full access likes" ON public.likes;
CREATE POLICY "Service role full access likes" ON public.likes TO service_role USING (true) WITH CHECK (true);

-- Messages
DROP POLICY IF EXISTS "Service role full access messages" ON public.messages;
CREATE POLICY "Service role full access messages" ON public.messages TO service_role USING (true) WITH CHECK (true);

-- Notifications
DROP POLICY IF EXISTS "Service role full access notifications" ON public.notifications;
CREATE POLICY "Service role full access notifications" ON public.notifications TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access public_notifications" ON public.public_notifications;
CREATE POLICY "Service role full access public_notifications" ON public.public_notifications TO service_role USING (true) WITH CHECK (true);

-- Reports
DROP POLICY IF EXISTS "Admins full access reports" ON public.reports;
CREATE POLICY "Admins full access reports" ON public.reports TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access reports" ON public.reports;
CREATE POLICY "Service role full access reports" ON public.reports TO service_role USING (true) WITH CHECK (true);

-- Site Settings
DROP POLICY IF EXISTS "Service role full access site_settings" ON public.site_settings;
CREATE POLICY "Service role full access site_settings" ON public.site_settings TO service_role USING (true) WITH CHECK (true);

-- Spin History & Users
DROP POLICY IF EXISTS "Allow service role all spin_history" ON public.spin_history;
CREATE POLICY "Allow service role all spin_history" ON public.spin_history TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage history" ON public.spin_history;
CREATE POLICY "Service role can manage history" ON public.spin_history TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access spin_history" ON public.spin_history;
CREATE POLICY "Service role full access spin_history" ON public.spin_history TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage eligible users" ON public.spin_wheel_eligible_users;
CREATE POLICY "Service role can manage eligible users" ON public.spin_wheel_eligible_users TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access spin_wheel_eligible_users" ON public.spin_wheel_eligible_users;
CREATE POLICY "Service role full access spin_wheel_eligible_users" ON public.spin_wheel_eligible_users TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage force wins" ON public.spin_wheel_force_wins;
CREATE POLICY "Service role can manage force wins" ON public.spin_wheel_force_wins TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access spin_wheel_force_wins" ON public.spin_wheel_force_wins;
CREATE POLICY "Service role full access spin_wheel_force_wins" ON public.spin_wheel_force_wins TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role all testimonials" ON public.testimonials;
CREATE POLICY "Allow service role all testimonials" ON public.testimonials TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins full access users" ON public.users;
CREATE POLICY "Admins full access users" ON public.users TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access users" ON public.users;
CREATE POLICY "Service role full access users" ON public.users TO service_role USING (true) WITH CHECK (true);


-- 4. Harden User Policies (Replace 'true' with Owner Checks)
-- Assets (author_id)
DROP POLICY IF EXISTS "Authenticated users can create assets" ON public.assets;
CREATE POLICY "Authenticated users can create assets" ON public.assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own assets" ON public.assets;
CREATE POLICY "Authors can update own assets" ON public.assets FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Activities (user_id)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.activities;
CREATE POLICY "Enable insert for authenticated users only" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert activities" ON public.activities;
CREATE POLICY "Users can insert activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Spin History (user_id)
DROP POLICY IF EXISTS "Users can insert own spin history" ON public.spin_history;
CREATE POLICY "Users can insert own spin history" ON public.spin_history FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

-- Daily Tickets (user_id)
DROP POLICY IF EXISTS "Users can insert own daily tickets" ON public.daily_spin_tickets;
CREATE POLICY "Users can insert own daily tickets" ON public.daily_spin_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);
