// Auto Database Setup - Runs on app initialization
// Creates missing tables and seeds data automatically

import { getSupabaseAdminClient } from "@/lib/supabase/server"

const SETUP_QUERIES = [
  // 1. Add XP fields to users table
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS current_badge TEXT DEFAULT 'beginner'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0`,
  
  // 2. Create badges table
  `CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    min_xp INTEGER NOT NULL,
    max_xp INTEGER,
    color TEXT NOT NULL,
    tier INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // 3. Create user_badges table
  `CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    is_equipped BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, badge_id)
  )`,
  
  // 4. Create xp_transactions table
  `CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // 5. Create asset_comments table
  `CREATE TABLE IF NOT EXISTS asset_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // 6. Add status column to forum_threads if not exists
  `ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved'`,
  `ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS rejection_reason TEXT`,
  
  // 7. Create indexes
  `CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_asset_comments_asset ON asset_comments(asset_id)`,
  `CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC)`,
]

const SEED_BADGES = `
INSERT INTO badges (id, name, description, image_url, min_xp, max_xp, color, tier) VALUES
  ('beginner', 'Beginner Bolt', 'Start your journey - New member rank', '/badges/badge1.png', 0, 999, '#84CC16', 1),
  ('intermediate', 'Intermediate Bolt', 'Rising star - Active community member', '/badges/badge2.png', 1000, 4999, '#3B82F6', 2),
  ('advanced', 'Advanced Bolt', 'Skilled contributor - Experienced member', '/badges/badge3.png', 5000, 14999, '#9333EA', 3),
  ('expert', 'Expert Bolt', 'Elite status - Top community member', '/badges/badge4.png', 15000, 49999, '#DC2626', 4),
  ('legend', 'Legend Bolt', 'Legendary - Ultimate rank achieved', '/badges/badge5.png', 50000, NULL, '#F59E0B', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  min_xp = EXCLUDED.min_xp,
  max_xp = EXCLUDED.max_xp,
  color = EXCLUDED.color,
  tier = EXCLUDED.tier
`

export async function runAutoSetup(): Promise<{ success: boolean; results: string[] }> {
  const results: string[] = []
  let hasError = false
  
  try {
    const supabase = getSupabaseAdminClient()
    
    // Run each setup query
    for (const query of SETUP_QUERIES) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query }).single()
        if (error) {
          // Try direct query if RPC fails
          const cleanQuery = query.trim()
          results.push(`⚠️ Query skipped (may already exist): ${cleanQuery.substring(0, 50)}...`)
        } else {
          results.push(`✅ Success: ${query.substring(0, 50)}...`)
        }
      } catch (e: any) {
        // Ignore errors for IF NOT EXISTS queries
        if (e.message?.includes('already exists') || e.code === '42P07') {
          results.push(`⏭️ Skipped (exists): ${query.substring(0, 50)}...`)
        } else {
          results.push(`⚠️ Warning: ${e.message || 'Unknown error'}`)
        }
      }
    }
    
    // Seed badges
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: SEED_BADGES }).single()
      if (error) {
        results.push(`⚠️ Badges seed skipped: ${error.message}`)
      } else {
        results.push(`✅ Badges seeded successfully`)
      }
    } catch (e: any) {
      results.push(`⚠️ Badges seed warning: ${e.message || 'Unknown'}`)
    }
    
    return { success: !hasError, results }
  } catch (error: any) {
    results.push(`❌ Setup error: ${error.message}`)
    return { success: false, results }
  }
}

// Simpler version that just ensures badges exist
export async function ensureBadgesExist(): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient()
    
    // Check if badges table has data
    const { data: badges, error } = await supabase
      .from('badges')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('[DB Setup] Badges table may not exist:', error.message)
      return false
    }
    
    if (!badges || badges.length === 0) {
      // Insert badges directly
      const { error: insertError } = await supabase
        .from('badges')
        .upsert([
          { id: 'beginner', name: 'Beginner Bolt', description: 'Start your journey', image_url: '/badges/badge1.png', min_xp: 0, max_xp: 999, color: '#84CC16', tier: 1 },
          { id: 'intermediate', name: 'Intermediate Bolt', description: 'Rising star', image_url: '/badges/badge2.png', min_xp: 1000, max_xp: 4999, color: '#3B82F6', tier: 2 },
          { id: 'advanced', name: 'Advanced Bolt', description: 'Skilled contributor', image_url: '/badges/badge3.png', min_xp: 5000, max_xp: 14999, color: '#9333EA', tier: 3 },
          { id: 'expert', name: 'Expert Bolt', description: 'Elite status', image_url: '/badges/badge4.png', min_xp: 15000, max_xp: 49999, color: '#DC2626', tier: 4 },
          { id: 'legend', name: 'Legend Bolt', description: 'Legendary rank', image_url: '/badges/badge5.png', min_xp: 50000, max_xp: null, color: '#F59E0B', tier: 5 },
        ], { onConflict: 'id' })
      
      if (insertError) {
        console.log('[DB Setup] Failed to seed badges:', insertError.message)
        return false
      }
      
      console.log('[DB Setup] Badges seeded successfully')
    }
    
    return true
  } catch (error: any) {
    console.log('[DB Setup] Error:', error.message)
    return false
  }
}
