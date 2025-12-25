import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function forceAdmin() {
  const adminDiscordId = '1047719075322810378'
  
  console.log('🔧 Force updating admin status...')
  console.log('Target Discord ID:', adminDiscordId)
  
  try {
    // Try to find user
    let user = await prisma.user.findUnique({
      where: { discordId: adminDiscordId }
    })
    
    if (!user) {
      console.log('❌ User not found! Creating admin user...')
      
      // Create admin user if not exists
      user = await prisma.user.create({
        data: {
          discordId: adminDiscordId,
          username: 'Admin',
          email: 'admin@fivemtools.net',
          avatar: '/admin-avatar.png',
          isAdmin: true,
          membership: 'admin',
          coins: 999999
        }
      })
      
      console.log('✅ Admin user created!')
    } else {
      console.log('✅ User found! Updating admin status...')
      
      // Force update to admin
      user = await prisma.user.update({
        where: { discordId: adminDiscordId },
        data: {
          isAdmin: true,
          membership: 'admin'
        }
      })
      
      console.log('✅ Admin status updated!')
    }
    
    console.log('\n📊 Final User Details:')
    console.log('- ID:', user.id)
    console.log('- Discord ID:', user.discordId)
    console.log('- Username:', user.username)
    console.log('- Email:', user.email)
    console.log('- Is Admin:', user.isAdmin)
    console.log('- Membership:', user.membership)
    console.log('- Coins:', user.coins)
    
    console.log('\n✅ Done! Now:')
    console.log('1. Logout from the website')
    console.log('2. Clear browser cookies')
    console.log('3. Login again via Discord')
    console.log('4. Access /admin page')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceAdmin()
