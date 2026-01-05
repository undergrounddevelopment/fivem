require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getAuthorsMap(authorIds) {
  if (!authorIds.length) return {}
  const uniqueIds = [...new Set(authorIds.filter(Boolean))]
  const map = {}

  // UUID match
  const { data: u1 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("id", uniqueIds)
  for (const u of u1 || []) map[u.id] = u

  // Discord ID match
  const missing = uniqueIds.filter(id => !map[id])
  if (missing.length > 0) {
    const { data: u2 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("discord_id", missing)
    for (const u of u2 || []) map[u.discord_id] = u
  }
  return map
}

async function testForumDirect() {
  console.log('🔍 Testing Forum Direct Database Access...\n')
  
  // Get threads
  const { data: threads, error } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('is_deleted', false)
    .or('status.eq.approved,status.is.null')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.log('❌ Error:', error.message)
    return
  }
  
  console.log(`📝 Found ${threads.length} threads\n`)
  
  // Get authors
  const authorIds = threads.map(t => t.author_id).filter(Boolean)
  const authorsMap = await getAuthorsMap(authorIds)
  
  console.log('--- Thread Authors ---')
  for (const t of threads) {
    const author = authorsMap[t.author_id]
    const authorName = author?.username || 'User'
    const status = author ? '✅' : '❌'
    console.log(`${status} "${t.title.substring(0, 40)}..." by ${authorName}`)
    if (!author) {
      console.log(`   ⚠️  author_id: ${t.author_id} not found in users table`)
    }
  }
  
  // Get replies
  console.log('\n--- Reply Authors ---')
  const { data: replies } = await supabase
    .from('forum_replies')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (replies?.length) {
    const replyAuthorIds = replies.map(r => r.author_id).filter(Boolean)
    const replyAuthorsMap = await getAuthorsMap(replyAuthorIds)
    
    for (const r of replies) {
      const author = replyAuthorsMap[r.author_id]
      const authorName = author?.username || 'User'
      const status = author ? '✅' : '❌'
      console.log(`${status} Reply: "${r.content.substring(0, 30)}..." by ${authorName}`)
    }
  } else {
    console.log('No replies found')
  }
  
  console.log('\n✅ Test complete!')
}

testForumDirect().catch(console.error)
