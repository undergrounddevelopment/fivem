const fetch = require('node-fetch')

async function testForumAPI() {
  console.log('🧪 Testing Forum Threads API...\n')
  
  try {
    const response = await fetch('http://localhost:3000/api/forum/threads?limit=5')
    const data = await response.json()
    
    if (data.success && data.threads) {
      console.log(`✅ API Response: ${data.threads.length} threads found`)
      
      data.threads.forEach((thread, index) => {
        console.log(`\\n📝 Thread ${index + 1}: "${thread.title}"`)
        console.log(`   Author ID: ${thread.author_id}`)
        console.log(`   Author Username: ${thread.author.username}`)
        console.log(`   Author Avatar: ${thread.author.avatar ? 'Has avatar' : 'No avatar'}`)
        console.log(`   Author Membership: ${thread.author.membership}`)
        console.log(`   Replies: ${thread.replies}`)
        console.log(`   Views: ${thread.views}`)
      })
      
      console.log('\\n🎉 Forum API is working correctly!')
      console.log('Recent Threads should now display proper Discord usernames and avatars.')
    } else {
      console.error('❌ API Error:', data.error || 'Unknown error')
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
    console.log('\\n💡 Make sure the development server is running with: pnpm dev')
  }
}

testForumAPI()