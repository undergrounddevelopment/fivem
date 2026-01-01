import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedFinal() {
  console.log('🌱 Final database seed...\n')

  try {
    // Seed sample assets with correct schema
    console.log('📦 Seeding sample assets...')
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

    // Seed announcements
    console.log('\n📢 Seeding announcements...')
    const announcements = [
      {
        title: 'Welcome to FiveM Tools V7!',
        content: 'We are excited to launch the new version of FiveM Tools with enhanced features and better performance.',
        type: 'info',
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

    console.log('\n✅ Final seed completed!')
    
    // Verify data
    const { data: categories } = await supabase.from('forum_categories').select('*')
    const { data: assets } = await supabase.from('assets').select('*')
    const { data: prizes } = await supabase.from('spin_wheel_prizes').select('*')
    
    console.log('\n📊 Final Verification:')
    console.log(`Forum Categories: ${categories?.length || 0}`)
    console.log(`Assets: ${assets?.length || 0}`)
    console.log(`Spin Prizes: ${prizes?.length || 0}`)

  } catch (error) {
    console.error('❌ Final seed failed:', error)
  }
}

seedFinal()