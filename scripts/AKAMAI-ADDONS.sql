CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_id, target_type);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  reporter_id VARCHAR(255) NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_id, type);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

CREATE TABLE IF NOT EXISTS public_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  created_by VARCHAR(255) REFERENCES users(discord_id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_notifications_active ON public_notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_public_notifications_created ON public_notifications(created_at DESC);
