// Add missing columns to users table
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addColumns() {
  console.log('🔧 Adding missing columns to users table...\n')

  // Test if last_daily_claim exists by trying to select it
  const { data, error } = await supabase
    .from('users')
    .select('id, last_daily_claim')
    .limit(1)

  if (error && error.message.includes('last_daily_claim')) {
    console.log('⚠️ Column last_daily_claim does not exist')
    console.log('📝 Please run this SQL in Supabase SQL Editor:\n')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_claim TIMESTAMPTZ;')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS current_badge TEXT DEFAULT \'newcomer\';')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();')
    console.log('')
    console.log('🔗 Go to: https://supabase.com/dashboard/project/linnqtixdfjwbrixitrb/sql/new')
  } else {
    console.log('✅ Column last_daily_claim exists!')
    if (data?.[0]) {
      console.log('   Sample data:', data[0])
    }
  }

  // Check other columns
  const { data: userData, error: userErr } = await supabase
    .from('users')
    .select('id, discord_id, username, coins, xp, level')
    .limit(1)

  if (userErr) {
    console.log('❌ Error checking users:', userErr.message)
  } else {
    console.log('\n✅ Users table structure OK')
    console.log('   Sample user:', userData?.[0])
  }
}

addColumns().catch(console.error)
