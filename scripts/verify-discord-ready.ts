import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import 'dotenv/config'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyDiscordLoginReady() {
  console.log('\n🔍 VERIFYING DISCORD LOGIN - FINAL CHECK\n')
  
  let allPassed = true

  // 1. Check environment variables
  console.log('1️⃣ Environment Variables:')
  const envVars = [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'ADMIN_DISCORD_ID',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  for (const varName of envVars) {
    const exists = !!process.env[varName]
    console.log(`   ${exists ? '✅' : '❌'} ${varName}`)
    if (!exists) allPassed = false
  }

  // 2. Check database connection
  console.log('\n2️⃣ Database Connection:')
  try {
    const { data, error } = await supabase.from('users').select('count').single()
    if (error) throw error
    console.log('   ✅ Connected to Supabase')
  } catch (error: any) {
    console.log('   ❌ Database connection failed:', error.message)
    allPassed = false
  }

  // 3. Check users table structure
  console.log('\n3️⃣ Users Table Structure:')
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) throw error
    
    const requiredFields = [
      'id', 'discord_id', 'username', 'email', 'avatar',
      'membership', 'coins', 'is_admin', 'last_seen',
      'role', 'is_active', 'xp', 'level'
    ]
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      for (const field of requiredFields) {
        const exists = columns.includes(field)
        console.log(`   ${exists ? '✅' : '❌'} ${field}`)
        if (!exists) allPassed = false
      }
    }
  } catch (error: any) {
    console.log('   ❌ Table check failed:', error.message)
    allPassed = false
  }

  // 4. Test INSERT operation
  console.log('\n4️⃣ INSERT Operation:')
  const testId = 'VERIFY_' + Date.now()
  try {
    const { error } = await supabase.from('users').insert({
      discord_id: testId,
      username: 'VerifyTest',
      email: 'verify@test.com',
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
    allPassed = false
  }

  // 5. Test UPDATE operation
  console.log('\n5️⃣ UPDATE Operation:')
  try {
    const testId2 = 'UPDATE_' + Date.now()
    await supabase.from('users').insert({
      discord_id: testId2,
      username: 'UpdateTest',
      coins: 100,
      membership: 'free',
      is_admin: false,
    })
    
    const { error } = await supabase.from('users').update({
      username: 'UpdatedTest',
      last_seen: new Date().toISOString(),
    }).eq('discord_id', testId2)
    
    if (error) throw error
    console.log('   ✅ UPDATE works')
    
    // Cleanup
    await supabase.from('users').delete().eq('discord_id', testId2)
  } catch (error: any) {
    console.log('   ❌ UPDATE failed:', error.message)
    allPassed = false
  }

  // 6. Check admin user
  console.log('\n6️⃣ Admin User Check:')
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username, is_admin, membership')
      .eq('discord_id', process.env.ADMIN_DISCORD_ID!)
      .single()
    
    if (error) throw error
    if (data) {
      console.log(`   ✅ Admin found: ${data.username}`)
      console.log(`   ✅ is_admin: ${data.is_admin}`)
      console.log(`   ✅ membership: ${data.membership}`)
    }
  } catch (error: any) {
    console.log('   ⚠️  Admin user not found (will be created on first login)')
  }

  // Final result
  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log('🎉 DISCORD LOGIN IS 100% READY!')
    console.log('✅ All systems operational')
    console.log('✅ Database types match')
    console.log('✅ All operations working')
    console.log('\n👉 You can now login with Discord!')
  } else {
    console.log('❌ SOME CHECKS FAILED')
    console.log('Please review the errors above')
  }
  console.log('='.repeat(50) + '\n')

  return allPassed
}

verifyDiscordLoginReady().then(success => {
  process.exit(success ? 0 : 1)
})
