-- Fix spin_wheel table with proper RLS policies
ALTER TABLE public.spin_wheel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spins" ON public.spin_wheel FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spins" ON public.spin_wheel FOR INSERT WITH CHECK (auth.uid() = user_id);
