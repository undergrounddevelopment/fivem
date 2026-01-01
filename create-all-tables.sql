-- Create all missing tables from backup
-- Based on the backup file structure

-- Create tables that don't exist
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID,
    user_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID,
    user_id UUID,
    review TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    file_url TEXT,
    image_url TEXT,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    balance_after INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day_number INTEGER NOT NULL,
    coins INTEGER NOT NULL,
    spin_tickets INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.daily_spin_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    tickets INTEGER DEFAULT 0,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    asset_id UUID,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dynamic_menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    link_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID,
    user_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_ranks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    min_posts INTEGER DEFAULT 0,
    color TEXT DEFAULT '#000000',
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID,
    user_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID,
    user_id UUID,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    reply_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.linkvertise_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    asset_id UUID,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    title TEXT NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.premium_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    asset_id UUID,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.redeem_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    reward_type TEXT NOT NULL,
    reward_value INTEGER NOT NULL,
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID,
    referred_id UUID,
    reward_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vip_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    asset_id UUID,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
DO $$
BEGIN
    -- Add foreign keys if users table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE public.activities ADD CONSTRAINT activities_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.asset_ratings ADD CONSTRAINT asset_ratings_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.asset_reviews ADD CONSTRAINT asset_reviews_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.coin_transactions ADD CONSTRAINT coin_transactions_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.daily_claims ADD CONSTRAINT daily_claims_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.daily_spin_tickets ADD CONSTRAINT daily_spin_tickets_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.downloads ADD CONSTRAINT downloads_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.forum_posts ADD CONSTRAINT forum_posts_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.forum_replies ADD CONSTRAINT forum_replies_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.forum_threads ADD CONSTRAINT forum_threads_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.likes ADD CONSTRAINT likes_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.linkvertise_downloads ADD CONSTRAINT linkvertise_downloads_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.payments ADD CONSTRAINT payments_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.premium_downloads ADD CONSTRAINT premium_downloads_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.referrals ADD CONSTRAINT referrals_referrer_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_fkey FOREIGN KEY (referred_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.vip_downloads ADD CONSTRAINT vip_downloads_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        ALTER TABLE public.wallet_transactions ADD CONSTRAINT wallet_transactions_users_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add other foreign keys
    ALTER TABLE public.asset_ratings ADD CONSTRAINT asset_ratings_assets_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
    ALTER TABLE public.asset_reviews ADD CONSTRAINT asset_reviews_assets_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
    ALTER TABLE public.downloads ADD CONSTRAINT downloads_assets_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
    ALTER TABLE public.forum_posts ADD CONSTRAINT forum_posts_threads_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id) ON DELETE CASCADE;
    ALTER TABLE public.forum_replies ADD CONSTRAINT forum_replies_threads_fkey FOREIGN KEY (thread_id) REFERENCES public.forum_threads(id) ON DELETE CASCADE;
    ALTER TABLE public.forum_threads ADD CONSTRAINT forum_threads_categories_fkey FOREIGN KEY (category_id) REFERENCES public.forum_categories(id) ON DELETE SET NULL;
    ALTER TABLE public.linkvertise_downloads ADD CONSTRAINT linkvertise_downloads_assets_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
    ALTER TABLE public.premium_downloads ADD CONSTRAINT premium_downloads_assets_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
END
$$;
