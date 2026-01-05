require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Fixed getAuthorsMap - handles both UUID and discord_id
async function getAuthorsMap(authorIds) {
  if (!authorIds.length) return {}
  const uniqueIds = [...new Set(authorIds.filter(Boolean))]
  const map = {}

  // Separate UUIDs from discord_ids
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const uuids = uniqueIds.filter(id => uuidRegex.test(id))
  const discordIds = uniqueIds.filter(id => !uuidRegex.test(id))

  console.log('  UUIDs:', uuids.length, 'Discord IDs:', discordIds.length)

  // Query by UUID
  if (uuids.length > 0) {
    const { data: u1 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("id", uuids)
    for (const u of u1 || []) map[u.id] = u
    console.log('  Found by UUID:', (u1 || []).length)
  }

  // Query by discord_id
  const missingUuids = uuids.filter(id => !map[id])
  const allDiscordIds = [...discordIds, ...missingUuids]
  
  if (allDiscordIds.length > 0) {
    const { data: u2 } = await supabase.from("users").select("id, discord_id, username, avatar, membership, xp, level").in("discord_id", allDiscordIds)
    for (const u of u2 || []) map[u.discord_id] = u
    console.log('  Found by discord_id:', (u2 || []).length)
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
    }
  }
  return { id: fallbackId, username: "User", avatar: null, membership: "member" }
}

async function test() {
  console.log('🔍 Testing Fixed Author Lookup\n')
  
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('is_deleted', false)
    .or('status.eq.approved,status.is.null')
    .order('created_at', { ascending: false })
    .limit(10)
  
  console.log(`Found ${threads.length} threads\n`)
  
  const authorIds = threads.map(t => t.author_id).filter(Boolean)
  console.log('Getting authors for:', authorIds)
  
  const authorsMap = await getAuthorsMap(authorIds)
  console.log('\nAuthors Map:', Object.keys(authorsMap).length, 'entries')
  
  console.log('\n--- Results ---')
  for (const t of threads) {
    const author = formatAuthor(authorsMap[t.author_id], t.author_id)
    const status = author.username !== 'User' ? '✅' : '❌'
    console.log(`${status} "${t.title.substring(0, 40)}..." by ${author.username}`)
  }
  
  console.log('\n✅ Test complete!')
}

test().catch(console.error)
