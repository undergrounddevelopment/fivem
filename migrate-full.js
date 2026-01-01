import { createClient } from '@supabase/supabase-js'

const OLD_URL = 'https://linnqtixdfjwbrixitrb.supabase.co'
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzY4MjQ1NSwiZXhwIjoyMDQ5MjU4NDU1fQ.YOUR_SERVICE_ROLE_KEY'

const NEW_URL = 'https://peaulqbbvgzpnwshtbok.supabase.co'
const NEW_KEY = process.env.SUPABASE_KEY

const oldDB = createClient(OLD_URL, OLD_KEY)
const newDB = createClient(NEW_URL, NEW_KEY)

const tables = [
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

async function migrateTable(tableName) {
  console.log(`📋 Migrating ${tableName}...`)
  const { data, error } = await oldDB.from(tableName).select('*')
  
  if (error) {
    console.log(`⚠️  ${tableName}: ${error.message}`)
    return
  }
  
  if (!data || data.length === 0) {
    console.log(`⏭️  ${tableName}: No data`)
    return
  }
  
  for (const row of data) {
    await newDB.from(tableName).upsert(row)
  }
  
  console.log(`✅ ${tableName}: ${data.length} rows`)
}

async function migrate() {
  console.log('🚀 Starting full migration...')
  console.log(`📤 From: ${OLD_URL}`)
  console.log(`📥 To: ${NEW_URL}\n`)
  
  for (const table of tables) {
    await migrateTable(table)
  }
  
  console.log('\n🎉 Migration complete!')
}

migrate()
