/**
 * Test Author Lookup
 * Run: node scripts/test-author-lookup.js
 */

require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Using Supabase URL:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthorLookup() {
  console.log('🔍 Testing Author Lookup...\n')
  
  // Test UUID that's not resolving
  const testUUID = 'f941f110-6e93-4b59-90b6-8aaf074ff743'
  
  console.log(`Testing UUID: ${testUUID}`)
  
  // Test 1: Direct UUID lookup
  console.log('\n1️⃣ Direct UUID lookup...')
  const { data: byUUID, error: uuidError } = await supabase
    .from('users')
    .select('id, discord_id, username, avatar, membership')
    .eq('id', testUUID)
    .single()
  
  if (uuidError) {
    console.log('   Error:', uuidError.message)
  } else {
    console.log('   Found:', byUUID?.username || 'NOT FOUND')
  }
  
  // Test 2: IN query with UUID
  console.log('\n2️⃣ IN query with UUID...')
  const { data: byIn, error: inError } = await supabase
    .from('users')
    .select('id, discord_id, username, avatar, membership')
    .in('id', [testUUID])
  
  if (inError) {
    console.log('   Error:', inError.message)
  } else {
    console.log('   Found:', byIn?.length || 0, 'users')
    if (byIn && byIn.length > 0) {
      console.log('   User:', byIn[0].username)
    }
  }
  
  // Test 3: Search by username
  console.log('\n3️⃣ Search by username "runkzerigalaa"...')
  const { data: byName, error: nameError } = await supabase
    .from('users')
    .select('id, discord_id, username')
    .eq('username', 'runkzerigalaa')
    .single()
  
  if (nameError) {
    console.log('   Error:', nameError.message)
  } else {
    console.log('   Found:', byName?.username)
    console.log('   UUID:', byName?.id)
    console.log('   Discord ID:', byName?.discord_id)
    
    // Compare UUIDs
    if (byName?.id === testUUID) {
      console.log('   ✅ UUID matches!')
    } else {
      console.log('   ❌ UUID mismatch!')
      console.log('   Expected:', testUUID)
      console.log('   Got:', byName?.id)
    }
  }
  
  // Test 4: Get all users and check
  console.log('\n4️⃣ Checking all users for UUID match...')
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, discord_id, username')
    .limit(1000)
  
  const matchingUser = allUsers?.find(u => u.id === testUUID)
  if (matchingUser) {
    console.log('   ✅ Found user:', matchingUser.username)
  } else {
    console.log('   ❌ No user found with UUID:', testUUID)
    
    // Check if there's a similar UUID
    const similar = allUsers?.filter(u => u.id?.includes('f941f110'))
    if (similar && similar.length > 0) {
      console.log('   Similar UUIDs found:')
      similar.forEach(u => console.log(`      ${u.id} - ${u.username}`))
    }
  }
  
  console.log('\n✅ Test complete!')
}

testAuthorLookup().catch(console.error)
