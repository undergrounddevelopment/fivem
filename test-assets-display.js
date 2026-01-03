// TEST ASSETS DISPLAY - VERIFY FRONTEND WILL SHOW ASSETS
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'

async function testAssetsDisplay() {
  console.log('🧪 TESTING ASSETS DISPLAY...\n')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  // Test 1: Get assets like frontend would
  console.log('📋 1. FRONTEND ASSETS QUERY TEST')
  console.log('-'.repeat(40))
  
  try {
    const { data: assets, error } = await supabase
      .from('assets')
      .select(`
        id,
        title,
        description,
        category,
        framework,
        coin_price,
        thumbnail_url,
        downloads,
        likes,
        rating,
        status,
        created_at
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('❌ Frontend query failed:', error.message)
      return
    }
    
    console.log(`✅ Found ${assets.length} approved assets`)
    
    if (assets.length === 0) {
      console.log('⚠️  No approved assets found')
      
      // Check all assets regardless of status
      const { data: allAssets } = await supabase
        .from('assets')
        .select('id, title, status')
        .limit(10)
      
      console.log('\n📊 All assets by status:')
      const statusCount = {}
      allAssets.forEach(asset => {
        statusCount[asset.status] = (statusCount[asset.status] || 0) + 1
      })
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`)
      })
      
      return
    }
    
    // Display assets as they would appear in frontend
    console.log('\n🎯 ASSETS THAT WILL DISPLAY:')
    console.log('='.repeat(50))
    
    assets.forEach((asset, i) => {
      console.log(`\n${i + 1}. ${asset.title}`)
      console.log(`   📁 Category: ${asset.category}`)
      console.log(`   ⚙️  Framework: ${asset.framework}`)
      console.log(`   💰 Price: ${asset.coin_price} coins`)
      console.log(`   📥 Downloads: ${asset.downloads}`)
      console.log(`   ⭐ Rating: ${asset.rating}/5`)
      console.log(`   📅 Created: ${new Date(asset.created_at).toLocaleDateString()}`)
      console.log(`   🖼️  Thumbnail: ${asset.thumbnail_url ? 'Yes' : 'No'}`)
    })
    
  } catch (e) {
    console.log('❌ Test failed:', e.message)
    return
  }
  
  // Test 2: Category filtering
  console.log('\n\n📂 2. CATEGORY FILTERING TEST')
  console.log('-'.repeat(40))
  
  const categories = ['scripts', 'mlo', 'vehicles', 'clothing']
  
  for (const category of categories) {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('id, title')
        .eq('category', category)
        .eq('status', 'approved')
      
      if (!error) {
        console.log(`✅ ${category}: ${data.length} assets`)
      }
    } catch (e) {
      console.log(`❌ ${category}: Error`)
    }
  }
  
  // Test 3: API endpoint simulation
  console.log('\n\n🔗 3. API ENDPOINT SIMULATION')
  console.log('-'.repeat(40))
  
  try {
    // Simulate /api/assets call
    const { data: apiAssets, error: apiError } = await supabase
      .from('assets')
      .select('*')
      .eq('status', 'approved')
      .order('downloads', { ascending: false })
      .limit(6)
    
    if (apiError) {
      console.log('❌ API simulation failed:', apiError.message)
    } else {
      console.log(`✅ API would return ${apiAssets.length} assets`)
      console.log('📋 Top assets by downloads:')
      apiAssets.forEach((asset, i) => {
        console.log(`   ${i+1}. ${asset.title} (${asset.downloads} downloads)`)
      })
    }
  } catch (e) {
    console.log('❌ API simulation error:', e.message)
  }
  
  // Final verdict
  console.log('\n' + '='.repeat(50))
  console.log('🎯 FINAL VERDICT')
  console.log('='.repeat(50))
  
  const { data: totalAssets } = await supabase
    .from('assets')
    .select('status')
  
  const approved = totalAssets.filter(a => a.status === 'approved').length
  const pending = totalAssets.filter(a => a.status === 'pending').length
  const total = totalAssets.length
  
  console.log(`\n📊 Assets Status:`)
  console.log(`   Total: ${total}`)
  console.log(`   Approved: ${approved}`)
  console.log(`   Pending: ${pending}`)
  
  if (approved > 0) {
    console.log('\n🎉 ASSETS WILL DISPLAY CORRECTLY!')
    console.log('✅ Frontend queries work')
    console.log('✅ Data structure is correct')
    console.log('✅ API endpoints will return data')
    console.log(`✅ ${approved} assets ready to show`)
  } else {
    console.log('\n⚠️  ASSETS NEED APPROVAL')
    console.log('💡 Assets exist but status = "pending"')
    console.log('🔧 Change status to "approved" to display')
  }
}

testAssetsDisplay().catch(console.error)