require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  console.log('🔍 Final Forum Test\n')
  
  // Get threads
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, title, author_id')
    .eq('is_deleted', false)
    .limit(5)
  
  console.log('Threads:')
  for (const t of threads || []) {
    console.log(`  - ${t.title.substring(0, 30)}... (author_id: ${t.author_id})`)
  }
  
  // Get unique author IDs
  const authorIds = [...new Set((threads || []).map(t => t.author_id).filter(Boolean))]
  console.log('\nUnique author IDs:', authorIds)
  
  // Query users with IN
  console.log('\nQuerying users with IN...')
  const { data: users, error } = await supabase
    .from('users')
    .select('id, discord_id, username')
    .in('id', authorIds)
  
  console.log('Query result:', users?.length, 'users found')
  if (error) console.log('Error:', error.message)
  
  for (const u of users || []) {
    console.log(`  ✅ ${u.id} -> ${u.username}`)
  }
  
  // Check which IDs are missing
  const foundIds = new Set((users || []).map(u => u.id))
  const missingIds = authorIds.filter(id => !foundIds.has(id))
  
  if (missingIds.length > 0) {
    console.log('\n⚠️ Missing IDs (not found as UUID):')
    for (const id of missingIds) {
      console.log(`  - ${id}`)
      
      // Try to find by discord_id
      const { data: byDiscord } = await supabase
        .from('users')
        .select('id, discord_id, username')
        .eq('discord_id', id)
        .single()
      
      if (byDiscord) {
        console.log(`    Found by discord_id: ${byDiscord.username}`)
      } else {
        console.log(`    NOT FOUND by discord_id either`)
      }
    }
  }
  
  console.log('\n✅ Test complete!')
}

test().catch(console.error)
