const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixForumAuthors() {
  console.log('🔧 Fixing Forum Authors Data...\n')
  
  try {
    // 1. Get all forum threads
    const { data: threads, error: threadsError } = await supabase
      .from('forum_threads')
      .select('id, author_id, title')
    
    if (threadsError) {
      console.error('❌ Error fetching threads:', threadsError)
      return
    }
    
    console.log(`Found ${threads.length} threads to check`)
    
    // 2. Get all users for mapping
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, discord_id, username')
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    console.log(`Found ${users.length} users for mapping`)
    
    // 3. Create mapping: user.id -> discord_id
    const userIdToDiscordId = {}
    const discordIdToUserId = {}
    
    users.forEach(user => {
      userIdToDiscordId[user.id] = user.discord_id
      discordIdToUserId[user.discord_id] = user.id
    })
    
    // 4. Check and fix each thread
    let fixed = 0
    let alreadyCorrect = 0
    let notFound = 0
    
    for (const thread of threads) {
      const authorId = thread.author_id
      
      // Check if author_id is a UUID (user.id format)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authorId)
      
      if (isUUID) {
        // Convert UUID to Discord ID
        const discordId = userIdToDiscordId[authorId]
        
        if (discordId) {
          console.log(`🔄 Fixing thread \"${thread.title}\"`)
          console.log(`   UUID: ${authorId} -> Discord ID: ${discordId}`)
          
          const { error: updateError } = await supabase
            .from('forum_threads')
            .update({ author_id: discordId })
            .eq('id', thread.id)
          
          if (updateError) {
            console.error(`❌ Error updating thread ${thread.id}:`, updateError)
          } else {
            fixed++
          }
        } else {
          console.log(`⚠️  Thread \"${thread.title}\" - UUID ${authorId} not found in users`)
          notFound++
        }
      } else {
        // Already in Discord ID format
        const userExists = discordIdToUserId[authorId]
        if (userExists) {
          console.log(`✅ Thread \"${thread.title}\" - Already correct (Discord ID: ${authorId})`)
          alreadyCorrect++
        } else {
          console.log(`⚠️  Thread \"${thread.title}\" - Discord ID ${authorId} not found in users`)
          notFound++
        }
      }
    }
    
    console.log('\\n' + '='.repeat(50))
    console.log('📊 SUMMARY:')
    console.log(`✅ Fixed: ${fixed} threads`)
    console.log(`✅ Already correct: ${alreadyCorrect} threads`)
    console.log(`⚠️  Not found: ${notFound} threads`)
    console.log(`📝 Total processed: ${threads.length} threads`)
    
    if (fixed > 0) {
      console.log('\\n🎉 Forum authors have been fixed!')
      console.log('The Recent Threads should now show correct Discord usernames and avatars.')
    }
    
  } catch (error) {
    console.error('❌ Fix error:', error)
  }
}

fixForumAuthors()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })