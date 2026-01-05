/**
 * Test Forum Connections - Verify all forum APIs work correctly
 * Run: node scripts/test-forum-connections.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n🔍 Testing: ${name}`)
    console.log(`   URL: ${url}`)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`)
      
      // Show relevant data summary
      if (Array.isArray(data)) {
        console.log(`   📊 Items: ${data.length}`)
        if (data.length > 0) {
          console.log(`   📝 Sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...')
        }
      } else if (data.threads) {
        console.log(`   📊 Threads: ${data.threads.length}`)
        if (data.threads.length > 0) {
          const t = data.threads[0]
          console.log(`   📝 First thread: "${t.title}" by ${t.author?.username || 'Unknown'}`)
        }
      } else if (data.replies) {
        console.log(`   📊 Replies: ${data.replies.length}`)
      } else if (data.success !== undefined) {
        console.log(`   📊 Success: ${data.success}`)
        if (data.data) {
          console.log(`   📝 Data:`, JSON.stringify(data.data, null, 2).substring(0, 300))
        }
      } else {
        console.log(`   📝 Response:`, JSON.stringify(data, null, 2).substring(0, 300))
      }
      
      return { success: true, data }
    } else {
      console.log(`   ❌ Status: ${response.status}`)
      console.log(`   ❌ Error:`, data.error || data.message || 'Unknown error')
      return { success: false, error: data }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('=' .repeat(60))
  console.log('🧪 FORUM CONNECTION TESTS')
  console.log('=' .repeat(60))
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Time: ${new Date().toISOString()}`)
  
  const results = []
  
  // 1. Test Categories API
  const categoriesResult = await testEndpoint(
    'Forum Categories',
    `${BASE_URL}/api/forum/categories`
  )
  results.push({ name: 'Categories', ...categoriesResult })
  
  // 2. Test Threads API
  const threadsResult = await testEndpoint(
    'Forum Threads (All)',
    `${BASE_URL}/api/forum/threads`
  )
  results.push({ name: 'Threads', ...threadsResult })
  
  // 3. Test Threads by Category (if categories exist)
  if (categoriesResult.success && categoriesResult.data?.length > 0) {
    const categoryId = categoriesResult.data[0].id
    const categoryThreadsResult = await testEndpoint(
      `Forum Threads (Category: ${categoriesResult.data[0].name})`,
      `${BASE_URL}/api/forum/threads?category=${categoryId}`
    )
    results.push({ name: 'Threads by Category', ...categoryThreadsResult })
  }
  
  // 4. Test Thread Detail (if threads exist)
  let threadId = null
  if (threadsResult.success && threadsResult.data?.threads?.length > 0) {
    threadId = threadsResult.data.threads[0].id
    const threadDetailResult = await testEndpoint(
      `Thread Detail (ID: ${threadId})`,
      `${BASE_URL}/api/forum/threads/${threadId}`
    )
    results.push({ name: 'Thread Detail', ...threadDetailResult })
    
    // 5. Test Replies API
    const repliesResult = await testEndpoint(
      `Thread Replies (Thread: ${threadId})`,
      `${BASE_URL}/api/forum/threads/${threadId}/replies`
    )
    results.push({ name: 'Replies', ...repliesResult })
  }
  
  // 6. Test Online Users API
  const onlineUsersResult = await testEndpoint(
    'Online Users',
    `${BASE_URL}/api/forum/online-users`
  )
  results.push({ name: 'Online Users', ...onlineUsersResult })
  
  // 7. Test Top Contributors API
  const topContributorsResult = await testEndpoint(
    'Top Contributors',
    `${BASE_URL}/api/forum/top-contributors`
  )
  results.push({ name: 'Top Contributors', ...topContributorsResult })
  
  // 8. Test Stats API
  const statsResult = await testEndpoint(
    'Stats',
    `${BASE_URL}/api/stats`
  )
  results.push({ name: 'Stats', ...statsResult })
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('=' .repeat(60))
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌'
    console.log(`${icon} ${r.name}`)
  })
  
  console.log('\n' + '-'.repeat(60))
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All forum connections are working correctly!')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.')
  }
  
  return { passed, failed, total: results.length }
}

// Run tests
runTests().catch(console.error)
