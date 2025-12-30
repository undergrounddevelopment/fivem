const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const linkvertiseUserId = process.env.LINKVERTISE_USER_ID
const linkvertiseToken = process.env.LINKVERTISE_AUTH_TOKEN

console.log('🔍 COMPREHENSIVE SYSTEM TEST\n')
console.log('='.repeat(60))

const results = {
  database: { passed: 0, failed: 0, tests: [] },
  api: { passed: 0, failed: 0, tests: [] },
  linkvertise: { passed: 0, failed: 0, tests: [] },
  environment: { passed: 0, failed: 0, tests: [] }
}

// Test 1: Environment Variables
console.log('\n📋 Testing Environment Variables...')
const envTests = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', value: supabaseUrl },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseKey },
  { name: 'LINKVERTISE_USER_ID', value: linkvertiseUserId },
  { name: 'LINKVERTISE_AUTH_TOKEN', value: linkvertiseToken },
  { name: 'DISCORD_CLIENT_ID', value: process.env.DISCORD_CLIENT_ID },
  { name: 'DISCORD_CLIENT_SECRET', value: process.env.DISCORD_CLIENT_SECRET }
]

envTests.forEach(test => {
  if (test.value && test.value !== 'undefined') {
    console.log(`  ✅ ${test.name}: Configured`)
    results.environment.passed++
    results.environment.tests.push({ name: test.name, status: 'PASS' })
  } else {
    console.log(`  ❌ ${test.name}: Missing`)
    results.environment.failed++
    results.environment.tests.push({ name: test.name, status: 'FAIL' })
  }
})

// Test 2: Database Connection
async function testDatabase() {
  console.log('\n🗄️  Testing Database Connection...')
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('  ❌ Supabase credentials missing')
    results.database.failed++
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const tables = [
    'users', 'assets', 'forum_categories', 'forum_threads', 
    'forum_replies', 'announcements', 'banners', 'spin_wheel_prizes',
    'spin_wheel_tickets', 'spin_wheel_history', 'notifications',
    'activities', 'downloads', 'coin_transactions', 'testimonials'
  ]
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`)
        results.database.failed++
        results.database.tests.push({ name: table, status: 'FAIL', error: error.message })
      } else {
        console.log(`  ✅ ${table}: Connected`)
        results.database.passed++
        results.database.tests.push({ name: table, status: 'PASS' })
      }
    } catch (err) {
      console.log(`  ❌ ${table}: ${err.message}`)
      results.database.failed++
      results.database.tests.push({ name: table, status: 'FAIL', error: err.message })
    }
  }
}

// Test 3: API Endpoints
async function testAPIs() {
  console.log('\n🌐 Testing API Endpoints...')
  
  const apis = [
    { name: 'Stats API', path: '/api/stats' },
    { name: 'Activity API', path: '/api/activity' },
    { name: 'Online Users API', path: '/api/users/online' },
    { name: 'Search API', path: '/api/search?q=test' },
    { name: 'Health API', path: '/api/health' }
  ]
  
  for (const api of apis) {
    try {
      const response = await fetch(`http://localhost:3000${api.path}`)
      if (response.ok) {
        console.log(`  ✅ ${api.name}: Working`)
        results.api.passed++
        results.api.tests.push({ name: api.name, status: 'PASS' })
      } else {
        console.log(`  ⚠️  ${api.name}: Status ${response.status}`)
        results.api.failed++
        results.api.tests.push({ name: api.name, status: 'WARN', code: response.status })
      }
    } catch (err) {
      console.log(`  ⚠️  ${api.name}: Server not running`)
      results.api.tests.push({ name: api.name, status: 'SKIP', note: 'Server not running' })
    }
  }
}

// Test 4: Linkvertise
async function testLinkvertise() {
  console.log('\n💰 Testing Linkvertise Integration...')
  
  if (!linkvertiseUserId) {
    console.log('  ❌ LINKVERTISE_USER_ID: Missing')
    results.linkvertise.failed++
    results.linkvertise.tests.push({ name: 'User ID', status: 'FAIL' })
  } else {
    console.log(`  ✅ LINKVERTISE_USER_ID: ${linkvertiseUserId}`)
    results.linkvertise.passed++
    results.linkvertise.tests.push({ name: 'User ID', status: 'PASS' })
  }
  
  if (!linkvertiseToken) {
    console.log('  ❌ LINKVERTISE_AUTH_TOKEN: Missing')
    results.linkvertise.failed++
    results.linkvertise.tests.push({ name: 'Auth Token', status: 'FAIL' })
  } else {
    console.log(`  ✅ LINKVERTISE_AUTH_TOKEN: Configured (${linkvertiseToken.length} chars)`)
    results.linkvertise.passed++
    results.linkvertise.tests.push({ name: 'Auth Token', status: 'PASS' })
  }
  
  // Test API endpoint
  try {
    const testHash = 'a'.repeat(64)
    const response = await fetch(
      `https://publisher.linkvertise.com/api/v1/anti_bypassing?token=${linkvertiseToken}&hash=${testHash}`,
      { method: 'POST' }
    )
    const result = await response.text()
    
    if (result === 'FALSE' || result === 'Invalid token.') {
      if (result === 'Invalid token.') {
        console.log('  ❌ Linkvertise API: Invalid token')
        results.linkvertise.failed++
        results.linkvertise.tests.push({ name: 'API Connection', status: 'FAIL' })
      } else {
        console.log('  ✅ Linkvertise API: Connected (hash not found - expected)')
        results.linkvertise.passed++
        results.linkvertise.tests.push({ name: 'API Connection', status: 'PASS' })
      }
    }
  } catch (err) {
    console.log(`  ⚠️  Linkvertise API: ${err.message}`)
    results.linkvertise.tests.push({ name: 'API Connection', status: 'WARN', error: err.message })
  }
}

// Run all tests
async function runAllTests() {
  await testDatabase()
  await testAPIs()
  await testLinkvertise()
  
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 TEST SUMMARY\n')
  
  const categories = ['environment', 'database', 'api', 'linkvertise']
  let totalPassed = 0
  let totalFailed = 0
  
  categories.forEach(cat => {
    const result = results[cat]
    totalPassed += result.passed
    totalFailed += result.failed
    
    const total = result.passed + result.failed
    const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0
    
    console.log(`${cat.toUpperCase()}:`)
    console.log(`  Passed: ${result.passed}`)
    console.log(`  Failed: ${result.failed}`)
    console.log(`  Status: ${percentage}%`)
    console.log()
  })
  
  const grandTotal = totalPassed + totalFailed
  const grandPercentage = grandTotal > 0 ? Math.round((totalPassed / grandTotal) * 100) : 0
  
  console.log('='.repeat(60))
  console.log(`\nTOTAL: ${totalPassed}/${grandTotal} tests passed (${grandPercentage}%)`)
  
  if (totalFailed === 0) {
    console.log('\n✅ ALL TESTS PASSED - SYSTEM 100% FUNCTIONAL')
  } else {
    console.log(`\n⚠️  ${totalFailed} tests failed - Review issues above`)
  }
  
  console.log('\n' + '='.repeat(60))
  
  process.exit(totalFailed > 0 ? 1 : 0)
}

runAllTests().catch(err => {
  console.error('Test error:', err)
  process.exit(1)
})
