require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testProfileLookup() {
  console.log('🔍 Testing Profile Lookup...\n')
  
  // Test discord_id: 775660128082329640
  const discordId = '775660128082329640'
  
  console.log(`Looking up user by discord_id: ${discordId}`)
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', discordId)
    .single()
  
  if (error) {
    console.log('❌ User not found:', error.message)
    
    // List all users
    console.log('\n📋 Available users:')
    const { data: users } = await supabase.from('users').select('discord_id, username').limit(10)
    for (const u of users || []) {
      console.log(`   - ${u.username} (discord_id: ${u.discord_id})`)
    }
    return
  }
  
  console.log('✅ User found!')
  console.log(`   Username: ${user.username}`)
  console.log(`   UUID: ${user.id}`)
  console.log(`   Discord ID: ${user.discord_id}`)
  console.log(`   XP: ${user.xp}`)
  console.log(`   Level: ${user.level}`)
  
  // Test forum threads lookup
  console.log('\n📝 Forum threads by this user:')
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, title')
    .eq('author_id', user.id)
    .eq('is_deleted', false)
    .limit(5)
  
  if (threads?.length) {
    for (const t of threads) {
      console.log(`   - ${t.title.substring(0, 50)}...`)
    }
  } else {
    console.log('   No threads found')
  }
  
  // Test assets lookup
  console.log('\n📦 Assets by this user:')
  const { data: assets } = await supabase
    .from('assets')
    .select('id, title')
    .eq('author_id', user.id)
    .eq('status', 'active')
    .limit(5)
  
  if (assets?.length) {
    for (const a of assets) {
      console.log(`   - ${a.title}`)
    }
  } else {
    console.log('   No assets found')
  }
  
  console.log('\n✅ Profile lookup test complete!')
}

testProfileLookup().catch(console.error)
