/**
 * Test Forum Reply System
 * Run: node scripts/test-forum-reply.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function testForumSystem() {
  console.log('🧪 Testing Forum System...\n')
  
  // Test 1: Get forum threads
  console.log('1️⃣ Testing GET /api/forum/threads...')
  try {
    const res = await fetch(`${BASE_URL}/api/forum/threads?limit=5`)
    const data = await res.json()
    
    if (data.success && data.threads) {
      console.log(`   ✅ Found ${data.threads.length} threads`)
      
      // Check author data
      for (const thread of data.threads.slice(0, 3)) {
        const authorName = thread.author?.username || 'Unknown'
        console.log(`   📝 Thread: "${thread.title.substring(0, 40)}..." by ${authorName}`)
        
        if (authorName === 'Unknown' || authorName === 'User') {
          console.log(`   ⚠️  Warning: Author not resolved for thread ${thread.id}`)
        }
      }
    } else {
      console.log('   ❌ Failed to get threads:', data.error || 'Unknown error')
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
  
  // Test 2: Get thread detail with replies
  console.log('\n2️⃣ Testing GET /api/forum/threads/[id]...')
  try {
    // First get a thread ID
    const listRes = await fetch(`${BASE_URL}/api/forum/threads?limit=1`)
    const listData = await listRes.json()
    
    if (listData.threads && listData.threads.length > 0) {
      const threadId = listData.threads[0].id
      console.log(`   📌 Testing thread: ${threadId}`)
      
      const res = await fetch(`${BASE_URL}/api/forum/threads/${threadId}`)
      const thread = await res.json()
      
      if (thread.id) {
        console.log(`   ✅ Thread loaded: "${thread.title}"`)
        console.log(`   👤 Author: ${thread.author?.username || 'Unknown'}`)
        console.log(`   💬 Replies: ${thread.replies?.length || 0}`)
        
        // Check reply authors
        if (thread.replies && thread.replies.length > 0) {
          for (const reply of thread.replies.slice(0, 3)) {
            const replyAuthor = reply.author?.username || 'Unknown'
            console.log(`      └─ Reply by: ${replyAuthor}`)
            
            if (replyAuthor === 'Unknown' || replyAuthor === 'User') {
              console.log(`      ⚠️  Warning: Reply author not resolved`)
            }
          }
        }
      } else {
        console.log('   ❌ Failed to get thread detail')
      }
    } else {
      console.log('   ⚠️  No threads found to test')
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
  
  // Test 3: Get online users
  console.log('\n3️⃣ Testing GET /api/realtime/online-users...')
  try {
    const res = await fetch(`${BASE_URL}/api/realtime/online-users`)
    const data = await res.json()
    
    if (data.success && data.data) {
      console.log(`   ✅ Found ${data.data.length} online users`)
      
      for (const user of data.data.slice(0, 5)) {
        console.log(`   👤 ${user.username} (${user.membership}) - ${user.status}`)
      }
    } else {
      console.log('   ⚠️  No online users or error:', data)
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
  
  // Test 4: Get forum categories
  console.log('\n4️⃣ Testing GET /api/forum/categories...')
  try {
    const res = await fetch(`${BASE_URL}/api/forum/categories`)
    const data = await res.json()
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   ✅ Found ${data.length} categories`)
      for (const cat of data.slice(0, 5)) {
        console.log(`   📁 ${cat.name}: ${cat.threadCount || 0} threads`)
      }
    } else if (data.categories) {
      console.log(`   ✅ Found ${data.categories.length} categories`)
    } else {
      console.log('   ⚠️  No categories found')
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
  
  // Test 5: Get top contributors
  console.log('\n5️⃣ Testing GET /api/forum/top-contributors...')
  try {
    const res = await fetch(`${BASE_URL}/api/forum/top-contributors`)
    const data = await res.json()
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   ✅ Found ${data.length} top contributors`)
      for (const user of data.slice(0, 5)) {
        console.log(`   🏆 ${user.username}: ${user.points} points (${user.threads} threads, ${user.replies} replies)`)
      }
    } else {
      console.log('   ⚠️  No top contributors found')
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message)
  }
  
  console.log('\n✨ Forum system test complete!')
}

testForumSystem().catch(console.error)
