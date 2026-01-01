import { createClient } from '@supabase/supabase-js'

// OLD DATABASE
const oldDB = createClient(
  'https://linnqtixdfjwbrixitrb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzY4MjQ1NSwiZXhwIjoyMDQ5MjU4NDU1fQ.kH8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8Uw8'
)

// NEW DATABASE
const newDB = createClient(
  'https://peaulqbbvgzpnwshtbok.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlYXVscWJidmd6cG53c2h0Ym9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5MTg2NCwiZXhwIjoyMDgyNzY3ODY0fQ.Mh7RO29q7Ef2qlnBjI76EnDa3-4XtXsnZzJGG2Kvix4'
)

const tables = ['users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies', 'announcements', 'banners', 'spin_wheel_prizes', 'spin_wheel_tickets', 'spin_wheel_history', 'notifications', 'activities', 'downloads', 'coin_transactions', 'testimonials']

async function migrate() {
  console.log('🚀 MIGRATION START')
  console.log('FROM: linnqtixdfjwbrixitrb.supabase.co')
  console.log('TO: peaulqbbvgzpnwshtbok.supabase.co\n')
  
  for (const table of tables) {
    try {
      console.log(`📋 ${table}...`)
      const { data, error } = await oldDB.from(table).select('*')
      
      if (error) {
        console.log(`⚠️  ${table}: ${error.message}`)
        continue
      }
      
      if (!data || data.length === 0) {
        console.log(`⏭️  ${table}: empty`)
        continue
      }
      
      const { error: insertError } = await newDB.from(table).upsert(data)
      
      if (insertError) {
        console.log(`❌ ${table}: ${insertError.message}`)
      } else {
        console.log(`✅ ${table}: ${data.length} rows`)
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }
  
  console.log('\n🎉 MIGRATION COMPLETE!')
}

migrate()
