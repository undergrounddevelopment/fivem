// Auto Database Setup Script
// Run: node scripts/auto-setup-database.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BADGE_DATA = [
  { id: 'beginner', name: 'Beginner Bolt', description: 'Start your journey - New member rank', image_url: '/badges/badge1.png', min_xp: 0, max_xp: 999, color: '#84CC16', tier: 1 },
  { id: 'intermediate', name: 'Intermediate Bolt', description: 'Rising star - Active community member', image_url: '/badges/badge2.png', min_xp: 1000, max_xp: 4999, color: '#3B82F6', tier: 2 },
  { id: 'advanced', name: 'Advanced Bolt', description: 'Skilled contributor - Experienced member', image_url: '/badges/badge3.png', min_xp: 5000, max_xp: 14999, color: '#9333EA', tier: 3 },
  { id: 'expert', name: 'Expert Bolt', description: 'Elite status - Top community member', image_url: '/badges/badge4.png', min_xp: 15000, max_xp: 49999, color: '#DC2626', tier: 4 },
  { id: 'legend', name: 'Legend Bolt', description: 'Legendary - Ultimate rank achieved', image_url: '/badges/badge5.png', min_xp: 50000, max_xp: null, color: '#F59E0B', tier: 5 },
]

async function setupDatabase() {
  console.log('🚀 Starting Auto Database Setup...\n')
  
  // 1. Check and seed badges
  console.log('📦 Checking badges table...')
  
  const { data: badges, error: badgesError } = await supabase
    .from('badges')
    .select('id')
  
  if (badgesError) {
    console.log('⚠️  Badges table error:', badgesError.message)
    console.log('   Please create the badges table first using SQL Editor in Supabase')
    console.log('\n   SQL to create badges table:')
    console.log(`
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  max_xp INTEGER,
  color TEXT NOT NULL,
  tier INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
    `)
  } else {
    console.log(`✅ Badges table exists (${badges?.length || 0} badges)`)
    
    // Upsert badges
    const { error: upsertError } = await supabase
      .from('badges')
      .upsert(BADGE_DATA, { onConflict: 'id' })
    
    if (upsertError) {
      console.log('❌ Failed to upsert badges:', upsertError.message)
    } else {
      console.log('✅ Badges seeded/updated successfully')
    }
  }
  
  // 2. Check user_badges table
  console.log('\n📦 Checking user_badges table...')
  
  const { error: userBadgesError } = await supabase
    .from('user_badges')
    .select('id')
    .limit(1)
  
  if (userBadgesError) {
    console.log('⚠️  user_badges table error:', userBadgesError.message)
    console.log('   SQL to create:')
    console.log(`
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);
    `)
  } else {
    console.log('✅ user_badges table exists')
  }
  
  // 3. Check asset_comments table
  console.log('\n📦 Checking asset_comments table...')
  
  const { error: commentsError } = await supabase
    .from('asset_comments')
    .select('id')
    .limit(1)
  
  if (commentsError) {
    console.log('⚠️  asset_comments table error:', commentsError.message)
    console.log('   SQL to create:')
    console.log(`
CREATE TABLE IF NOT EXISTS asset_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
    `)
  } else {
    console.log('✅ asset_comments table exists')
  }
  
  // 4. Check forum_threads status column
  console.log('\n📦 Checking forum_threads.status column...')
  
  const { data: threads, error: threadsError } = await supabase
    .from('forum_threads')
    .select('status')
    .limit(1)
  
  if (threadsError && threadsError.message.includes('status')) {
    console.log('⚠️  forum_threads.status column missing')
    console.log('   SQL to add:')
    console.log(`
ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `)
  } else if (threadsError) {
    console.log('⚠️  forum_threads error:', threadsError.message)
  } else {
    console.log('✅ forum_threads.status column exists')
  }
  
  // 5. Check users XP columns
  console.log('\n📦 Checking users XP columns...')
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('xp, level, current_badge')
    .limit(1)
  
  if (usersError) {
    console.log('⚠️  users XP columns error:', usersError.message)
    console.log('   SQL to add:')
    console.log(`
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_badge TEXT DEFAULT 'beginner';
    `)
  } else {
    console.log('✅ users XP columns exist')
  }
  
  console.log('\n✨ Database setup check complete!')
  console.log('\nIf any tables are missing, copy the SQL above and run in Supabase SQL Editor.')
}

setupDatabase().catch(console.error)
