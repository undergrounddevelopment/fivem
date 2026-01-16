
ALTER TABLE public.spin_wheel_history 
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed';
