const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAssets() {
  console.log('🔍 DEBUGGING ASSETS TABLE...\n')
  
  try {
    // Check if assets table exists and get sample data
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .limit(5)
    
    if (error) {
      console.log('❌ Assets table error:', error)
      return
    }
    
    console.log(`📊 Found ${assets?.length || 0} assets (showing first 5):`)
    
    if (assets && assets.length > 0) {
      assets.forEach((asset, index) => {
        console.log(`\nAsset ${index + 1}:`)
        console.log(`  ID: ${asset.id}`)
        console.log(`  Title: ${asset.title}`)
        console.log(`  Author ID: ${asset.author_id}`)
        console.log(`  Creator ID: ${asset.creator_id || 'N/A'}`)
        console.log(`  User ID: ${asset.user_id || 'N/A'}`)
      })
    } else {
      console.log('No assets found in database')
    }
    
    // Check total count
    const { count } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n📊 Total assets in database: ${count}`)
    
    // Check for different column names that might contain user references
    const { data: sample } = await supabase
      .from('assets')
      .select('*')
      .limit(1)
    
    if (sample && sample.length > 0) {
      console.log('\n🔍 Available columns:')
      Object.keys(sample[0]).forEach(key => {
        if (key.includes('user') || key.includes('author') || key.includes('creator')) {
          console.log(`  - ${key}: ${sample[0][key]}`)
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugAssets()