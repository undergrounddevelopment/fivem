import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

async function diagnoseOAuthError() {
  console.log('\n🔍 DIAGNOSING OAUTH ERROR\n')

  // 1. Check environment variables
  console.log('1️⃣ Environment Variables:')
  console.log('   NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  console.log('   DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID)
  console.log('   DISCORD_CLIENT_SECRET:', process.env.DISCORD_CLIENT_SECRET ? '✅ Set' : '❌ Missing')
  console.log('   NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing')

  // 2. Test Supabase connection
  console.log('\n2️⃣ Testing Supabase Connection:')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) throw error
    console.log('   ✅ Supabase connected')
  } catch (error: any) {
    console.log('   ❌ Supabase error:', error.message)
  }

  // 3. Check users table structure
  console.log('\n3️⃣ Checking Users Table:')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) throw error

    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      console.log('   Columns:', columns.join(', '))
      
      const required = ['discord_id', 'username', 'email', 'coins', 'membership', 'is_admin']
      const missing = required.filter(col => !columns.includes(col))
      
      if (missing.length > 0) {
        console.log('   ❌ Missing columns:', missing.join(', '))
      } else {
        console.log('   ✅ All required columns exist')
      }
    }
  } catch (error: any) {
    console.log('   ❌ Table error:', error.message)
  }

  // 4. Test INSERT operation
  console.log('\n4️⃣ Testing INSERT:')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const testId = 'OAUTH_TEST_' + Date.now()
    const { error } = await supabase.from('users').insert({
      discord_id: testId,
      username: 'OAuthTest',
      email: 'oauth@test.com',
      coins: 100,
      membership: 'free',
      is_admin: false,
    })

    if (error) throw error
    console.log('   ✅ INSERT works')

    // Cleanup
    await supabase.from('users').delete().eq('discord_id', testId)
  } catch (error: any) {
    console.log('   ❌ INSERT failed:', error.message)
    console.log('   Details:', error)
  }

  console.log('\n' + '='.repeat(50))
  console.log('📋 NEXT STEPS:')
  console.log('1. Check Vercel logs for actual error')
  console.log('2. Verify Discord redirect URI matches exactly')
  console.log('3. Ensure NEXTAUTH_URL in Vercel = https://www.fivemtools.net')
  console.log('='.repeat(50) + '\n')
}

diagnoseOAuthError()
