require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Replicate the exact logic from lib/actions/forum.ts
async function getAuthorsMap(authorIds) {
  if (!authorIds.length) return {}
  const uniqueIds = [...new Set(authorIds.filter(Boolean))]
  const map = {}

  // UUID match
  const { data: u1 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("id", uniqueIds)
  for (const u of u1 || []) map[u.id] = u

  // Discord ID match for any missing
  const missing = uniqueIds.filter(id => !map[id])
  if (missing.length > 0) {
    const { data: u2 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("discord_id", missing)
    for (const u of u2 || []) map[u.discord_id] = u
  }
  return map
}

function formatAuthor(author, fallbackId) {
  if (author?.username) {
    return {
      id: author.discord_id || author.id || fallbackId,
      username: author.username,
      avatar: author.avatar,
      membership: author.membership || "member",
      xp: author.xp || 0,
      level: author.level || 1,
    }
  }
  return { id: fallbackId, username: "User", avatar: null, membership: "member", xp: 0, level: 1 }
}

async function testGetForumThreads() {
  console.log('🔍 Testing getForumThreads logic...\n')
  
  const { data: threads, error } = await supabase
    .from("forum_threads")
    .select("*")
    .eq("is_deleted", false)
    .or("status.eq.approved,status.is.null")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  console.log(`Found ${threads.length} threads`)

  const authorIds = threads.map(t => t.author_id).filter(Boolean)
  console.log('Author IDs:', authorIds)
  
  const authorsMap = await getAuthorsMap(authorIds)
  console.log('Authors Map keys:', Object.keys(authorsMap))
  console.log('Authors Map:', authorsMap)

  console.log('\n--- Formatted Threads ---')
  const formatted = threads.map(t => ({
    ...t,
    author: formatAuthor(authorsMap[t.author_id], t.author_id)
  }))

  for (const t of formatted) {
    console.log(`✅ "${t.title.substring(0, 40)}..." by ${t.author.username}`)
  }
  
  console.log('\n✅ Test complete!')
}

testGetForumThreads().catch(console.error)
