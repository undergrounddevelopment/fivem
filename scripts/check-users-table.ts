import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkUsersTable() {
  console.log('\n📋 Checking users table structure...\n')

  // Get table structure
  const { data: columns, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (columns && columns.length > 0) {
    console.log('✅ Users table columns:')
    console.log(Object.keys(columns[0]))
    console.log('\n📊 Sample user data:')
    console.log(JSON.stringify(columns[0], null, 2))
  }

  // Check specific user
  const { data: adminUser } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', '1047719075322810378')
    .single()

  if (adminUser) {
    console.log('\n👤 Admin user found:')
    console.log(JSON.stringify(adminUser, null, 2))
  }
}

checkUsersTable()
