-- Fix tables with proper references and create missing ones
-- Check users table structure first
\d public.users

-- Create settings table (no dependencies)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards table (no dependencies)
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('coins', 'spin_ticket', 'download', 'special')),
    value INTEGER NOT NULL,
    cost INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    requirements JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (check if users.id is primary key)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bio TEXT,
    discord_username TEXT,
    discord_avatar TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    favorite_cars TEXT[],
    settings JSONB DEFAULT '{}',
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Add foreign key constraint if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_users_fkey 
            FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Create other tables with conditional foreign keys
CREATE TABLE IF NOT EXISTS public.spin_wheel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    prize_type TEXT NOT NULL,
    prize_value INTEGER NOT NULL,
    spin_cost INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_won BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE public.spin_wheel ADD CONSTRAINT spin_wheel_users_fkey 
            FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.coins_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'admin', 'refund')),
    source TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    balance_after INTEGER NOT NULL
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE public.coins_transactions ADD CONSTRAINT coins_transactions_users_fkey 
            FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_users_fkey 
            FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_id UUID,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured_image TEXT,
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE public.posts ADD CONSTRAINT posts_users_fkey 
            FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Enable RLS only on tables that exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings' AND table_schema = 'public') THEN
        ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spin_wheel' AND table_schema = 'public') THEN
        ALTER TABLE public.spin_wheel ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coins_transactions' AND table_schema = 'public') THEN
        ALTER TABLE public.coins_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rewards' AND table_schema = 'public') THEN
        ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_logs' AND table_schema = 'public') THEN
        ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') THEN
        ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS coins_transactions_user_id_idx ON public.coins_transactions(user_id);
CREATE INDEX IF NOT EXISTS coins_transactions_created_at_idx ON public.coins_transactions(created_at);
CREATE INDEX IF NOT EXISTS spin_wheel_user_id_idx ON public.spin_wheel(user_id);
CREATE INDEX IF NOT EXISTS spin_wheel_created_at_idx ON public.spin_wheel(created_at);
CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON public.admin_logs(created_at);
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON public.posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON public.posts(published_at);

-- Insert default data
INSERT INTO public.settings (key, value, description) VALUES
('site_name', '"FiveM Tools"', 'Site name'),
('site_description', '"Best FiveM tools and resources"', 'Site description'),
('coins_per_download', '10', 'Coins awarded per download'),
('spin_cost', '10', 'Cost per spin in coins'),
('daily_bonus_coins', '50', 'Daily login bonus coins'),
('max_downloads_per_day', '5', 'Maximum downloads per free user'),
('enable_registration', 'true', 'Allow new user registration')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.rewards (name, description, type, value, cost, is_active) VALUES
('100 Coins', 'Get 100 coins for your account', 'coins', 100, 500, true),
('Spin Ticket x3', 'Get 3 free spin tickets', 'spin_ticket', 3, 300, true),
('Extra Download', 'Get 1 extra download slot', 'download', 1, 200, true),
('VIP Access', '1 week VIP access', 'special', 7, 1000, true)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
