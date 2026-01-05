/**
 * Test Forum Reply - Direct Database Check
 * Run: node scripts/test-reply-direct.js
 */

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Service Key:', supabaseKey ? '✅ Found' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testReplySystem() {
  console.log('\n🧪 Testing Reply System...\n')

  // 1. Get a thread
  console.log('1️⃣ Getting a thread...')
  const { data: threads, error: threadError } = await supabase
    .from('forum_threads')
    .select('id, title, author_id')
    .eq('is_deleted', false)
    .limit(1)

  if (threadError || !threads?.length) {
    console.error('No threads found:', threadError)
    return
  }

  const thread = threads[0]
  console.log(`   Thread: ${thread.title}`)
  console.log(`   ID: ${thread.id}`)

  // 2. Get a user
  console.log('\n2️⃣ Getting a user...')
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, discord_id, username')
    .limit(1)

  if (userError || !users?.length) {
    console.error('No users found:', userError)
    return
  }

  const user = users[0]
  console.log(`   User: ${user.username}`)
  console.log(`   UUID: ${user.id}`)
  console.log(`   Discord ID: ${user.discord_id}`)

  // 3. Check forum_replies table structure
  console.log('\n3️⃣ Checking forum_replies table...')
  const { data: replies, error: repliesError } = await supabase
    .from('forum_replies')
    .select('*')
    .limit(1)

  if (repliesError) {
    console.error('Error checking replies table:', repliesError)
    
    // Try to create the table if it doesn't exist
    console.log('\n   Attempting to check if table exists...')
    const { error: checkError } = await supabase
      .from('forum_replies')
      .select('id')
      .limit(0)
    
    if (checkError) {
      console.error('   Table might not exist:', checkError.message)
    }
  } else {
    console.log(`   ✅ Table exists, found ${replies?.length || 0} sample replies`)
    if (replies?.length > 0) {
      console.log('   Sample reply structure:', Object.keys(replies[0]))
    }
  }

  // 4. Test insert (dry run - we'll rollback)
  console.log('\n4️⃣ Testing reply insert...')
  const testReply = {
    thread_id: thread.id,
    author_id: user.id, // Using UUID
    content: 'Test reply from script - will be deleted',
    likes: 0,
    is_deleted: false,
    is_edited: false,
  }

  console.log('   Insert data:', testReply)

  const { data: insertedReply, error: insertError } = await supabase
    .from('forum_replies')
    .insert(testReply)
    .select()
    .single()

  if (insertError) {
    console.error('   ❌ Insert failed:', insertError)
    console.error('   Error code:', insertError.code)
    console.error('   Error details:', insertError.details)
    console.error('   Error hint:', insertError.hint)
  } else {
    console.log('   ✅ Insert successful!')
    console.log('   Reply ID:', insertedReply.id)

    // Clean up - delete the test reply
    console.log('\n5️⃣ Cleaning up test reply...')
    const { error: deleteError } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', insertedReply.id)

    if (deleteError) {
      console.error('   ⚠️ Could not delete test reply:', deleteError)
    } else {
      console.log('   ✅ Test reply deleted')
    }
  }

  console.log('\n✨ Test complete!')
}

testReplySystem().catch(console.error)
