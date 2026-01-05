const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const sampleAssets = [
  {
    title: "Advanced Police System",
    description: "Complete police system with MDT, dispatch, and arrest mechanics. Includes realistic police procedures and equipment.",
    category: "scripts",
    framework: "qbcore",
    version: "2.1.0",
    coin_price: 0,
    thumbnail_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
    download_url: "https://github.com/example/police-system",
    file_size: "15.2 MB",
    tags: ["police", "mdt", "dispatch", "arrest"],
    status: "approved",
    is_verified: true,
    is_featured: true,
    downloads: 1250,
    views: 3400,
    rating: 4.8,
    rating_count: 45
  },
  {
    title: "Luxury Car Dealership MLO",
    description: "High-end car dealership interior with showroom, offices, and customer areas. Perfect for luxury vehicle sales.",
    category: "mlo",
    framework: "standalone",
    version: "1.0.0",
    coin_price: 150,
    thumbnail_url: "https://images.unsplash.com/photo-1562141961-d0a6e2b6e3b5?w=400&h=300&fit=crop",
    download_url: "https://example.com/download/luxury-dealership",
    file_size: "45.8 MB",
    tags: ["dealership", "luxury", "cars", "interior"],
    status: "approved",
    is_verified: true,
    downloads: 890,
    views: 2100,
    rating: 4.9,
    rating_count: 32
  },
  {
    title: "Lamborghini Aventador Pack",
    description: "High-quality Lamborghini Aventador with multiple variants and custom handling. Includes SVJ and Roadster models.",
    category: "vehicles",
    framework: "standalone",
    version: "1.5.0",
    coin_price: 75,
    thumbnail_url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop",
    download_url: "https://example.com/download/aventador-pack",
    file_size: "28.3 MB",
    tags: ["lamborghini", "supercar", "aventador", "luxury"],
    status: "approved",
    is_verified: true,
    downloads: 2340,
    views: 5600,
    rating: 4.7,
    rating_count: 78
  },
  {
    title: "Modern Hospital Interior",
    description: "Complete hospital MLO with emergency room, patient rooms, surgery suites, and administrative areas.",
    category: "mlo",
    framework: "standalone",
    version: "1.2.0",
    coin_price: 200,
    thumbnail_url: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop",
    download_url: "https://example.com/download/hospital-mlo",
    file_size: "67.2 MB",
    tags: ["hospital", "medical", "interior", "emergency"],
    status: "approved",
    is_verified: true,
    downloads: 567,
    views: 1890,
    rating: 4.6,
    rating_count: 23
  },
  {
    title: "Banking System V3",
    description: "Advanced banking system with ATMs, loans, investments, and mobile banking. Supports multiple currencies.",
    category: "scripts",
    framework: "esx",
    version: "3.0.1",
    coin_price: 0,
    thumbnail_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
    download_url: "https://github.com/example/banking-system",
    file_size: "8.7 MB",
    tags: ["banking", "atm", "loans", "finance"],
    status: "approved",
    is_verified: true,
    downloads: 3450,
    views: 8900,
    rating: 4.9,
    rating_count: 156
  },
  {
    title: "Police Uniform Pack",
    description: "Professional police uniforms with various ranks and departments. Includes SWAT, detective, and patrol uniforms.",
    category: "clothing",
    framework: "standalone",
    version: "1.0.0",
    coin_price: 50,
    thumbnail_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop",
    download_url: "https://example.com/download/police-uniforms",
    file_size: "12.4 MB",
    tags: ["police", "uniform", "clothing", "swat"],
    status: "approved",
    is_verified: true,
    downloads: 1890,
    views: 4200,
    rating: 4.5,
    rating_count: 67
  }
]

async function seedAssets() {
  try {
    console.log('🌱 Starting asset seeding...')

    // Get the first user to use as author
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (userError || !users || users.length === 0) {
      console.error('❌ No users found. Please create a user first.')
      return
    }

    const authorId = users[0].id

    // Add author_id to each asset
    const assetsWithAuthor = sampleAssets.map(asset => ({
      ...asset,
      author_id: authorId
    }))

    // Insert assets
    const { data, error } = await supabase
      .from('assets')
      .insert(assetsWithAuthor)
      .select()

    if (error) {
      console.error('❌ Error inserting assets:', error)
      return
    }

    console.log(`✅ Successfully seeded ${data.length} assets`)
    console.log('📊 Asset breakdown:')
    
    const breakdown = data.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1
      return acc
    }, {})

    Object.entries(breakdown).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} assets`)
    })

  } catch (error) {
    console.error('❌ Seeding failed:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedAssets().then(() => {
    console.log('🎉 Asset seeding completed!')
    process.exit(0)
  }).catch(error => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
}

module.exports = { seedAssets }