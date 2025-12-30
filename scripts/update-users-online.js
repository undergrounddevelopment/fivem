const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateAllUsersOnline() {
  console.log('🔄 Updating all users to online status...\n')
  
  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('discord_id, username')
  
  if (error) {
    console.error('Error fetching users:', error)
    return
  }
  
  console.log(`Found ${users.length} users`)
  
  // Update all users last_seen to now
  const { error: updateError } = await supabase
    .from('users')
    .update({ last_seen: new Date().toISOString() })
    .neq('discord_id', '')
  
  if (updateError) {
    console.error('Error updating users:', updateError)
    return
  }
  
  console.log('✅ All users updated to online status')
  
  // Verify
  const { count: online } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())
  
  console.log(`\n📊 Online Users: ${online}/${users.length}`)
  console.log(`Percentage: ${Math.round((online / users.length) * 100)}%`)
}

updateAllUsersOnline()
