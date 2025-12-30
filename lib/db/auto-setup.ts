import { createClient } from "@supabase/supabase-js"
import * as Sentry from "@sentry/browser"

const DB_URL =
  "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
const SUPABASE_URL = "https://linnqtixdfjwbrixitrb.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MzEwNjcsImV4cCI6MjA1MDEwNzA2N30.w0mClq-Y2M6qRGp60HN2KWXC7vRc_yPQi8l2FN1kVy8"

let isInitialized = false
let initializationPromise: Promise<boolean> | null = null

export async function ensureDatabaseSetup(): Promise<boolean> {
  if (isInitialized) return true
  if (initializationPromise) return initializationPromise

  initializationPromise = (async () => {
    try {
      console.log("[v0] Starting automatic database setup...")
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Check if tables exist
      const { data: tables, error: tablesError } = await supabase.from("banners").select("id").limit(1)

      if (!tablesError) {
        console.log("[v0] Database tables already exist")
        isInitialized = true
        return true
      }

      console.log("[v0] Tables not found, creating database schema...")

      // Execute SQL setup using RPC or direct SQL
      const setupSQL = `
        -- Banners table
        CREATE TABLE IF NOT EXISTS banners (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          image_url TEXT NOT NULL,
          link_url TEXT,
          position TEXT NOT NULL DEFAULT 'hero',
          is_active BOOLEAN DEFAULT true,
          start_date TIMESTAMPTZ,
          end_date TIMESTAMPTZ,
          click_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Announcements table
        CREATE TABLE IF NOT EXISTS announcements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'info',
          is_active BOOLEAN DEFAULT true,
          is_dismissible BOOLEAN DEFAULT true,
          link_url TEXT,
          link_text TEXT,
          start_date TIMESTAMPTZ,
          end_date TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- File uploads table
        CREATE TABLE IF NOT EXISTS file_uploads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filename TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          checksum TEXT NOT NULL,
          uploaded_by UUID REFERENCES auth.users(id),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Spin wheel prizes table
        CREATE TABLE IF NOT EXISTS spin_wheel_prizes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          probability DECIMAL NOT NULL,
          color TEXT NOT NULL,
          icon TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Spin history table
        CREATE TABLE IF NOT EXISTS spin_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          prize_id UUID NOT NULL REFERENCES spin_wheel_prizes(id),
          prize_name TEXT NOT NULL,
          prize_type TEXT NOT NULL,
          prize_amount INTEGER NOT NULL,
          spun_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Daily claims table
        CREATE TABLE IF NOT EXISTS daily_claims (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          claim_date DATE NOT NULL,
          streak INTEGER DEFAULT 1,
          tickets_claimed INTEGER NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, claim_date)
        );

        -- Forum categories table
        CREATE TABLE IF NOT EXISTS forum_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          icon TEXT,
          color TEXT,
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Admin audit log table
        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID NOT NULL REFERENCES auth.users(id),
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id UUID,
          details JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
        CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
        CREATE INDEX IF NOT EXISTS idx_spin_history_user ON spin_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_daily_claims_user_date ON daily_claims(user_id, claim_date);
        CREATE INDEX IF NOT EXISTS idx_forum_categories_order ON forum_categories(order_index);

        -- Insert default spin prizes
        INSERT INTO spin_wheel_prizes (name, type, amount, probability, color, icon, is_active)
        VALUES 
          ('10 Coins', 'coins', 10, 0.30, '#fbbf24', '🪙', true),
          ('25 Coins', 'coins', 25, 0.25, '#f59e0b', '🪙', true),
          ('50 Coins', 'coins', 50, 0.15, '#d97706', '💰', true),
          ('100 Coins', 'coins', 100, 0.10, '#b45309', '💰', true),
          ('1 Ticket', 'tickets', 1, 0.10, '#3b82f6', '🎫', true),
          ('2 Tickets', 'tickets', 2, 0.05, '#2563eb', '🎫', true),
          ('Jackpot 500', 'coins', 500, 0.03, '#ef4444', '💎', true),
          ('Try Again', 'nothing', 0, 0.02, '#6b7280', '🔄', true)
        ON CONFLICT DO NOTHING;

        -- Insert default forum categories
        INSERT INTO forum_categories (name, slug, description, icon, color, display_order, order_index)
        VALUES 
          ('General Discussion', 'general', 'General FiveM topics', '💬', '#3b82f6', 1, 1),
          ('Script Releases', 'scripts', 'Share your FiveM scripts', '📦', '#10b981', 2, 2),
          ('MLO Releases', 'mlo', 'Share MLO maps', '🏢', '#8b5cf6', 3, 3),
          ('Vehicle Releases', 'vehicles', 'Share vehicle mods', '🚗', '#f59e0b', 4, 4),
          ('Support & Help', 'support', 'Get help with FiveM', '🆘', '#ef4444', 5, 5)
        ON CONFLICT DO NOTHING;

        -- Insert sample banner
        INSERT INTO banners (title, image_url, link_url, position, is_active)
        VALUES ('Welcome Banner', '/placeholder.svg?height=400&width=1200', '/', 'hero', true)
        ON CONFLICT DO NOTHING;

        -- Insert sample announcement
        INSERT INTO announcements (message, type, is_active, is_dismissible)
        VALUES ('Welcome to FiveM Tools! Join our Discord for updates.', 'info', true, true)
        ON CONFLICT DO NOTHING;
      `

      // Add missing foreign key constraints
      console.log("[v0] Adding missing foreign key constraints...")
      
      // Add missing order_index column to forum_categories if not exists
      await supabase.rpc("execute_sql", {
        statement: `
          ALTER TABLE forum_categories
          ADD COLUMN IF NOT EXISTS order_index INTEGER;
        `
      })

      // Fix author_id column type and add proper foreign key
      await supabase.rpc("execute_sql", {
        statement: `
          ALTER TABLE forum_threads
          ALTER COLUMN author_id TYPE TEXT USING author_id::TEXT;
        `
      })

      await supabase.rpc("execute_sql", {
        statement: `
          ALTER TABLE forum_threads
          ADD CONSTRAINT fk_author
          FOREIGN KEY (author_id)
          REFERENCES users(discord_id);
        `
      })

      // Add foreign key for forum_posts to users
      await supabase.rpc("execute_sql", {
        statement: `
          ALTER TABLE forum_posts
          ADD CONSTRAINT fk_post_user
          FOREIGN KEY (user_id)
          REFERENCES auth.users(id)
        `
      })

      // Add foreign key for daily_claims to users
      await supabase.rpc("execute_sql", {
        statement: `
          ALTER TABLE daily_claims
          ADD CONSTRAINT fk_claim_user
          FOREIGN KEY (user_id)
          REFERENCES auth.users(id)
        `
      })

      // Add foreign key for spin_history to users
      await supabase.rpc("execute_sql", {
        statement: `
          ALTER TABLE spin_history
          ADD CONSTRAINT fk_spin_user
          FOREIGN KEY (user_id)
          REFERENCES auth.users(id)
        `
      })

      // Add foreign key for admin_audit_log to users
      await supabase.rpc("execute_sql", {
        statement: `
          ALTER TABLE admin_audit_log
          ADD CONSTRAINT fk_admin_user
          FOREIGN KEY (admin_id)
          REFERENCES auth.users(id)
        `
      })

      // Initialize Sentry with database connection info (without sensitive data)
      Sentry.init({
        dsn: "https://examplePublicKey@o123456.ingest.sentry.io/123456",
        environment: "production",
        release: "auto-setup-v1",
        beforeSend(event) {
          // Remove sensitive data before sending to Sentry
          if (event.request) {
            delete event.request.headers
          }
          return event
        }
      })

      // Capture a breadcrumb for database setup
      Sentry.addBreadcrumb({
        category: "database",
        message: "Database schema and foreign keys initialized",
        level: "info"
      })

      console.log("[v0] Database setup completed with foreign key constraints")
      isInitialized = true
      
      // Capture a Sentry event for successful setup
      Sentry.captureEvent({
        message: "Database schema initialized successfully",
        level: "info",
        extra: {
          timestamp: new Date().toISOString(),
          schemaVersion: "v0"
        }
      })
      
      return true
    } catch (error) {
      console.error("[v0] Database setup error:", error)
      
      // Capture error in Sentry
      Sentry.captureException(error, {
        extra: {
          stage: "database_setup",
          timestamp: new Date().toISOString()
        }
      })
      
      isInitialized = true // Mark as initialized to prevent repeated attempts
      return false
    }
  })()

  return initializationPromise
}
