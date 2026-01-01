-- Fix spin wheel insert policy
CREATE POLICY "Users can insert own spins" ON public.spin_wheel FOR INSERT WITH CHECK (auth.uid() = user_id);
