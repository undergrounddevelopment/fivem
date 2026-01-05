const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSpecificAsset() {
  const assetId = '0d67ad51-bd57-433e-bc0a-3297dbfbb64a'
  
  console.log(`🧪 Testing specific asset: ${assetId}\n`)

  try {
    // Test the exact API logic
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
      .eq('id', assetId)
      .single()

    if (error) {
      console.error('❌ Query Error:', error)
      return
    }

    if (!asset) {
      console.error('❌ Asset not found')
      return
    }

    console.log('✅ Asset Found:')
    console.log(`  ID: ${asset.id}`)
    console.log(`  Title: ${asset.title}`)
    console.log(`  Category: ${asset.category}`)
    console.log(`  Status: ${asset.status}`)
    console.log(`  Author: ${asset.author?.username || 'Unknown'}`)
    console.log(`  Creator ID: ${asset.creator_id}`)
    console.log(`  Thumbnail: ${asset.thumbnail_url || asset.thumbnail || 'None'}`)
    console.log(`  Download URL: ${asset.download_url || asset.download_link || 'None'}`)

    // Format like API does
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

    console.log('\n✅ API Response would be:')
    console.log(JSON.stringify({ asset: formattedAsset }, null, 2))

    console.log('\n🌐 Test URL:')
    console.log(`  http://localhost:3002/asset/${assetId}`)

  } catch (error) {
    console.error('❌ Test Error:', error)
  }
}

testSpecificAsset()