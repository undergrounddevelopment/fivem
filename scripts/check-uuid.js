require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkUUID() {
  const testUUID = 'f941f110-6e93-4b59-90b6-8aaf074ff743'
  
  console.log('Checking UUID:', testUUID)
  
  // Direct query
  const { data, error } = await supabase
    .from('users')
    .select('id, discord_id, username')
    .eq('id', testUUID)
    .single()
  
  console.log('Result:', data)
  console.log('Error:', error)
  
  // Try with .in()
  const { data: data2, error: error2 } = await supabase
    .from('users')
    .select('id, discord_id, username')
    .in('id', [testUUID])
  
  console.log('\nWith .in():', data2)
  console.log('Error:', error2)
  
  // List all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, username')
    .limit(5)
  
  console.log('\nSample users:')
  for (const u of allUsers || []) {
    console.log(`  ${u.id} - ${u.username}`)
  }
}

checkUUID()
