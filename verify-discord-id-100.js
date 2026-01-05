const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDiscordIdUsage() {
  console.log('🔍 VERIFYING 100% DISCORD ID USAGE...\n')
  
  const checks = [
    { table: 'forum_threads', column: 'author_id', description: 'Forum Threads Authors' },
    { table: 'forum_replies', column: 'author_id', description: 'Forum Replies Authors' },
    { table: 'assets', column: 'author_id', description: 'Asset Authors' },
    { table: 'notifications', column: 'user_id', description: 'Notifications' },
    { table: 'activities', column: 'user_id', description: 'User Activities' },
    { table: 'downloads', column: 'user_id', description: 'Downloads' },
    { table: 'coin_transactions', column: 'user_id', description: 'Coin Transactions' },
    { table: 'spin_wheel_history', column: 'user_id', description: 'Spin History' },
    { table: 'spin_wheel_tickets', column: 'user_id', description: 'Spin Tickets' },
  ]

  let allPassed = true
  let totalRecords = 0
  let discordIdRecords = 0

  for (const check of checks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select(check.column)
        .not(check.column, 'is', null)

      if (error) {
        console.log(`❌ ${check.description}: Table/column not found`)
        allPassed = false
        continue
      }

      const records = data || []
      const uuidCount = records.filter(r => 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r[check.column])
      ).length

      const discordIdCount = records.filter(r => 
        /^\d{17,19}$/.test(r[check.column])
      ).length

      totalRecords += records.length
      discordIdRecords += discordIdCount

      if (uuidCount > 0) {
        console.log(`❌ ${check.description}: ${uuidCount} UUID records found (should be 0)`)
        allPassed = false
      } else {
        console.log(`✅ ${check.description}: ${discordIdCount} Discord ID records (100%)`)
      }

    } catch (error) {
      console.log(`❌ ${check.description}: Error - ${error.message}`)
      allPassed = false
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`📊 FINAL VERIFICATION RESULTS:`)
  console.log(`Total Records Checked: ${totalRecords}`)
  console.log(`Discord ID Records: ${discordIdRecords}`)
  console.log(`Percentage: ${totalRecords > 0 ? Math.round((discordIdRecords/totalRecords)*100) : 0}%`)

  if (allPassed && discordIdRecords === totalRecords) {
    console.log('\n🎉 VERIFICATION PASSED!')
    console.log('✅ ALL SYSTEMS USE DISCORD ID 100%')
  } else {
    console.log('\n❌ VERIFICATION FAILED!')
    console.log('⚠️  Some systems still use UUID format')
  }

  return allPassed && discordIdRecords === totalRecords
}

verifyDiscordIdUsage()