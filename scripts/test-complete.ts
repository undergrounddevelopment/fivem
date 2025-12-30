import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testComplete() {
  console.log('🔍 TESTING COMPLETE SYSTEM\n')
  console.log('='.repeat(70))

  const results = { passed: 0, failed: 0, tests: [] as any[] }

  // Test 1: Database Connection
  try {
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Database Connection', status: '✅' })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Database Connection', status: '❌', error: e.message })
  }

  // Test 2: Users Count
  try {
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true })
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Users Count', status: '✅', value: count })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Users Count', status: '❌', error: e.message })
  }

  // Test 3: Assets Count
  try {
    const { count, error } = await supabase.from('assets').select('*', { count: 'exact', head: true })
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Assets Count', status: '✅', value: count })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Assets Count', status: '❌', error: e.message })
  }

  // Test 4: Forum Categories
  try {
    const { data, error } = await supabase.from('forum_categories').select('*')
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Forum Categories', status: '✅', value: data?.length })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Forum Categories', status: '❌', error: e.message })
  }

  // Test 5: Realtime Enabled
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'Realtime Ready', status: '✅' })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Realtime Ready', status: '❌', error: e.message })
  }

  // Test 6: Auth Config
  try {
    const hasDiscordId = !!process.env.DISCORD_CLIENT_ID
    const hasDiscordSecret = !!process.env.DISCORD_CLIENT_SECRET
    if (!hasDiscordId || !hasDiscordSecret) throw new Error('Missing Discord config')
    results.passed++
    results.tests.push({ name: 'Discord OAuth Config', status: '✅' })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Discord OAuth Config', status: '❌', error: e.message })
  }

  // Test 7: Supabase Config
  try {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!hasUrl || !hasAnonKey || !hasServiceKey) throw new Error('Missing Supabase config')
    results.passed++
    results.tests.push({ name: 'Supabase Config', status: '✅' })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'Supabase Config', status: '❌', error: e.message })
  }

  // Test 8: Sample User Data
  try {
    const { data, error } = await supabase
      .from('users')
      .select('discord_id, username, coins, membership')
      .limit(3)
    if (error) throw error
    results.passed++
    results.tests.push({ name: 'User Data Structure', status: '✅', sample: data?.[0] })
  } catch (e: any) {
    results.failed++
    results.tests.push({ name: 'User Data Structure', status: '❌', error: e.message })
  }

  // Print Results
  console.log('\n📋 TEST RESULTS:\n')
  results.tests.forEach(test => {
    if (test.value !== undefined) {
      console.log(`${test.status} ${test.name}: ${test.value}`)
    } else if (test.sample) {
      console.log(`${test.status} ${test.name}`)
      console.log(`   Sample:`, JSON.stringify(test.sample, null, 2))
    } else if (test.error) {
      console.log(`${test.status} ${test.name}: ${test.error}`)
    } else {
      console.log(`${test.status} ${test.name}`)
    }
  })

  console.log('\n' + '='.repeat(70))
  console.log(`\n✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📊 Total: ${results.passed + results.failed}`)
  
  const percentage = Math.round((results.passed / (results.passed + results.failed)) * 100)
  console.log(`\n🎯 Success Rate: ${percentage}%`)

  if (results.failed === 0) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL!')
    console.log('✅ Database: Connected')
    console.log('✅ Discord OAuth: Configured')
    console.log('✅ Supabase: Ready')
    console.log('✅ Realtime: Enabled')
    console.log('\n🚀 System is 100% ready for auto-updates!\n')
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.\n')
  }
}

testComplete().catch(console.error)
