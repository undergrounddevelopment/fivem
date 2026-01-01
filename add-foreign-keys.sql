-- Add foreign key constraints now that we know users table has id field
-- Run this after creating the tables

-- Add foreign key to profiles table
ALTER TABLE public.profiles ADD CONSTRAINT profiles_users_fkey 
    FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key to spin_wheel table  
ALTER TABLE public.spin_wheel ADD CONSTRAINT spin_wheel_users_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key to coins_transactions table
ALTER TABLE public.coins_transactions ADD CONSTRAINT coins_transactions_users_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add foreign key to admin_logs table
ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_users_fkey 
    FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add foreign key to posts table
ALTER TABLE public.posts ADD CONSTRAINT posts_users_fkey 
    FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Create RLS policies for the new tables
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Settings policies (admin only)
CREATE POLICY "Admins can view settings" ON public.settings FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));
CREATE POLICY "Admins can insert settings" ON public.settings FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

-- Spin wheel policies
CREATE POLICY "Users can view own spins" ON public.spin_wheel FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spins" ON public.spin_wheel FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coins transactions policies
CREATE POLICY "Users can view own transactions" ON public.coins_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.coins_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rewards policies (public read, admin write)
CREATE POLICY "Everyone can view active rewards" ON public.rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage rewards" ON public.rewards FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

-- Admin logs policies (admin only)
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));
CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

-- Posts policies
CREATE POLICY "Everyone can view published posts" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage posts" ON public.posts FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
));

-- Create profiles for existing users
INSERT INTO public.profiles (id, username, discord_username, discord_avatar, level, xp, total_downloads)
SELECT 
    id, 
    username, 
    username,
    avatar,
    level,
    xp,
    downloads
FROM public.users 
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coins_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
