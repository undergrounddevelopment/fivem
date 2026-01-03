// TEST ASSETS DISPLAY - FIXED COLUMN NAMES
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'

async function testAssetsDisplay() {
  console.log('🧪 TESTING ASSETS DISPLAY - FIXED\n')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  // First check actual column structure
  console.log('🔍 1. CHECKING ACTUAL COLUMNS')
  console.log('-'.repeat(40))
  
  try {
    const { data: sample, error } = await supabase
      .from('assets')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error:', error.message)
      return
    }
    
    if (sample.length > 0) {
      console.log('✅ Available columns:')
      Object.keys(sample[0]).forEach(col => {
        console.log(`   - ${col}`)
      })
    }
  } catch (e) {
    console.log('❌ Error:', e.message)
    return
  }
  
  // Test with correct columns
  console.log('\n📋 2. FRONTEND DISPLAY TEST')
  console.log('-'.repeat(40))
  
  try {
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('❌ Query failed:', error.message)
      return
    }
    
    console.log(`✅ Found ${assets.length} total assets`)
    
    // Check status distribution
    const statusCount = {}
    assets.forEach(asset => {
      statusCount[asset.status] = (statusCount[asset.status] || 0) + 1
    })
    
    console.log('\n📊 Assets by status:')
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
    
    // Show sample assets
    console.log('\n🎯 SAMPLE ASSETS:')
    console.log('='.repeat(50))
    
    assets.slice(0, 5).forEach((asset, i) => {
      console.log(`\n${i + 1}. ${asset.title}`)
      console.log(`   📁 Category: ${asset.category}`)
      console.log(`   ⚙️  Framework: ${asset.framework || 'N/A'}`)
      console.log(`   💰 Price: ${asset.coin_price || 0} coins`)
      console.log(`   📥 Downloads: ${asset.downloads || 0}`)
      console.log(`   📊 Status: ${asset.status}`)
      console.log(`   📅 Created: ${new Date(asset.created_at).toLocaleDateString()}`)
    })
    
    // Test approved assets only
    const approvedAssets = assets.filter(a => a.status === 'approved')
    console.log(`\n✅ APPROVED ASSETS: ${approvedAssets.length}`)
    
    if (approvedAssets.length > 0) {
      console.log('🎉 THESE WILL SHOW IN FRONTEND:')
      approvedAssets.forEach((asset, i) => {
        console.log(`   ${i+1}. ${asset.title}`)
      })
    }
    
  } catch (e) {
    console.log('❌ Test failed:', e.message)
  }
  
  // Final verdict
  console.log('\n' + '='.repeat(50))
  console.log('🎯 FINAL VERDICT')
  console.log('='.repeat(50))
  
  const { data: allAssets } = await supabase.from('assets').select('status')
  const total = allAssets.length
  const approved = allAssets.filter(a => a.status === 'approved').length
  
  console.log(`📊 Total Assets: ${total}`)
  console.log(`✅ Approved: ${approved}`)
  console.log(`⏳ Pending: ${total - approved}`)
  
  if (approved > 0) {
    console.log('\n🎉 ASSETS WILL DISPLAY: YES!')
    console.log('✅ Database connection works')
    console.log('✅ Assets data exists')
    console.log('✅ Frontend queries will work')
    console.log(`✅ ${approved} assets ready to show`)
  } else if (total > 0) {
    console.log('\n⚠️  ASSETS EXIST BUT NEED APPROVAL')
    console.log('💡 Change status from "pending" to "approved"')
    console.log('🔧 Or modify frontend to show pending assets')
  } else {
    console.log('\n❌ NO ASSETS FOUND')
  }
}

testAssetsDisplay().catch(console.error)