import { createClient } from '@supabase/supabase-js'

// OLD SUPABASE
const oldSupabase = createClient(
  'https://linnqtixdfjwbrixitrb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2ODI0NTUsImV4cCI6MjA0OTI1ODQ1NX0.5R2vZYL_kNEqGVwqJhAnii7Ql9Uw-Ql5Uw8Uw8Uw8Uw'
)

// NEW SUPABASE
const newSupabase = createClient(
  'https://peaulqbbvgzpnwshtbok.supabase.co',
  process.env.SUPABASE_KEY
)

async function migrate() {
  console.log('🚀 Starting migration...')
  
  // 1. Migrate Users
  console.log('👥 Migrating users...')
  const { data: users } = await oldSupabase.from('users').select('*')
  if (users) {
    for (const user of users) {
      await newSupabase.from('users').upsert(user, { onConflict: 'discord_id' })
    }
    console.log(`✅ Migrated ${users.length} users`)
  }
  
  // 2. Migrate Assets
  console.log('📦 Migrating assets...')
  const { data: assets } = await oldSupabase.from('assets').select('*')
  if (assets) {
    for (const asset of assets) {
      await newSupabase.from('assets').insert(asset)
    }
    console.log(`✅ Migrated ${assets.length} assets`)
  }
  
  console.log('🎉 Migration complete!')
}

migrate()
