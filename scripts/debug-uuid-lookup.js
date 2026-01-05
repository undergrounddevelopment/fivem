require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debug() {
  const ids = ['f941f110-6e93-4b59-90b6-8aaf074ff743', '122e0936-51c6-40f6-b0e7-a933a7ccda65']
  
  console.log('Testing IN query with UUIDs:', ids)
  
  const { data, error } = await supabase
    .from('users')
    .select('id, discord_id, username')
    .in('id', ids)
  
  console.log('Result:', data?.length, 'users found')
  console.log('Data:', data)
  console.log('Error:', error?.message)
  
  // Try individual lookups
  console.log('\nIndividual lookups:')
  for (const id of ids) {
    const { data: user, error: err } = await supabase
      .from('users')
      .select('id, discord_id, username')
      .eq('id', id)
      .single()
    
    console.log(`  ${id}: ${user?.username || 'NOT FOUND'} ${err?.message || ''}`)
  }
}

debug().catch(console.error)
