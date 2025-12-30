const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const REQUIRED_TABLES = [
  'users',
  'assets',
  'forum_categories',
  'forum_threads',
  'forum_replies',
  'announcements',
  'banners',
  'spin_wheel_prizes',
  'spin_wheel_tickets',
  'spin_wheel_history',
  'notifications',
  'activities',
  'downloads',
  'coin_transactions',
  'testimonials'
]

async function checkTables() {
  console.log('🔍 Checking database tables...\n')
  
  const results = {}
  let existing = 0
  
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      
      if (error) {
        console.log(`❌ ${table}: NOT FOUND`)
        results[table] = false
      } else {
        console.log(`✅ ${table}: EXISTS`)
        results[table] = true
        existing++
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR`)
      results[table] = false
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`\nTotal: ${existing}/${REQUIRED_TABLES.length} tables exist`)
  console.log(`Percentage: ${Math.round((existing / REQUIRED_TABLES.length) * 100)}%`)
  
  if (existing < REQUIRED_TABLES.length) {
    console.log('\n⚠️  Some tables are missing!')
    console.log('Missing tables:')
    Object.entries(results).forEach(([table, exists]) => {
      if (!exists) console.log(`  - ${table}`)
    })
  } else {
    console.log('\n✅ All required tables exist!')
  }
  
  return results
}

checkTables()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
