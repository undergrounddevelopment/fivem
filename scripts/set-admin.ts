import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setAdmin() {
  const adminDiscordId = process.env.ADMIN_DISCORD_ID || '1047719075322810378'
  
  try {
    const user = await prisma.user.update({
      where: { discordId: adminDiscordId },
      data: { isAdmin: true }
    })
    
    console.log('✅ Admin set successfully:', user.username)
  } catch (error) {
    console.log('⚠️ User not found, will be set as admin on first login')
  } finally {
    await prisma.$disconnect()
  }
}

setAdmin()
