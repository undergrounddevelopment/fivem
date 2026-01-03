// CHECK ALL TABLES AND DATA IN SUPABASE
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'

async function checkAllData() {
  console.log('🔍 CHECKING ALL SUPABASE DATA...\n')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  const tables = [
    'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
    'announcements', 'banners', 'spin_wheel_prizes', 'spin_wheel_tickets', 
    'spin_wheel_history', 'notifications', 'activities', 'downloads',
    'coin_transactions', 'testimonials'
  ]
  
  let totalRecords = 0
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
      
      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`)
      } else {
        const recordCount = data?.length || 0
        totalRecords += recordCount
        console.log(`${recordCount > 0 ? '✅' : '⚪'} ${table}: ${recordCount} records`)
        
        // Show sample data for assets if exists
        if (table === 'assets' && recordCount > 0) {
          console.log('   📋 Sample assets:')
          data.slice(0, 3).forEach((asset, i) => {
            console.log(`   ${i+1}. ${asset.title} (${asset.category})`)
          })
        }
      }
    } catch (e) {
      console.log(`❌ ${table}: EXCEPTION - ${e.message}`)
    }
  }
  
  console.log(`\n📊 TOTAL RECORDS: ${totalRecords}`)
  
  if (totalRecords === 0) {
    console.log('\n⚠️  DATABASE IS EMPTY')
    console.log('💡 Possible reasons:')
    console.log('   - Wrong database connection')
    console.log('   - Data in different schema/table names')
    console.log('   - RLS policies blocking access')
  }
  
  // Check if we can access the database at all
  console.log('\n🔍 TESTING DATABASE ACCESS...')
  try {
    const { data: testData, error: testError } = await supabase
      .rpc('version')
    
    if (testError) {
      console.log('❌ Database access test failed:', testError.message)
    } else {
      console.log('✅ Database access working')
    }
  } catch (e) {
    console.log('⚠️  Could not test database access')
  }
}

checkAllData().catch(console.error)