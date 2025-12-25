import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function testAdminAccess() {
  const adminDiscordId = '1047719075322810378'
  
  console.log('🧪 Testing Admin Access System\n')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Check Environment Variable
    console.log('\n✅ Test 1: Environment Variable')
    console.log('ADMIN_DISCORD_ID:', process.env.ADMIN_DISCORD_ID)
    console.log('Match:', process.env.ADMIN_DISCORD_ID === adminDiscordId ? '✅ YES' : '❌ NO')
    
    // Test 2: Check Database User
    console.log('\n✅ Test 2: Database User')
    const user = await prisma.user.findUnique({
      where: { discordId: adminDiscordId }
    })
    
    if (!user) {
      console.log('❌ User NOT FOUND in database')
      console.log('💡 Solution: User must login via Discord OAuth first')
      return
    }
    
    console.log('✅ User found:', user.username)
    console.log('- Discord ID:', user.discordId)
    console.log('- Is Admin:', user.isAdmin ? '✅ TRUE' : '❌ FALSE')
    console.log('- Membership:', user.membership)
    
    // Test 3: Check Admin Logic
    console.log('\n✅ Test 3: Admin Logic Check')
    const isAdminByEnv = user.discordId === process.env.ADMIN_DISCORD_ID
    const isAdminByDb = user.isAdmin
    const isAdminByMembership = user.membership === 'admin'
    
    console.log('- By ENV match:', isAdminByEnv ? '✅ TRUE' : '❌ FALSE')
    console.log('- By DB field:', isAdminByDb ? '✅ TRUE' : '❌ FALSE')
    console.log('- By Membership:', isAdminByMembership ? '✅ TRUE' : '❌ FALSE')
    
    // Test 4: Simulate Auth Flow
    console.log('\n✅ Test 4: Auth Flow Simulation')
    const wouldBeAdmin = user.discordId === process.env.ADMIN_DISCORD_ID
    console.log('- On login, isAdmin would be set to:', wouldBeAdmin ? '✅ TRUE' : '❌ FALSE')
    
    // Test 5: Check All Admin Users
    console.log('\n✅ Test 5: All Admin Users')
    const allAdmins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        discordId: true,
        username: true,
        membership: true,
        isAdmin: true
      }
    })
    
    if (allAdmins.length === 0) {
      console.log('❌ No admin users found in database')
    } else {
      console.log(`✅ Found ${allAdmins.length} admin user(s):`)
      allAdmins.forEach(admin => {
        console.log(`  - ${admin.username} (${admin.discordId})`)
      })
    }
    
    // Final Verdict
    console.log('\n' + '='.repeat(50))
    console.log('📊 FINAL VERDICT\n')
    
    if (!user) {
      console.log('❌ FAILED: User not in database')
      console.log('🔧 FIX: Login via Discord OAuth first')
    } else if (!user.isAdmin) {
      console.log('❌ FAILED: User exists but isAdmin = false')
      console.log('🔧 FIX: Run `npx tsx scripts/force-admin.ts`')
    } else {
      console.log('✅ SUCCESS: Admin access should work!')
      console.log('\n📝 Next Steps:')
      console.log('1. Logout from website')
      console.log('2. Clear browser cookies')
      console.log('3. Login again via Discord')
      console.log('4. Access /admin page')
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminAccess()
