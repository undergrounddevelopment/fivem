// Auto Database Setup Script
// This script automatically creates all required tables in Supabase

const { Pool } = require("pg")

const DATABASE_URL =
  "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const SQL_SETUP = `
-- ============================================
-- ADMIN FEATURES COMPLETE SETUP
-- ============================================

-- 1. Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  position VARCHAR(50) DEFAULT 'top' CHECK (position IN ('top', 'hero', 'sidebar', 'footer', 'popup')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'free', 'vip', 'admin')),
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'promo', 'maintenance', 'update')),
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  link TEXT,
  link_text VARCHAR(100),
  background_color VARCHAR(20),
  text_color VARCHAR(20),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  dismiss_count INTEGER DEFAULT 0,
  target_audience VARCHAR(50) DEFAULT 'all',
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create file_uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  upload_type VARCHAR(50) DEFAULT 'general',
  checksum VARCHAR(64),
  is_public BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create daily_claims table
CREATE TABLE IF NOT EXISTS daily_claims (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  claim_type VARCHAR(50) DEFAULT 'spin_ticket',
  streak INTEGER DEFAULT 1,
  claimed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create announcement_dismissals table
CREATE TABLE IF NOT EXISTS announcement_dismissals (
  id SERIAL PRIMARY KEY,
  announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- 6. Create banner_clicks table
CREATE TABLE IF NOT EXISTS banner_clicks (
  id SERIAL PRIMARY KEY,
  banner_id INTEGER REFERENCES banners(id) ON DELETE CASCADE,
  user_id VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100),
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  category VARCHAR(50) DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create spin_wheel_prizes if not exists
CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  type VARCHAR(50) DEFAULT 'coins',
  color VARCHAR(20) DEFAULT '#3B82F6',
  probability DECIMAL(5,4) DEFAULT 0.1,
  is_active BOOLEAN DEFAULT true,
  is_jackpot BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create spin_history if not exists
CREATE TABLE IF NOT EXISTS spin_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  prize_id INTEGER REFERENCES spin_wheel_prizes(id),
  prize_name VARCHAR(100),
  prize_value INTEGER,
  prize_type VARCHAR(50),
  spin_type VARCHAR(50) DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create spin_wheel_force_wins table
CREATE TABLE IF NOT EXISTS spin_wheel_force_wins (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  discord_id VARCHAR(100),
  prize_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  reason TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Create forum_categories if not exists
CREATE TABLE IF NOT EXISTS forum_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'MessageSquare',
  color VARCHAR(20) DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Create indexes
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_claims_user ON daily_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_spin_history_user ON spin_history(user_id);

-- 14. Insert default spin prizes if empty
INSERT INTO spin_wheel_prizes (name, value, type, color, probability, is_active, is_jackpot, icon)
SELECT * FROM (VALUES 
  ('10 Coins', 10, 'coins', '#10B981', 0.25, true, false, 'Coins'),
  ('25 Coins', 25, 'coins', '#3B82F6', 0.20, true, false, 'Coins'),
  ('50 Coins', 50, 'coins', '#8B5CF6', 0.15, true, false, 'Coins'),
  ('100 Coins', 100, 'coins', '#F59E0B', 0.10, true, false, 'Coins'),
  ('250 Coins', 250, 'coins', '#EF4444', 0.08, true, false, 'Coins'),
  ('500 Coins', 500, 'coins', '#EC4899', 0.05, true, false, 'Coins'),
  ('Extra Spin', 1, 'ticket', '#06B6D4', 0.10, true, false, 'Ticket'),
  ('JACKPOT 1000', 1000, 'coins', '#FFD700', 0.02, true, true, 'Trophy'),
  ('Try Again', 0, 'nothing', '#6B7280', 0.05, true, false, 'X')
) AS v(name, value, type, color, probability, is_active, is_jackpot, icon)
WHERE NOT EXISTS (SELECT 1 FROM spin_wheel_prizes LIMIT 1);

-- 15. Insert default forum categories if empty
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order)
SELECT * FROM (VALUES
  ('General Discussion', 'general', 'General topics and discussions', 'MessageSquare', '#3B82F6', 1),
  ('Scripts & Resources', 'scripts', 'Share and discuss scripts', 'Code', '#10B981', 2),
  ('Support', 'support', 'Get help with issues', 'HelpCircle', '#F59E0B', 3),
  ('Showcase', 'showcase', 'Show off your work', 'Star', '#8B5CF6', 4),
  ('Off-Topic', 'off-topic', 'Everything else', 'Coffee', '#6B7280', 5)
) AS v(name, slug, description, icon, color, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM forum_categories LIMIT 1);

-- 16. Insert default banner if empty
INSERT INTO banners (title, description, image_url, link, position, is_active)
SELECT 'Welcome to FiveM Tools', 'Your ultimate destination for FiveM resources', '/placeholder.svg?height=200&width=800', '/', 'hero', true
WHERE NOT EXISTS (SELECT 1 FROM banners LIMIT 1);

-- 17. Insert default announcement if empty
INSERT INTO announcements (title, message, type, is_active, is_dismissible)
SELECT 'Welcome!', 'Welcome to our platform! Explore all our features and enjoy.', 'info', true, true
WHERE NOT EXISTS (SELECT 1 FROM announcements LIMIT 1);
`

async function runSetup() {
  const client = await pool.connect()

  try {
    console.log("Starting database setup...")

    // Run the SQL setup
    await client.query(SQL_SETUP)

    console.log("Database setup completed successfully!")

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log("\nCreated tables:")
    result.rows.forEach((row) => {
      console.log(" -", row.table_name)
    })

    // Check data counts
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM banners) as banners,
        (SELECT COUNT(*) FROM announcements) as announcements,
        (SELECT COUNT(*) FROM spin_wheel_prizes) as prizes,
        (SELECT COUNT(*) FROM forum_categories) as categories
    `)

    console.log("\nData counts:")
    console.log(" - Banners:", counts.rows[0].banners)
    console.log(" - Announcements:", counts.rows[0].announcements)
    console.log(" - Spin Prizes:", counts.rows[0].prizes)
    console.log(" - Forum Categories:", counts.rows[0].categories)
  } catch (error) {
    console.error("Error during setup:", error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runSetup()
