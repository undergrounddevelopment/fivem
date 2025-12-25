import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production database...')

  // Seed assets with GitHub release URLs
  const assets = [
    {
      title: 'QBCore Banking System',
      description: 'Modern banking system with ATM support, transactions, and account management',
      category: 'scripts',
      framework: 'qbcore',
      coinPrice: 0,
      downloadLink: 'https://github.com/hhayu8445-code/GaNG/releases/download/v1.0/qb-banking.zip',
      thumbnail: '/banking-system-ui-dark-theme.jpg',
      tags: ['banking', 'economy', 'qbcore'],
      authorId: process.env.ADMIN_DISCORD_ID || '1047719075322810378',
      status: 'active',
      downloads: 1250,
      likes: 89,
      views: 3420
    },
    {
      title: 'BMW M5 F90',
      description: 'High quality BMW M5 F90 with custom handling and liveries',
      category: 'vehicles',
      framework: 'standalone',
      coinPrice: 50,
      downloadLink: 'https://github.com/hhayu8445-code/GaNG/releases/download/v1.0/bmw-m5-f90.zip',
      thumbnail: '/bmw-m5-f90-gta-style.jpg',
      tags: ['bmw', 'sports', 'luxury'],
      authorId: process.env.ADMIN_DISCORD_ID || '1047719075322810378',
      status: 'active',
      downloads: 890,
      likes: 67,
      views: 2100
    },
    {
      title: 'Hospital MLO Interior',
      description: 'Detailed hospital interior with multiple rooms and medical equipment',
      category: 'mlo',
      framework: 'standalone',
      coinPrice: 100,
      downloadLink: 'https://github.com/hhayu8445-code/GaNG/releases/download/v1.0/hospital-mlo.zip',
      thumbnail: '/hospital-interior-gta-mlo.jpg',
      tags: ['hospital', 'medical', 'interior'],
      authorId: process.env.ADMIN_DISCORD_ID || '1047719075322810378',
      status: 'active',
      downloads: 456,
      likes: 45,
      views: 1890
    }
  ]

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { title_authorId: { title: asset.title, authorId: asset.authorId } },
      update: asset,
      create: asset
    })
  }

  // Seed forum threads
  const threads = [
    {
      id: 'thread-1',
      title: 'Best QBCore Scripts 2024',
      content: 'Share your favorite QBCore scripts and resources!',
      categoryId: 'general',
      authorId: process.env.ADMIN_DISCORD_ID || '1047719075322810378',
      views: 234,
      likes: 12
    },
    {
      id: 'thread-2',
      title: 'MLO Optimization Tips',
      content: 'How to optimize your MLOs for better performance',
      categoryId: 'tutorials',
      authorId: process.env.ADMIN_DISCORD_ID || '1047719075322810378',
      views: 156,
      likes: 8
    }
  ]

  for (const thread of threads) {
    await prisma.forumThread.upsert({
      where: { id: thread.id },
      update: thread,
      create: thread
    })
  }

  console.log('✅ Production database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
