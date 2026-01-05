const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAssetsData() {
  console.log('🔍 Checking assets data...\n')

  try {
    // 1. Check total assets count
    const { data: allAssets, error: countError } = await supabase
      .from('assets')
      .select('*', { count: 'exact' })

    if (countError) {
      console.error('❌ Error counting assets:', countError.message)
      return
    }

    console.log(`📊 Total assets in database: ${allAssets?.length || 0}`)

    // 2. Check status distribution
    const { data: statusData } = await supabase
      .from('assets')
      .select('status')

    const statusCounts = {}
    statusData?.forEach(asset => {
      statusCounts[asset.status] = (statusCounts[asset.status] || 0) + 1
    })

    console.log('\n📈 Status distribution:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

    // 3. Check visible assets (what the API should return)
    const { data: visibleAssets, error: visibleError } = await supabase
      .from('assets')
      .select('*, author:users!creator_id(username, avatar, membership)')
      .in('status', ['approved', 'featured', 'active'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (visibleError) {
      console.error('❌ Error fetching visible assets:', visibleError.message)
      return
    }

    console.log(`\n✅ Visible assets (approved/featured/active): ${visibleAssets?.length || 0}`)

    if (visibleAssets && visibleAssets.length > 0) {
      console.log('\n📋 Sample visible assets:')
      visibleAssets.slice(0, 5).forEach((asset, index) => {
        console.log(`  ${index + 1}. ${asset.title}`)
        console.log(`     Status: ${asset.status}`)
        console.log(`     Category: ${asset.category}`)
        console.log(`     Author: ${asset.author?.username || 'Unknown'}`)
        console.log(`     Downloads: ${asset.downloads || 0}`)
        console.log(`     Thumbnail: ${asset.thumbnail_url ? '✅' : '❌'}`)
        console.log(`     Download URL: ${asset.download_url ? '✅' : '❌'}`)
        console.log('')
      })
    }

    // 4. Check for missing data
    const { data: missingData } = await supabase
      .from('assets')
      .select('id, title, thumbnail_url, download_url, creator_id')
      .in('status', ['approved', 'featured', 'active'])

    const missingThumbnails = missingData?.filter(asset => !asset.thumbnail_url).length || 0
    const missingDownloads = missingData?.filter(asset => !asset.download_url).length || 0
    const missingCreators = missingData?.filter(asset => !asset.creator_id).length || 0

    console.log('⚠️  Missing data:')
    console.log(`  Assets without thumbnails: ${missingThumbnails}`)
    console.log(`  Assets without download URLs: ${missingDownloads}`)
    console.log(`  Assets without creators: ${missingCreators}`)

    // 5. Test API endpoint simulation
    console.log('\n🧪 Testing API query simulation...')
    const { data: apiTest, error: apiError } = await supabase
      .from('assets')
      .select('*, author:users!creator_id(username, avatar, membership)', { count: 'exact' })
      .in('status', ['approved', 'featured', 'active'])
      .order('created_at', { ascending: false })
      .limit(20)

    if (apiError) {
      console.error('❌ API simulation error:', apiError.message)
    } else {
      console.log(`✅ API simulation successful: ${apiTest?.length || 0} assets returned`)
    }

    // 6. Summary
    console.log('\n📋 SUMMARY:')
    console.log(`Total assets: ${allAssets?.length || 0}`)
    console.log(`Visible assets: ${visibleAssets?.length || 0}`)
    console.log(`Missing thumbnails: ${missingThumbnails}`)
    console.log(`Missing downloads: ${missingDownloads}`)
    console.log(`Missing creators: ${missingCreators}`)

    if (visibleAssets && visibleAssets.length > 0) {
      console.log('\n✅ ASSETS SHOULD BE VISIBLE ON WEBSITE')
    } else {
      console.log('\n❌ NO ASSETS WILL BE VISIBLE - CHECK STATUS VALUES')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the check
checkAssetsData()