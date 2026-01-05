const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://linnqtixdfjwbrixitrb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Assets yang dibuat oleh seed script
const seedAssetTitles = [
  "Advanced Police System",
  "Luxury Car Dealership MLO", 
  "Lamborghini Aventador Pack",
  "Modern Hospital Interior",
  "Banking System V3",
  "Police Uniform Pack"
]

async function deleteSeedAssets() {
  try {
    console.log('🗑️ Deleting seed assets...\n')

    // Find assets by title (yang dibuat oleh seed script)
    const { data: assetsToDelete, error: findError } = await supabase
      .from('assets')
      .select('id, title, author_id')
      .in('title', seedAssetTitles)

    if (findError) {
      console.error('❌ Error finding assets:', findError)
      return
    }

    if (!assetsToDelete || assetsToDelete.length === 0) {
      console.log('ℹ️ No seed assets found to delete')
      return
    }

    console.log(`📋 Found ${assetsToDelete.length} seed assets to delete:`)
    assetsToDelete.forEach((asset, index) => {
      console.log(`   ${index + 1}. ${asset.title} (ID: ${asset.id})`)
    })

    // Get asset IDs
    const assetIds = assetsToDelete.map(asset => asset.id)

    // Delete related records first (to avoid foreign key constraints)
    console.log('\n🔗 Deleting related records...')
    
    // Delete downloads
    const { error: downloadsError } = await supabase
      .from('downloads')
      .delete()
      .in('asset_id', assetIds)
    
    if (downloadsError) {
      console.log('⚠️ Downloads deletion error (might not exist):', downloadsError.message)
    } else {
      console.log('✅ Downloads deleted')
    }

    // Delete asset comments
    const { error: commentsError } = await supabase
      .from('asset_comments')
      .delete()
      .in('asset_id', assetIds)
    
    if (commentsError) {
      console.log('⚠️ Comments deletion error (might not exist):', commentsError.message)
    } else {
      console.log('✅ Comments deleted')
    }

    // Delete asset ratings
    const { error: ratingsError } = await supabase
      .from('asset_ratings')
      .delete()
      .in('asset_id', assetIds)
    
    if (ratingsError) {
      console.log('⚠️ Ratings deletion error (might not exist):', ratingsError.message)
    } else {
      console.log('✅ Ratings deleted')
    }

    // Delete asset reviews
    const { error: reviewsError } = await supabase
      .from('asset_reviews')
      .delete()
      .in('asset_id', assetIds)
    
    if (reviewsError) {
      console.log('⚠️ Reviews deletion error (might not exist):', reviewsError.message)
    } else {
      console.log('✅ Reviews deleted')
    }

    // Finally delete the assets themselves
    console.log('\n🗑️ Deleting assets...')
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .in('id', assetIds)

    if (deleteError) {
      console.error('❌ Error deleting assets:', deleteError)
      return
    }

    console.log(`✅ Successfully deleted ${assetsToDelete.length} seed assets`)
    
    // Show remaining assets count
    const { data: remainingAssets, error: countError } = await supabase
      .from('assets')
      .select('id', { count: 'exact', head: true })

    if (!countError) {
      console.log(`📊 Remaining assets in database: ${remainingAssets.count || 0}`)
    }

  } catch (error) {
    console.error('💥 Error:', error)
  }
}

// Run if called directly
if (require.main === module) {
  deleteSeedAssets().then(() => {
    console.log('\n🎉 Seed assets deletion completed!')
    process.exit(0)
  }).catch(error => {
    console.error('💥 Deletion failed:', error)
    process.exit(1)
  })
}

module.exports = { deleteSeedAssets }