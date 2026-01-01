-- Full backup import script
-- This will create all missing tables and import all data

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Drop existing tables to ensure clean import
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.asset_ratings CASCADE;
DROP TABLE IF EXISTS public.asset_reviews CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.coin_transactions CASCADE;
DROP TABLE IF EXISTS public.daily_claims CASCADE;
DROP TABLE IF EXISTS public.daily_rewards CASCADE;
DROP TABLE IF EXISTS public.daily_spin_tickets CASCADE;
DROP TABLE IF EXISTS public.downloads CASCADE;
DROP TABLE IF EXISTS public.dynamic_menus CASCADE;
DROP TABLE IF EXISTS public.forum_categories CASCADE;
DROP TABLE IF EXISTS public.forum_posts CASCADE;
DROP TABLE IF EXISTS public.forum_ranks CASCADE;
DROP TABLE IF EXISTS public.forum_replies CASCADE;
DROP TABLE IF EXISTS public.forum_threads CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.linkvertise_downloads CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.premium_downloads CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.redeem_codes CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.spin_history CASCADE;
DROP TABLE IF EXISTS public.spin_wheel CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.vip_downloads CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Now import the full backup
-- This will be executed by running the original backup file
