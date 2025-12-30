import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTables() {
  console.log('🔍 Checking Supabase tables...\n')

  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  console.log('✅ users table:', usersError ? '❌ ' + usersError.message : '✓ exists')
  if (users && users[0]) {
    console.log('   Columns:', Object.keys(users[0]).join(', '))
  }

  // Check assets table
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('*')
    .limit(1)
  
  console.log('✅ assets table:', assetsError ? '❌ ' + assetsError.message : '✓ exists')
  if (assets && assets[0]) {
    console.log('   Columns:', Object.keys(assets[0]).join(', '))
  }

  // Check forum_categories
  const { data: categories, error: catError } = await supabase
    .from('forum_categories')
    .select('*')
    .limit(1)
  
  console.log('✅ forum_categories:', catError ? '❌ ' + catError.message : '✓ exists')

  // Check forum_threads
  const { data: threads, error: threadsError } = await supabase
    .from('forum_threads')
    .select('*')
    .limit(1)
  
  console.log('✅ forum_threads:', threadsError ? '❌ ' + threadsError.message : '✓ exists')

  // Check coin_transactions
  const { data: coins, error: coinsError } = await supabase
    .from('coin_transactions')
    .select('*')
    .limit(1)
  
  console.log('✅ coin_transactions:', coinsError ? '❌ ' + coinsError.message : '✓ exists')

  // Check spin_wheel_prizes
  const { data: prizes, error: prizesError } = await supabase
    .from('spin_wheel_prizes')
    .select('*')
    .limit(1)
  
  console.log('✅ spin_wheel_prizes:', prizesError ? '❌ ' + prizesError.message : '✓ exists')

  console.log('\n✨ Check complete!\n')
}

checkTables().catch(console.error)
