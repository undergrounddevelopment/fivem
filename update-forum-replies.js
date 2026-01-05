const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateForumReplies() {
  console.log('🔧 Updating Forum Replies to use Discord ID...\n')
  
  try {
    // Get all forum replies
    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('id, author_id')
    
    if (repliesError) {
      console.error('❌ Error fetching replies:', repliesError)
      return
    }
    
    console.log(`Found ${replies.length} replies to check`)
    
    // Get all users for mapping
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, discord_id')
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    // Create mapping: user.id -> discord_id
    const userIdToDiscordId = {}
    users.forEach(user => {
      userIdToDiscordId[user.id] = user.discord_id
    })
    
    let updated = 0
    let alreadyCorrect = 0
    
    for (const reply of replies) {
      const authorId = reply.author_id
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authorId)
      
      if (isUUID) {
        const discordId = userIdToDiscordId[authorId]
        if (discordId) {
          const { error: updateError } = await supabase
            .from('forum_replies')
            .update({ author_id: discordId })
            .eq('id', reply.id)
          
          if (!updateError) {
            updated++
            console.log(`✅ Updated reply ${reply.id}: ${authorId} -> ${discordId}`)
          }
        }
      } else {
        alreadyCorrect++
      }
    }
    
    console.log(`\n📊 SUMMARY:`)
    console.log(`✅ Updated: ${updated} replies`)
    console.log(`✅ Already correct: ${alreadyCorrect} replies`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

updateForumReplies()