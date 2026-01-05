require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function autoFix() {
  console.log('🔧 AUTO-FIX SYSTEM - FiveM Tools V7\n')
  console.log('='.repeat(60))

  // Fix 1: Seed Badges
  await fixBadges()
  
  // Fix 2: Seed XP Activities
  await fixXPActivities()
  
  // Fix 3: Verify Data Integrity
  await verifyDataIntegrity()

  console.log('\n' + '='.repeat(60))
  console.log('✅ ALL FIXES COMPLETED!\n')
}

async function fixBadges() {
  console.log('\n1️⃣  FIXING BADGE SYSTEM...')
  
  const badges = [
    {
      id: 'beginner',
      name: 'Beginner Bolt',
      description: 'Just getting started',
      image_url: '/badges/badge1.png',
      min_xp: 0,
      max_xp: 999,
      color: '#94a3b8',
      tier: 1
    },
    {
      id: 'intermediate',
      name: 'Intermediate Bolt',
      description: 'Making progress',
      image_url: '/badges/badge2.png',
      min_xp: 1000,
      max_xp: 4999,
      color: '#3b82f6',
      tier: 2
    },
    {
      id: 'advanced',
      name: 'Advanced Bolt',
      description: 'Skilled contributor',
      image_url: '/badges/badge3.png',
      min_xp: 5000,
      max_xp: 14999,
      color: '#8b5cf6',
      tier: 3
    },
    {
      id: 'expert',
      name: 'Expert Bolt',
      description: 'Master of the craft',
      image_url: '/badges/badge4.png',
      min_xp: 15000,
      max_xp: 49999,
      color: '#f59e0b',
      tier: 4
    },
    {
      id: 'legend',
      name: 'Legend Bolt',
      description: 'Legendary status',
      image_url: '/badges/badge5.png',
      min_xp: 50000,
      max_xp: null,
      color: '#ef4444',
      tier: 5
    }
  ]

  for (const badge of badges) {
    const { error } = await supabase
      .from('badges')
      .upsert(badge, { onConflict: 'id' })
    
    if (error) {
      console.log(`   ❌ ${badge.name}: ${error.message}`)
    } else {
      console.log(`   ✅ ${badge.name}: Seeded`)
    }
  }
}

async function fixXPActivities() {
  console.log('\n2️⃣  FIXING XP ACTIVITIES...')
  
  const activities = [
    {
      id: 'upload_asset',
      name: 'Upload Asset',
      description: 'Upload a new asset',
      xp_amount: 100,
      cooldown_minutes: 0,
      max_per_day: null,
      is_active: true
    },
    {
      id: 'create_thread',
      name: 'Create Thread',
      description: 'Create a forum thread',
      xp_amount: 50,
      cooldown_minutes: 0,
      max_per_day: null,
      is_active: true
    },
    {
      id: 'create_reply',
      name: 'Create Reply',
      description: 'Reply to a thread',
      xp_amount: 20,
      cooldown_minutes: 0,
      max_per_day: null,
      is_active: true
    },
    {
      id: 'receive_like',
      name: 'Receive Like',
      description: 'Get a like on your content',
      xp_amount: 10,
      cooldown_minutes: 0,
      max_per_day: null,
      is_active: true
    },
    {
      id: 'daily_login',
      name: 'Daily Login',
      description: 'Login to the platform',
      xp_amount: 10,
      cooldown_minutes: 1440,
      max_per_day: 1,
      is_active: true
    },
    {
      id: 'asset_download',
      name: 'Asset Downloaded',
      description: 'Someone downloads your asset',
      xp_amount: 15,
      cooldown_minutes: 0,
      max_per_day: null,
      is_active: true
    }
  ]

  for (const activity of activities) {
    const { error } = await supabase
      .from('xp_activities')
      .upsert(activity, { onConflict: 'id' })
    
    if (error) {
      console.log(`   ❌ ${activity.name}: ${error.message}`)
    } else {
      console.log(`   ✅ ${activity.name}: Seeded`)
    }
  }
}

async function verifyDataIntegrity() {
  console.log('\n3️⃣  VERIFYING DATA INTEGRITY...')
  
  // Check badges
  const { data: badges } = await supabase.from('badges').select('count')
  console.log(`   ✅ Badges: ${badges?.length || 0} records`)
  
  // Check XP activities
  const { data: xpAct } = await supabase.from('xp_activities').select('count')
  console.log(`   ✅ XP Activities: ${xpAct?.length || 0} records`)
  
  // Check assets
  const { data: assets } = await supabase.from('assets').select('count')
  console.log(`   ✅ Assets: ${assets?.length || 0} records`)
  
  // Check users
  const { data: users } = await supabase.from('users').select('count')
  console.log(`   ✅ Users: ${users?.length || 0} records`)
}

autoFix().catch(console.error)
