import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function checkAdmin() {
  const adminDiscordId = process.env.ADMIN_DISCORD_ID || '1047719075322810378'
  
  console.log('🔍 Checking admin status...')
  console.log('Admin Discord ID:', adminDiscordId)
  
  try {
    // Find user by Discord ID
    const user = await prisma.user.findUnique({
      where: { discordId: adminDiscordId }
    })
    
    if (!user) {
      console.log('❌ User not found in database!')
      console.log('💡 User needs to login first via Discord OAuth')
      return
    }
    
    console.log('\n📊 User Details:')
    console.log('- ID:', user.id)
    console.log('- Discord ID:', user.discordId)
    console.log('- Username:', user.username)
    console.log('- Email:', user.email)
    console.log('- Is Admin:', user.isAdmin)
    console.log('- Membership:', user.membership)
    console.log('- Coins:', user.coins)
    
    if (!user.isAdmin) {
      console.log('\n⚠️  User is NOT admin! Updating...')
      
      const updated = await prisma.user.update({
        where: { discordId: adminDiscordId },
        data: { 
          isAdmin: true,
          membership: 'admin'
        }
      })
      
      console.log('✅ Admin status updated!')
      console.log('- Is Admin:', updated.isAdmin)
      console.log('- Membership:', updated.membership)
    } else {
      console.log('\n✅ User is already admin!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
