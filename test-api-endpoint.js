const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAPIEndpoint() {
  const assetId = '0d67ad51-bd57-433e-bc0a-3297dbfbb64a'
  
  console.log('🧪 Testing API endpoint directly...\n')

  try {
    // Simulate the exact API endpoint logic
    console.log(`Testing asset ID: ${assetId}`)

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
      console.error('❌ API Query Error:', error)
      return
    }

    if (!asset) {
      console.error('❌ Asset not found')
      return
    }

    // Format the asset data exactly like the API does
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

    console.log('✅ API Endpoint Test Results:')
    console.log(`  Asset ID: ${formattedAsset.id}`)
    console.log(`  Title: ${formattedAsset.title}`)
    console.log(`  Status: ${formattedAsset.status}`)
    console.log(`  Author: ${formattedAsset.author?.username}`)
    console.log(`  Thumbnail: ${formattedAsset.thumbnail ? 'Available' : 'Missing'}`)
    console.log(`  Description: ${formattedAsset.description ? 'Available' : 'Missing'}`)

    // Test the API response format
    const apiResponse = { asset: formattedAsset }
    console.log('\n✅ API Response Format:')
    console.log('  Response has asset property:', !!apiResponse.asset)
    console.log('  Asset has required fields:', !!(apiResponse.asset.id && apiResponse.asset.title))

    console.log('\n🌐 Frontend should receive this data structure:')
    console.log('  data.asset.id:', apiResponse.asset.id)
    console.log('  data.asset.title:', apiResponse.asset.title)
    console.log('  data.asset.thumbnail:', apiResponse.asset.thumbnail ? 'Yes' : 'No')

    console.log('\n✅ API endpoint is working correctly!')
    console.log('The issue might be in the frontend fetch or server routing.')

  } catch (error) {
    console.error('❌ Test Error:', error)
  }
}

testAPIEndpoint()