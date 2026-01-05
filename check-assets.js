const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAssets() {
  console.log('🔍 Checking assets data...\n')
  
  try {
    // Get all assets
    const { data: assets, error } = await supabase
      .from('assets')
      .select('id, title, author_id, status, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching assets:', error)
      return
    }
    
    console.log(`✅ Found ${assets.length} assets:\n`)
    
    assets.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.title}`)
      console.log(`   ID: ${asset.id}`)
      console.log(`   Status: ${asset.status}`)
      console.log(`   Author ID: ${asset.author_id}`)
      console.log(`   Created: ${asset.created_at}`)
      console.log('')
    })
    
    // Check specific ID
    const targetId = '7df9764a-99bb-4d84-acaa-92d6c2db4dba'
    const targetAsset = assets.find(a => a.id === targetId)
    
    if (targetAsset) {
      console.log(`✅ Target asset found: ${targetAsset.title}`)
    } else {
      console.log(`❌ Target asset NOT found: ${targetId}`)
    }
    
  } catch (err) {
    console.error('Error:', err)
  }
}

checkAssets()