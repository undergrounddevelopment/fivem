import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function verifyConnection() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    const userCount = await prisma.user.count()
    console.log(`✅ Found ${userCount} users in database`)
    
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        discordId: adminUser.discordId,
        username: adminUser.username,
        isAdmin: adminUser.isAdmin,
        membership: adminUser.membership
      })
    } else {
      console.log('⚠️ No admin user found in database')
    }
    
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyConnection()
