// VERIFY ADVANCED TABLES CREATION
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'

async function verifyAdvancedTables() {
  console.log('🔍 VERIFYING ADVANCED TABLES...\n')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  const advancedTables = [
    'admin_actions',
    'security_events', 
    'firewall_rules',
    'rate_limits',
    'user_presence',
    'realtime_events'
  ]
  
  let connected = 0
  const results = {}
  
  for (const table of advancedTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      if (error) {
        console.log(`❌ ${table}: NOT FOUND`)
        results[table] = false
      } else {
        console.log(`✅ ${table}: EXISTS`)
        results[table] = true
        connected++
      }
    } catch (e) {
      console.log(`❌ ${table}: ERROR`)
      results[table] = false
    }
  }
  
  const percentage = Math.round((connected / advancedTables.length) * 100)
  
  console.log(`\n📊 ADVANCED TABLES: ${connected}/${advancedTables.length} (${percentage}%)`)
  
  if (percentage === 100) {
    console.log('🎉 ALL ADVANCED FEATURES: 100% READY!')
    console.log('✅ Admin Panel: CONNECTED')
    console.log('✅ Real-time System: CONNECTED')
    console.log('✅ Security Monitoring: CONNECTED')
  } else {
    console.log(`⚠️  MISSING: ${6 - connected} tables`)
    console.log('📋 MANUAL FIX: Copy FIX-ADVANCED-TABLES.sql to Supabase SQL Editor')
  }
  
  return { connected, total: 6, percentage, results }
}

verifyAdvancedTables().catch(console.error)