const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugForumAuthors() {
  console.log('🔍 Debugging Forum Authors Issue...\n')
  
  try {
    // 1. Check users table structure
    console.log('1. Checking users table structure:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(3)
    
    if (usersError) {
      console.error('❌ Users table error:', usersError)
    } else {
      console.log('✅ Users sample data:')
      users.forEach(user => {
        console.log(`  - ID: ${user.id}`)
        console.log(`  - Discord ID: ${user.discord_id}`)
        console.log(`  - Username: ${user.username}`)
        console.log(`  - Avatar: ${user.avatar}`)
        console.log('  ---')
      })
    }
    
    // 2. Check forum_threads table structure
    console.log('\n2. Checking forum_threads table structure:')
    const { data: threads, error: threadsError } = await supabase
      .from('forum_threads')
      .select('*')
      .limit(3)
    
    if (threadsError) {
      console.error('❌ Forum threads table error:', threadsError)
    } else {
      console.log('✅ Forum threads sample data:')
      threads.forEach(thread => {
        console.log(`  - ID: ${thread.id}`)
        console.log(`  - Title: ${thread.title}`)
        console.log(`  - Author ID: ${thread.author_id}`)
        console.log(`  - User ID: ${thread.user_id}`)
        console.log('  ---')
      })
    }
    
    // 3. Check if author_id matches any discord_id in users
    console.log('\n3. Checking author_id matching:')
    if (threads && threads.length > 0) {
      const authorIds = threads.map(t => t.author_id).filter(Boolean)
      console.log('Author IDs from threads:', authorIds)
      
      // Try to find matching users by discord_id
      const { data: matchingUsers, error: matchError } = await supabase
        .from('users')
        .select('id, discord_id, username, avatar')
        .in('discord_id', authorIds)
      
      if (matchError) {
        console.error('❌ Matching error:', matchError)
      } else {
        console.log('✅ Matching users found:')
        matchingUsers.forEach(user => {
          console.log(`  - Discord ID: ${user.discord_id} -> Username: ${user.username}`)
        })
        
        if (matchingUsers.length === 0) {
          console.log('⚠️  NO MATCHING USERS FOUND!')
          console.log('This means author_id in forum_threads does not match discord_id in users')
          
          // Check if author_id matches user.id instead
          const { data: matchingById, error: byIdError } = await supabase
            .from('users')
            .select('id, discord_id, username, avatar')
            .in('id', authorIds)
          
          if (!byIdError && matchingById.length > 0) {
            console.log('\n✅ Found matches by user.id instead:')
            matchingById.forEach(user => {
              console.log(`  - User ID: ${user.id} -> Username: ${user.username}`)
            })
          }
        }
      }
    }
    
    // 4. Check all users to see data format
    console.log('\n4. All users in database:')
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, discord_id, username, avatar')
      .limit(10)
    
    if (!allUsersError && allUsers) {
      allUsers.forEach(user => {
        console.log(`  - ID: ${user.id} | Discord: ${user.discord_id} | Username: ${user.username}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugForumAuthors()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })