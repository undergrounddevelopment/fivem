import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import 'dotenv/config'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testDiscordLogin() {
  console.log('\n🧪 Testing Discord Login Flow...\n')

  const testDiscordId = 'TEST_' + Date.now()
  const testUser = {
    discord_id: testDiscordId,
    username: 'TestUser',
    email: 'test@example.com',
    avatar: 'https://cdn.discordapp.com/avatars/123/456.png',
    coins: 100,
    is_admin: false,
    membership: 'free' as const,
  }

  try {
    // Test 1: Insert new user (simulating first login)
    console.log('1️⃣ Testing INSERT (first login)...')
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()

    if (insertError) {
      console.error('❌ INSERT failed:', insertError.message)
      return false
    }
    console.log('✅ INSERT success:', newUser.username)

    // Test 2: Update existing user (simulating subsequent login)
    console.log('\n2️⃣ Testing UPDATE (subsequent login)...')
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        username: 'TestUserUpdated',
        email: 'updated@example.com',
        avatar: 'https://cdn.discordapp.com/avatars/789/012.png',
        last_seen: new Date().toISOString(),
      })
      .eq('discord_id', testDiscordId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ UPDATE failed:', updateError.message)
      return false
    }
    console.log('✅ UPDATE success:', updatedUser.username)

    // Test 3: Query by discord_id
    console.log('\n3️⃣ Testing SELECT by discord_id...')
    const { data: queriedUser, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', testDiscordId)
      .single()

    if (queryError) {
      console.error('❌ SELECT failed:', queryError.message)
      return false
    }
    console.log('✅ SELECT success:', queriedUser.username)

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabase.from('users').delete().eq('discord_id', testDiscordId)
    console.log('✅ Cleanup complete')

    console.log('\n🎉 ALL TESTS PASSED!\n')
    return true

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message)
    return false
  }
}

testDiscordLogin().then(success => {
  process.exit(success ? 0 : 1)
})
