// Use built-in fetch for Node.js 18+
const fetch = globalThis.fetch || require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n')

  try {
    // Test 1: Get all assets
    console.log('1️⃣ Testing GET /api/assets')
    const assetsResponse = await fetch(`${BASE_URL}/api/assets`)
    const assetsData = await assetsResponse.json()
    
    if (assetsResponse.ok) {
      console.log(`✅ Success: Found ${assetsData.assets?.length || 0} assets`)
      console.log(`   Total: ${assetsData.pagination?.total || 0}`)
      if (assetsData.assets?.length > 0) {
        console.log(`   First asset: ${assetsData.assets[0].title}`)
      }
    } else {
      console.log(`❌ Failed: ${assetsData.error}`)
    }

    // Test 2: Get assets by category
    console.log('\n2️⃣ Testing GET /api/assets?category=scripts')
    const scriptsResponse = await fetch(`${BASE_URL}/api/assets?category=scripts`)
    const scriptsData = await scriptsResponse.json()
    
    if (scriptsResponse.ok) {
      console.log(`✅ Success: Found ${scriptsData.assets?.length || 0} scripts`)
    } else {
      console.log(`❌ Failed: ${scriptsData.error}`)
    }

    // Test 3: Get specific asset (if we have any)
    if (assetsData.assets?.length > 0) {
      const assetId = assetsData.assets[0].id
      console.log(`\n3️⃣ Testing GET /api/assets/${assetId}`)
      
      const assetResponse = await fetch(`${BASE_URL}/api/assets/${assetId}`)
      const assetData = await assetResponse.json()
      
      if (assetResponse.ok) {
        console.log(`✅ Success: Got asset "${assetData.title}"`)
        console.log(`   Category: ${assetData.category}`)
        console.log(`   Price: ${assetData.coin_price === 0 ? 'FREE' : assetData.coin_price + ' coins'}`)
        console.log(`   Downloads: ${assetData.downloads}`)
      } else {
        console.log(`❌ Failed: ${assetData.error}`)
      }
    }

    // Test 4: Test search
    console.log('\n4️⃣ Testing GET /api/assets?search=police')
    const searchResponse = await fetch(`${BASE_URL}/api/assets?search=police`)
    const searchData = await searchResponse.json()
    
    if (searchResponse.ok) {
      console.log(`✅ Success: Found ${searchData.assets?.length || 0} assets matching "police"`)
    } else {
      console.log(`❌ Failed: ${searchData.error}`)
    }

    // Test 5: Test framework filter
    console.log('\n5️⃣ Testing GET /api/assets?framework=qbcore')
    const frameworkResponse = await fetch(`${BASE_URL}/api/assets?framework=qbcore`)
    const frameworkData = await frameworkResponse.json()
    
    if (frameworkResponse.ok) {
      console.log(`✅ Success: Found ${frameworkData.assets?.length || 0} QBCore assets`)
    } else {
      console.log(`❌ Failed: ${frameworkData.error}`)
    }

    console.log('\n🎉 API testing completed!')

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run tests
testAPI()