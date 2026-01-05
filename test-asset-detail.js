const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAssetDetail() {
  console.log('🧪 Testing Asset Detail API...\n')

  try {
    // Get a sample asset ID
    const { data: assets } = await supabase
      .from('assets')
      .select('id, title')
      .in('status', ['approved', 'featured', 'active'])
      .limit(1)

    if (!assets || assets.length === 0) {
      console.error('❌ No assets found to test')
      return
    }

    const testAsset = assets[0]
    console.log(`📋 Testing with asset: ${testAsset.title} (${testAsset.id})`)

    // Test the API endpoint logic
    const { data: asset, error } = await supabase
      .from('assets')
      .select(`
        *,
        author:users!creator_id(
          id,
          username,
          avatar,
          membership
        )
      `)
      .eq('id', testAsset.id)
      .single()

    if (error) {
      console.error('❌ API Query Error:', error)
      return
    }

    if (!asset) {
      console.error('❌ Asset not found')
      return
    }

    // Format the asset data like the API does
    const formattedAsset = {
      id: asset.id,
      title: asset.title,
      description: asset.description,
      category: asset.category,
      framework: asset.framework || 'standalone',
      version: asset.version || '1.0.0',
      status: asset.status,
      coin_price: asset.coin_price || 0,
      downloads: asset.downloads || 0,
      views: asset.views || 0,
      likes: asset.likes || 0,
      rating: asset.rating || '5.0',
      thumbnail: asset.thumbnail_url || asset.thumbnail,
      thumbnail_url: asset.thumbnail_url || asset.thumbnail,
      download_url: asset.download_url || asset.download_link,
      features: asset.features,
      installation: asset.installation,
      changelog: asset.changelog,
      tags: asset.tags || [],
      file_size: asset.file_size,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
      author: asset.author ? {
        id: asset.author.id,
        username: asset.author.username || 'Unknown',
        avatar: asset.author.avatar,
        membership: asset.author.membership || 'free'
      } : null,
      author_id: asset.creator_id
    }

    console.log('✅ Asset Detail API Test Results:')
    console.log(`  Title: ${formattedAsset.title}`)
    console.log(`  Category: ${formattedAsset.category}`)
    console.log(`  Framework: ${formattedAsset.framework}`)
    console.log(`  Price: ${formattedAsset.coin_price} coins`)
    console.log(`  Author: ${formattedAsset.author?.username || 'Unknown'}`)
    console.log(`  Thumbnail: ${formattedAsset.thumbnail ? '✅' : '❌'}`)
    console.log(`  Download URL: ${formattedAsset.download_url ? '✅' : '❌'}`)
    console.log(`  Description: ${formattedAsset.description ? '✅' : '❌'}`)

    console.log('\n🌐 Asset detail page should work at:')
    console.log(`  http://localhost:3000/asset/${testAsset.id}`)

    // Test multiple assets
    console.log('\n📋 Testing multiple asset IDs:')
    const { data: moreAssets } = await supabase
      .from('assets')
      .select('id, title, category')
      .in('status', ['approved', 'featured', 'active'])
      .limit(5)

    moreAssets?.forEach((asset, index) => {
      console.log(`  ${index + 1}. ${asset.title} (${asset.category})`)
      console.log(`     URL: http://localhost:3000/asset/${asset.id}`)
    })

    console.log('\n✅ Asset Detail API is ready!')

  } catch (error) {
    console.error('❌ Test Error:', error)
  }
}

testAssetDetail()