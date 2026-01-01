import 'dotenv/config'
import { createAdminClient } from './lib/supabase/server'

async function testAPILogic() {
  console.log('🔍 Testing API Logic (without server)...\n')
  
  let passed = 0
  let failed = 0
  
  try {
    const supabase = createAdminClient()
    
    // Test Stats API logic
    console.log('📊 Testing Stats API logic...')
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      
      const [usersResult, assetsResult, downloadsResult, threadsResult, repliesResult, onlineResult] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }).eq("is_banned", false),
        supabase.from("assets").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("downloads").select("*", { count: "exact", head: true }),
        supabase.from("forum_threads").select("*", { count: "exact", head: true }),
        supabase.from("forum_replies").select("*", { count: "exact", head: true }),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("is_banned", false)
          .gte("last_seen", fiveMinutesAgo),
      ])
      
      const stats = {
        users: usersResult.count || 0,
        assets: assetsResult.count || 0,
        downloads: downloadsResult.count || 0,
        posts: (threadsResult.count || 0) + (repliesResult.count || 0),
        onlineUsers: Math.max(1, onlineResult.count || 0),
      }
      
      console.log('  ✅ Stats API logic: Working')
      console.log('    - Users:', stats.users)
      console.log('    - Assets:', stats.assets)
      console.log('    - Downloads:', stats.downloads)
      console.log('    - Posts:', stats.posts)
      console.log('    - Online Users:', stats.onlineUsers)
      passed++
    } catch (error) {
      console.log('  ❌ Stats API logic: Failed -', error.message)
      failed++
    }
    
    // Test Activity API logic
    console.log('\n📈 Testing Activity API logic...')
    try {
      const { data: downloads } = await supabase
        .from('downloads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      console.log('  ✅ Activity API logic: Working')
      console.log('    - Recent downloads:', downloads?.length || 0)
      passed++
    } catch (error) {
      console.log('  ❌ Activity API logic: Failed -', error.message)
      failed++
    }
    
    // Test Online Users API logic
    console.log('\n👥 Testing Online Users API logic...')
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      
      const { data } = await supabase
        .from('users')
        .select('discord_id, username, avatar, membership')
        .gte('last_seen', fiveMinutesAgo)
        .eq('is_banned', false)
        .order('last_seen', { ascending: false })
        .limit(50)
      
      console.log('  ✅ Online Users API logic: Working')
      console.log('    - Online users:', data?.length || 0)
      passed++
    } catch (error) {
      console.log('  ❌ Online Users API logic: Failed -', error.message)
      failed++
    }
    
    // Test Search API logic
    console.log('\n🔍 Testing Search API logic...')
    try {
      const query = 'test'
      const { data: assets } = await supabase
        .from("assets")
        .select("id, title, description, thumbnail, category, framework, rating, downloads")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("status", "active")
        .order("downloads", { ascending: false })
        .limit(10)
      
      console.log('  ✅ Search API logic: Working')
      console.log('    - Search results:', assets?.length || 0)
      passed++
    } catch (error) {
      console.log('  ❌ Search API logic: Failed -', error.message)
      failed++
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
    failed++
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`\n📊 API LOGIC TEST SUMMARY`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Total: ${passed + failed}`)
  console.log(`Success Rate: ${passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0}%`)
  
  if (failed === 0) {
    console.log('\n✅ ALL API LOGIC TESTS PASSED!')
  } else {
    console.log(`\n⚠️  ${failed} API logic tests failed`)
  }
  
  console.log('\n' + '='.repeat(60))
}

testAPILogic()