import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

async function exportCompleteSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('📊 Exporting complete database schema...\n')

  let sql = `-- FiveM Tools V7 - Complete Database Schema
-- Generated: ${new Date().toISOString()}

`

  const tables = [
    'users', 'assets', 'downloads', 'forum_categories', 'forum_threads',
    'forum_replies', 'notifications', 'activities', 'coin_transactions',
    'likes', 'daily_rewards', 'announcements', 'banners', 'messages',
    'reports', 'testimonials', 'site_settings', 'file_uploads',
    'asset_reviews', 'public_notifications', 'spin_wheel_prizes',
    'spin_wheel_history', 'spin_wheel_tickets', 'spin_wheel_settings',
    'daily_claims', 'linkvertise_downloads', 'spin_history'
  ]

  for (const table of tables) {
    console.log(`📋 ${table}`)
    
    const { data, error } = await supabase.from(table).select('*').limit(1)
    
    if (error) {
      console.log(`   ⚠️  Skip: ${error.message}`)
      continue
    }

    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      sql += `\n-- Table: ${table}\n`
      sql += `-- Columns: ${columns.join(', ')}\n\n`
    }
  }

  // Users table
  sql += `
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  membership TEXT DEFAULT 'free' CHECK (membership IN ('free', 'vip', 'premium', 'admin')),
  coins INTEGER DEFAULT 100,
  reputation INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  is_admin BOOLEAN DEFAULT false,
  spin_tickets INTEGER DEFAULT 0,
  role TEXT DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_membership ON users(membership);
CREATE INDEX idx_users_is_admin ON users(is_admin);
`

  const fs = await import('fs')
  fs.writeFileSync('database-schema-complete.sql', sql)
  console.log('\n✅ Schema exported: database-schema-complete.sql')
}

exportCompleteSchema()
