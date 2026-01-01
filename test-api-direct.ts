import 'dotenv/config'
import { createAdminClient } from './lib/supabase/server'

async function testAPI() {
  try {
    console.log('🔍 Testing API endpoints...')
    
    // Test database connection
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('users').select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Database connection error:', error)
      return
    }
    
    console.log('✅ Database connection successful')
    console.log('✅ User count:', data?.length || 0)
    
    // Test basic queries
    const [usersResult, assetsResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_banned', false),
      supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ])
    
    console.log('✅ Users query successful:', usersResult.count || 0)
    console.log('✅ Assets query successful:', assetsResult.count || 0)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAPI()