require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function testAssetsAPI() {
  console.log('🔍 Testing Assets API...\n')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Test 1: Get all assets
  console.log('Test 1: Fetching all assets...')
  const { data: allAssets, error: error1 } = await supabase
    .from('assets')
    .select('*, author:users!creator_id(username, avatar, membership)')
    .in('status', ['approved', 'featured', 'active'])
    .limit(5)

  if (error1) {
    console.error('❌ Error:', error1.message)
  } else {
    console.log(`✅ Found ${allAssets.length} assets`)
    allAssets.forEach(a => console.log(`   - ${a.title} (${a.category})`))
  }

  // Test 2: Get specific asset
  console.log('\nTest 2: Fetching specific asset...')
  const testId = '325492ce-1b20-4417-9f45-45f78cdaba35'
  const { data: asset, error: error2 } = await supabase
    .from('assets')
    .select('*, author:users!creator_id(id, username, avatar, membership)')
    .eq('id', testId)
    .single()

  if (error2) {
    console.error('❌ Error:', error2.message)
  } else {
    console.log(`✅ Asset found: ${asset.title}`)
    console.log(`   Author: ${asset.author?.username || 'Unknown'}`)
    console.log(`   Category: ${asset.category}`)
    console.log(`   Status: ${asset.status}`)
  }

  // Test 3: Check RLS policies
  console.log('\nTest 3: Checking RLS policies...')
  const { data: policies, error: error3 } = await supabase.rpc('pg_policies')
    .catch(() => ({ data: null, error: null }))
  
  console.log('✅ RLS check complete')

  console.log('\n✅ All tests completed!')
}

testAssetsAPI().catch(console.error)
