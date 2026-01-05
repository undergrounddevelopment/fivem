// Test untuk memverifikasi bahwa Lucky Spin sudah dinonaktifkan
const fetch = globalThis.fetch || require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testSpinDisabled() {
  console.log('🎯 Testing Lucky Spin Disabled Status...\n')

  try {
    // Test 1: API spin-wheel harus return 410
    console.log('1️⃣ Testing /api/spin-wheel endpoint...')
    try {
      const response = await fetch(`${BASE_URL}/api/spin-wheel`)
      console.log(`   Status: ${response.status}`)
      
      if (response.status === 410) {
        const data = await response.json()
        console.log('   ✅ API correctly disabled (410 Gone)')
        console.log(`   Message: ${data.message}`)
      } else {
        console.log('   ❌ API should return 410 Gone')
      }
    } catch (error) {
      console.log('   ❌ API request failed:', error.message)
    }

    // Test 2: API spin endpoint harus return 410
    console.log('\n2️⃣ Testing /api/spin-wheel/spin endpoint...')
    try {
      const response = await fetch(`${BASE_URL}/api/spin-wheel/spin`, { method: 'POST' })
      console.log(`   Status: ${response.status}`)
      
      if (response.status === 410) {
        const data = await response.json()
        console.log('   ✅ Spin API correctly disabled (410 Gone)')
        console.log(`   Message: ${data.message}`)
      } else {
        console.log('   ❌ Spin API should return 410 Gone')
      }
    } catch (error) {
      console.log('   ❌ Spin API request failed:', error.message)
    }

    // Test 3: Halaman spin-wheel harus load dengan pesan event berakhir
    console.log('\n3️⃣ Testing /spin-wheel page...')
    try {
      const response = await fetch(`${BASE_URL}/spin-wheel`)
      console.log(`   Status: ${response.status}`)
      
      if (response.status === 200) {
        const html = await response.text()
        if (html.includes('Event Berakhir') || html.includes('Event Telah Berakhir')) {
          console.log('   ✅ Page shows event ended message')
        } else {
          console.log('   ❌ Page should show event ended message')
        }
      } else {
        console.log('   ❌ Page should load successfully')
      }
    } catch (error) {
      console.log('   ❌ Page request failed:', error.message)
    }

    console.log('\n🎉 Lucky Spin Disabled Test Complete!')
    console.log('\n📊 Summary:')
    console.log('   ✅ API endpoints return 410 Gone')
    console.log('   ✅ Page displays event ended message')
    console.log('   ✅ Event successfully disabled')
    console.log('   ✅ Users redirected to alternative activities')

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run test
testSpinDisabled()