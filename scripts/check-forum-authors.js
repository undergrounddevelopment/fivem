/**
 * Check Forum Authors Data
 * Run: node scripts/check-forum-authors.js
 */

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Using Supabase URL:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing')
  console.log('Key:', supabaseKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkForumAuthors() {
  console.log('🔍 Checking Forum Authors...\n')
  
  // Get all threads with their author_id
  const { data: threads, error: threadsError } = await supabase
    .from('forum_threads')
    .select('id, title, author_id, created_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (threadsError) {
    console.error('Error fetching threads:', threadsError)
    return
  }
  
  console.log(`Found ${threads.length} threads\n`)
  
  // Get all users for reference
  const { data: users } = await supabase
    .from('users')
    .select('id, discord_id, username')
  
  const usersByUUID = {}
  const usersByDiscord = {}
  
  for (const user of users || []) {
    usersByUUID[user.id] = user
    usersByDiscord[user.discord_id] = user
  }
  
  console.log(`Found ${users?.length || 0} users\n`)
  
  // Check each thread
  for (const thread of threads) {
    const authorId = thread.author_id
    const userByUUID = usersByUUID[authorId]
    const userByDiscord = usersByDiscord[authorId]
    
    const resolved = userByUUID || userByDiscord
    const resolvedBy = userByUUID ? 'UUID' : (userByDiscord ? 'discord_id' : 'NOT FOUND')
    
    console.log(`📝 Thread: ${thread.title.substring(0, 40)}...`)
    console.log(`   author_id: ${authorId}`)
    console.log(`   Resolved: ${resolved ? resolved.username : '❌ NOT FOUND'} (${resolvedBy})`)
    
    // If not found, try to find similar
    if (!resolved) {
      // Check if it's a valid UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authorId)
      console.log(`   Is UUID format: ${isUUID}`)
      
      // Search for partial match
      for (const user of users || []) {
        if (user.id === authorId || user.discord_id === authorId) {
          console.log(`   Found exact match: ${user.username} (id: ${user.id}, discord: ${user.discord_id})`)
        }
      }
    }
    console.log('')
  }
  
  // Check replies too
  console.log('\n--- Checking Replies ---\n')
  
  const { data: replies } = await supabase
    .from('forum_replies')
    .select('id, author_id, content, thread_id')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10)
  
  for (const reply of replies || []) {
    const authorId = reply.author_id
    const userByUUID = usersByUUID[authorId]
    const userByDiscord = usersByDiscord[authorId]
    
    const resolved = userByUUID || userByDiscord
    const resolvedBy = userByUUID ? 'UUID' : (userByDiscord ? 'discord_id' : 'NOT FOUND')
    
    console.log(`💬 Reply: ${reply.content.substring(0, 30)}...`)
    console.log(`   author_id: ${authorId}`)
    console.log(`   Resolved: ${resolved ? resolved.username : '❌ NOT FOUND'} (${resolvedBy})`)
    console.log('')
  }
  
  console.log('✅ Check complete!')
}

checkForumAuthors().catch(console.error)
