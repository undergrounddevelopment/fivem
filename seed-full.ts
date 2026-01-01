import { createClient } from '@supabase/supabase-js'
import { FORUM_CATEGORIES } from '@/lib/constants'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seed...\n')

  try {
    // 1. Seed Forum Categories
    console.log('📋 Seeding forum categories...')
    for (const category of FORUM_CATEGORIES) {
      const { error } = await supabase
        .from('forum_categories')
        .upsert({
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          sort_order: category.sort_order
        }, { onConflict: 'id' })
      
      if (error) {
        console.log(`⚠️ Category ${category.name}: ${error.message}`)
      } else {
        console.log(`✅ Category: ${category.name}`)
      }
    }

    // 2. Seed Spin Wheel Prizes
    console.log('\n🎰 Seeding spin wheel prizes...')
    const prizes = [
      { name: '100 Coins', type: 'coins', value: 100, probability: 30.0, color: '#FFD700', icon: '💰' },
      { name: '250 Coins', type: 'coins', value: 250, probability: 20.0, color: '#FFD700', icon: '💰' },
      { name: '500 Coins', type: 'coins', value: 500, probability: 15.0, color: '#FFD700', icon: '💰' },
      { name: '1000 Coins', type: 'coins', value: 1000, probability: 10.0, color: '#FFD700', icon: '💰' },
      { name: 'Free Script', type: 'item', value: 1, probability: 8.0, color: '#00FF00', icon: '📜' },
      { name: 'Premium Access', type: 'membership', value: 7, probability: 5.0, color: '#FF6B6B', icon: '👑' },
      { name: 'Jackpot 5000', type: 'coins', value: 5000, probability: 2.0, color: '#FF0000', icon: '🎰' }
    ]

    for (const prize of prizes) {
      const { error } = await supabase
        .from('spin_wheel_prizes')
        .upsert(prize, { onConflict: 'name' })
      
      if (error) {
        console.log(`⚠️ Prize ${prize.name}: ${error.message}`)
      } else {
        console.log(`✅ Prize: ${prize.name}`)
      }
    }

    // 3. Seed Sample Assets
    console.log('\n📦 Seeding sample assets...')
    const sampleAssets = [
      {
        title: 'QBCore Banking System',
        description: 'Advanced banking system with ATM, mobile banking, and transaction history',
        category: 'scripts',
        framework: 'qbcore',
        price: 0,
        download_url: 'https://example.com/banking',
        preview_images: ['https://via.placeholder.com/800x600'],
        tags: ['banking', 'economy', 'qbcore'],
        is_featured: true,
        uploader_id: '1047719075322810378'
      },
      {
        title: 'Modern Police Station MLO',
        description: 'High-quality police station interior with cells, offices, and garage',
        category: 'mlo',
        framework: 'standalone',
        price: 0,
        download_url: 'https://example.com/police-mlo',
        preview_images: ['https://via.placeholder.com/800x600'],
        tags: ['mlo', 'police', 'interior'],
        is_featured: true,
        uploader_id: '1047719075322810378'
      },
      {
        title: 'Lamborghini Huracan Pack',
        description: 'High-quality Lamborghini vehicle pack with custom handling',
        category: 'vehicles',
        framework: 'standalone',
        price: 0,
        download_url: 'https://example.com/lambo-pack',
        preview_images: ['https://via.placeholder.com/800x600'],
        tags: ['vehicles', 'supercars', 'lamborghini'],
        is_featured: false,
        uploader_id: '1047719075322810378'
      }
    ]

    for (const asset of sampleAssets) {
      const { error } = await supabase
        .from('assets')
        .upsert(asset, { onConflict: 'title' })
      
      if (error) {
        console.log(`⚠️ Asset ${asset.title}: ${error.message}`)
      } else {
        console.log(`✅ Asset: ${asset.title}`)
      }
    }

    // 4. Seed Announcements
    console.log('\n📢 Seeding announcements...')
    const announcements = [
      {
        title: 'Welcome to FiveM Tools V7!',
        content: 'We are excited to launch the new version of FiveM Tools with enhanced features and better performance.',
        type: 'info',
        is_active: true,
        author_id: '1047719075322810378'
      },
      {
        title: 'New Spin Wheel Feature',
        content: 'Try your luck with our new spin wheel feature! Earn coins and win exclusive prizes.',
        type: 'feature',
        is_active: true,
        author_id: '1047719075322810378'
      }
    ]

    for (const announcement of announcements) {
      const { error } = await supabase
        .from('announcements')
        .upsert(announcement, { onConflict: 'title' })
      
      if (error) {
        console.log(`⚠️ Announcement ${announcement.title}: ${error.message}`)
      } else {
        console.log(`✅ Announcement: ${announcement.title}`)
      }
    }

    console.log('\n✅ Database seed completed successfully!')
    
    // Verify data
    const { data: categories } = await supabase.from('forum_categories').select('count')
    const { data: assets } = await supabase.from('assets').select('count')
    const { data: wheelPrizes } = await supabase.from('spin_wheel_prizes').select('count')
    
    console.log('\n📊 Verification:')
    console.log(`Forum Categories: ${categories?.length || 0}`)
    console.log(`Assets: ${assets?.length || 0}`)
    console.log(`Spin Prizes: ${wheelPrizes?.length || 0}`)

  } catch (error) {
    console.error('❌ Seed failed:', error)
  }
}

seedDatabase()