require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// UUID regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getAuthorsMap(authorIds) {
  if (!authorIds.length) return {}
  const uniqueIds = [...new Set(authorIds.filter(Boolean))]
  const map = {}

  const uuids = uniqueIds.filter(id => uuidRegex.test(id))
  const discordIds = uniqueIds.filter(id => !uuidRegex.test(id))

  if (uuids.length > 0) {
    const { data: u1 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("id", uuids)
    for (const u of u1 || []) map[u.id] = u
  }

  const missingUuids = uuids.filter(id => !map[id])
  const allDiscordIds = [...discordIds, ...missingUuids]
  
  if (allDiscordIds.length > 0) {
    const { data: u2 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("discord_id", allDiscordIds)
    for (const u of u2 || []) map[u.discord_id] = u
  }
  
  return map
}

async function testAll() {
  console.log('🔍 Testing All Connections\n')
  
  // 1. Test Forum Threads
  console.log('=== 1. FORUM THREADS ===')
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('is_deleted', false)
    .or('status.eq.approved,status.is.null')
    .order('created_at', { ascending: false })
    .limit(5)
  
  const authorIds = (threads || []).map(t => t.author_id).filter(Boolean)
  const authorsMap = await getAuthorsMap(authorIds)
  
  for (const t of threads || []) {
    const author = authorsMap[t.author_id]
    const status = author?.username ? '✅' : '❌'
    console.log(`${status} "${t.title.substring(0, 40)}..." by ${author?.username || 'User'}`)
  }
  
  // 2. Test Top Badges
  console.log('\n=== 2. TOP BADGES ===')
  const { data: topUsers } = await supabase
    .from('users')
    .select('discord_id, username, avatar, xp, level')
    .eq('is_banned', false)
    .order('xp', { ascending: false })
    .limit(5)
  
  const LEVEL_TITLES = {
    1: "Newbie", 2: "Beginner", 3: "Regular", 4: "Active", 5: "Contributor",
    6: "Expert", 7: "Veteran", 8: "Master", 9: "Legend", 10: "Champion"
  }
  
  for (const u of topUsers || []) {
    console.log(`✅ ${u.username} - Level ${u.level || 1} (${LEVEL_TITLES[u.level || 1]}) - ${u.xp || 0} XP`)
  }
  
  // 3. Test Asset Comments Table
  console.log('\n=== 3. ASSET COMMENTS ===')
  const { data: comments, error: commentsErr } = await supabase
    .from('asset_comments')
    .select('*')
    .limit(5)
  
  if (commentsErr) {
    console.log('❌ Error:', commentsErr.message)
    console.log('   Table may not exist. Run create-asset-comments-table.sql')
  } else {
    console.log(`✅ Found ${comments?.length || 0} comments`)
    for (const c of comments || []) {
      const { data: user } = await supabase.from('users').select('username').eq('discord_id', c.user_id).single()
      console.log(`   - "${(c.content || c.comment || '').substring(0, 30)}..." by ${user?.username || 'Unknown'}`)
    }
  }
  
  // 4. Test Categories
  console.log('\n=== 4. FORUM CATEGORIES ===')
  const { data: categories } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  for (const cat of categories || []) {
    const { count } = await supabase
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id)
      .eq('is_deleted', false)
    console.log(`✅ ${cat.name}: ${count || 0} threads`)
  }
  
  console.log('\n✅ All tests complete!')
}

testAll().catch(console.error)
