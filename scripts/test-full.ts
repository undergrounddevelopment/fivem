import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testAll() {
  console.log('🧪 FULL SYSTEM TEST\n')
  console.log('='.repeat(60))

  const results = {
    passed: 0,
    failed: 0,
    tests: [] as any[]
  }

  // Test 1: Users
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Users Table', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Users Table', status: '❌', error: e.message })
  }

  // Test 2: Assets
  try {
    const { data, error } = await supabase.from('assets').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Assets Table', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Assets Table', status: '❌', error: e.message })
  }

  // Test 3: Forum Categories
  try {
    const { data, error } = await supabase.from('forum_categories').select('*')
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Forum Categories', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Forum Categories', status: '❌', error: e.message })
  }

  // Test 4: Forum Threads
  try {
    const { data, error } = await supabase.from('forum_threads').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Forum Threads', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Forum Threads', status: '❌', error: e.message })
  }

  // Test 5: Forum Replies
  try {
    const { data, error } = await supabase.from('forum_replies').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Forum Replies', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Forum Replies', status: '❌', error: e.message })
  }

  // Test 6: Downloads
  try {
    const { data, error } = await supabase.from('downloads').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Downloads', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Downloads', status: '❌', error: e.message })
  }

  // Test 7: Notifications
  try {
    const { data, error } = await supabase.from('notifications').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Notifications', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Notifications', status: '❌', error: e.message })
  }

  // Test 8: Activities
  try {
    const { data, error } = await supabase.from('activities').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Activities', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Activities', status: '❌', error: e.message })
  }

  // Test 9: Coin Transactions
  try {
    const { data, error } = await supabase.from('coin_transactions').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Coin Transactions', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Coin Transactions', status: '❌', error: e.message })
  }

  // Test 10: Testimonials
  try {
    const { data, error } = await supabase.from('testimonials').select('*').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Testimonials', status: '✅', count: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Testimonials', status: '❌', error: e.message })
  }

  // Test 11: User Count
  try {
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true })
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Total Users', status: '✅', count })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Total Users', status: '❌', error: e.message })
  }

  // Test 12: Asset Count
  try {
    const { count, error } = await supabase.from('assets').select('*', { count: 'exact', head: true })
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Total Assets', status: '✅', count })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Total Assets', status: '❌', error: e.message })
  }

  // Print Results
  console.log('\n📋 TEST RESULTS:\n')
  results.tests.forEach(test => {
    if (test.count !== undefined) {
      console.log(`${test.status} ${test.name}: ${test.count}`)
    } else if (test.error) {
      console.log(`${test.status} ${test.name}: ${test.error}`)
    } else {
      console.log(`${test.status} ${test.name}`)
    }
  })

  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📊 Total: ${results.passed + results.failed}`)
  
  const percentage = Math.round((results.passed / (results.passed + results.failed)) * 100)
  console.log(`\n🎯 Success Rate: ${percentage}%\n`)

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! System is 100% operational!\n')
  } else {
    console.log('⚠️  Some tests failed. Check errors above.\n')
  }
}

testAll().catch(console.error)
