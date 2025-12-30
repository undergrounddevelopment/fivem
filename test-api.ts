import { searchFiveMTools, getAssets } from './lib/fivem-api'

async function testAPIs() {
  console.log('🧪 Testing FiveM Tools APIs...\n')

  try {
    // Test 1: Search API
    console.log('1️⃣ Testing Search API...')
    const searchResults = await searchFiveMTools('script')
    console.log(`   ✅ Found ${searchResults.total} results`)
    console.log(`   - Assets: ${searchResults.results.assets.length}`)
    console.log(`   - Threads: ${searchResults.results.threads.length}`)
    console.log(`   - Users: ${searchResults.results.users.length}`)
    
    if (searchResults.results.assets.length > 0) {
      const firstAsset = searchResults.results.assets[0]
      console.log(`   📦 First asset: "${firstAsset.title}"`)
    }

    // Test 2: Assets API
    console.log('\n2️⃣ Testing Assets API...')
    const assets = await getAssets('scripts', 'standalone')
    console.log(`   ✅ Fetched assets successfully`)

    console.log('\n✅ All API tests passed!')
    return true
  } catch (error) {
    console.error('\n❌ API test failed:', error)
    return false
  }
}

// Run tests
testAPIs()
  .then(success => process.exit(success ? 0 : 1))
  .catch(() => process.exit(1))
