// Test admin coins API
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminCoins() {
  console.log('🔍 Testing Admin Coins System\n')
  console.log('=' .repeat(50))

  // 1. Test users query
  console.log('\n📋 1. USERS DATA')
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id, discord_id, username, coins, membership, xp, level, is_admin')
    .order('coins', { ascending: false })
    .limit(10)

  if (usersErr) {
    console.log('   ❌ Error:', usersErr.message)
  } else {
    console.log('   ✅ Found', users?.length, 'users')
    for (const u of users || []) {
      console.log(`   - ${u.username}: ${u.coins || 0} coins, Level ${u.level || 1}, ${u.membership || 'member'}${u.is_admin ? ' (ADMIN)' : ''}`)
    }
  }

  // 2. Test coin_transactions table
  console.log('\n📋 2. COIN TRANSACTIONS')
  const { data: transactions, error: txErr } = await supabase
    .from('coin_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (txErr) {
    console.log('   ❌ Error:', txErr.message)
    console.log('   ⚠️ Table might not exist. Creating...')
    
    // Try to check if table exists
    const { error: checkErr } = await supabase.from('coin_transactions').select('id').limit(1)
    if (checkErr) {
      console.log('   📝 Please create coin_transactions table in Supabase:')
      console.log(`
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT DEFAULT 'admin_adjust',
  reason TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
      `)
    }
  } else {
    console.log('   ✅ Found', transactions?.length, 'transactions')
    for (const t of (transactions || []).slice(0, 5)) {
      console.log(`   - ${t.amount > 0 ? '+' : ''}${t.amount} | ${t.type} | ${t.reason || t.description || 'No reason'}`)
    }
  }

  // 3. Test settings table
  console.log('\n📋 3. SETTINGS TABLE')
  const { data: settings, error: settingsErr } = await supabase
    .from('settings')
    .select('*')
    .limit(5)

  if (settingsErr) {
    console.log('   ⚠️ Settings table might not exist:', settingsErr.message)
    console.log('   📝 Please create settings table in Supabase:')
    console.log(`
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);
    `)
  } else {
    console.log('   ✅ Settings table exists with', settings?.length, 'entries')
  }

  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 SUMMARY')
  console.log('=' .repeat(50))
  console.log('   Total Users:', users?.length || 0)
  console.log('   Total Coins in System:', (users || []).reduce((s, u) => s + (u.coins || 0), 0))
  console.log('   Total Transactions:', transactions?.length || 0)
  console.log('')
}

testAdminCoins().catch(console.error)
