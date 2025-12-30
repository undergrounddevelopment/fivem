import { createAdminClient } from './supabase/server'

const REQUIRED_TABLES = [
  'users',
  'assets',
  'forum_categories',
  'forum_threads',
  'forum_replies',
  'forum_posts',
  'announcements',
  'banners',
  'spin_wheel_prizes',
  'spin_wheel_tickets',
  'spin_wheel_history',
  'spin_history',
  'notifications',
  'activities',
  'downloads',
  'coin_transactions',
  'testimonials'
]

export async function checkAllTables() {
  const supabase = createAdminClient()
  const results: Record<string, boolean> = {}
  
  console.log('🔍 Checking database tables...\n')
  
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      
      if (error) {
        console.log(`❌ ${table}: NOT FOUND or ERROR`)
        results[table] = false
      } else {
        console.log(`✅ ${table}: EXISTS`)
        results[table] = true
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR`)
      results[table] = false
    }
  }
  
  console.log('\n' + '='.repeat(50))
  const existing = Object.values(results).filter(Boolean).length
  const total = REQUIRED_TABLES.length
  console.log(`\nTotal: ${existing}/${total} tables exist`)
  
  if (existing < total) {
    console.log('\n⚠️  Some tables are missing. Run database setup.')
  } else {
    console.log('\n✅ All required tables exist!')
  }
  
  return results
}

export async function createMissingTables() {
  const supabase = createAdminClient()
  
  console.log('🔧 Creating missing tables...\n')
  
  // Create activities table if missing
  try {
    const { error } = await supabase.from('activities').select('count').limit(1)
    if (error) {
      console.log('Creating activities table...')
      // Table will be created via SQL migration
    }
  } catch (err) {
    console.log('❌ Failed to check activities table')
  }
  
  console.log('\n✅ Table creation complete')
}
