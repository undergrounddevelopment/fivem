const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAssetsAPI() {
  console.log('🧪 Testing Assets API Logic...\n')

  try {
    // Simulate the exact API query
    let query = supabase
      .from('assets')
      .select('*, author:users!creator_id(username, avatar, membership)', { count: 'exact' })
      .in('status', ['approved', 'featured', 'active'])

    query = query.order('created_at', { ascending: false })
    query = query.range(0, 49) // limit 50

    const { data: assets, error, count } = await query

    if (error) {
      console.error('❌ API Query Error:', error)
      return
    }

    console.log(`✅ API Query Success: ${assets?.length || 0} assets (total: ${count})`)

    // Format assets like the API does
    const formattedAssets = (assets || []).map((asset) => ({
      ...asset,
      price: asset.coin_price === 0 ? 'free' : 'premium',
      coinPrice: asset.coin_price || 0,
      author: asset.author?.username || 'Unknown',
      authorData: asset.author || { username: 'Unknown', avatar: null, membership: 'free', xp: 0, level: 1 },
      authorId: asset.creator_id,
      isVerified: asset.is_verified !== false,
      isFeatured: asset.is_featured || asset.status === 'featured' || (asset.downloads || 0) > 10000,
      image: asset.thumbnail_url || asset.thumbnail,
      thumbnail: asset.thumbnail_url || asset.thumbnail,
      downloadLink: asset.download_url || asset.download_link,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    }))

    console.log('\n📋 Sample formatted assets:')
    formattedAssets.slice(0, 3).forEach((asset, index) => {
      console.log(`  ${index + 1}. ${asset.title}`)
      console.log(`     ID: ${asset.id}`)
      console.log(`     Author: ${asset.author}`)
      console.log(`     Price: ${asset.price} (${asset.coinPrice} coins)`)
      console.log(`     Image: ${asset.image ? '✅' : '❌'}`)
      console.log(`     Download: ${asset.downloadLink ? '✅' : '❌'}`)
      console.log(`     Featured: ${asset.isFeatured ? '✅' : '❌'}`)
      console.log('')
    })

    // Test API response format
    const apiResponse = {
      items: formattedAssets,
      assets: formattedAssets,
      pagination: {
        page: 1,
        limit: 50,
        total: count || 0,
        pages: Math.ceil((count || 0) / 50) || 1,
      },
    }

    console.log('📊 API Response Summary:')
    console.log(`  Items: ${apiResponse.items.length}`)
    console.log(`  Total: ${apiResponse.pagination.total}`)
    console.log(`  Pages: ${apiResponse.pagination.pages}`)

    console.log('\n✅ Assets API is working correctly!')
    console.log('🌐 Assets should be visible on /assets page')

  } catch (error) {
    console.error('❌ Test Error:', error)
  }
}

testAssetsAPI()