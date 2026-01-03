// CHECK ASSETS COUNT AND DETAILS
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'

async function checkAssets() {
  console.log('📦 CHECKING ASSETS...\n')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  try {
    // Get total count
    const { data: countData, error: countError } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.log('❌ Error getting count:', countError.message)
      return
    }
    
    const totalAssets = countData?.length || 0
    console.log(`📊 Total Assets: ${totalAssets}`)
    
    if (totalAssets === 0) {
      console.log('📋 No assets found - database is empty')
      return
    }
    
    // Get actual assets data
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('❌ Error getting assets:', error.message)
      return
    }
    
    console.log('\n📋 ASSETS DETAILS:')
    console.log('-'.repeat(50))
    
    assets.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.title}`)
      console.log(`   Category: ${asset.category}`)
      console.log(`   Framework: ${asset.framework}`)
      console.log(`   Status: ${asset.status}`)
      console.log(`   Downloads: ${asset.downloads}`)
      console.log(`   Created: ${new Date(asset.created_at).toLocaleDateString()}`)
      console.log('')
    })
    
    // Category breakdown
    const { data: categoryData } = await supabase
      .from('assets')
      .select('category')
    
    if (categoryData) {
      const categories = {}
      categoryData.forEach(asset => {
        categories[asset.category] = (categories[asset.category] || 0) + 1
      })
      
      console.log('📊 BY CATEGORY:')
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`)
      })
    }
    
  } catch (e) {
    console.log('❌ Error:', e.message)
  }
}

checkAssets().catch(console.error)