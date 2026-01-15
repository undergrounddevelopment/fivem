// scripts/test-live-scripts.ts
// Test live scripts page functionality

async function main() {
  console.log('=== SCRIPTS PAGE DIAGNOSTICS ===\n')

  // Test 1: Scripts list API
  const listUrl = 'https://www.fivemtools.net/api/assets?category=scripts'
  console.log(`1. Testing: ${listUrl}`)
  try {
    const res = await fetch(listUrl)
    console.log(`   Status: ${res.status} ${res.statusText}`)
    if (res.ok) {
      const data = await res.json()
      const assets = data.assets || data.items || []
      console.log(`   Assets found: ${assets.length}`)
      if (assets.length > 0) {
        console.log(`   First 3 IDs:`)
        assets.slice(0, 3).forEach((a: any, i: number) => {
          console.log(`     ${i + 1}. ${a.id} - "${a.title}"`)
        })
      }
    }
  } catch (err) {
    console.log(`   Error: ${err}`)
  }

  console.log('')

  // Test 2: Asset detail API (known working ID)
  const assetId = '45fab085-c704-47fb-bc0d-2909c35675d4'
  const detailUrl = `https://www.fivemtools.net/api/assets/${assetId}`
  console.log(`2. Testing: ${detailUrl}`)
  try {
    const res = await fetch(detailUrl)
    console.log(`   Status: ${res.status} ${res.statusText}`)
    if (res.ok) {
      const data = await res.json()
      console.log(`   Title: ${data.title}`)
      console.log(`   Author: ${data.author || data.authorData?.username}`)
    }
  } catch (err) {
    console.log(`   Error: ${err}`)
  }

  console.log('')

  // Test 3: Asset page (HTML)
  const pageUrl = `https://www.fivemtools.net/asset/${assetId}`
  console.log(`3. Testing: ${pageUrl}`)
  try {
    const res = await fetch(pageUrl)
    console.log(`   Status: ${res.status} ${res.statusText}`)
    console.log(`   Content-Type: ${res.headers.get('content-type')}`)
    const html = await res.text()
    console.log(`   HTML Size: ${html.length} bytes`)
    // Check for "Asset Not Found" in the page
    if (html.includes('Asset Not Found')) {
      console.log(`   ⚠️  Page contains "Asset Not Found" text!`)
    } else if (html.includes('KuzQuality')) {
      console.log(`   ✅ Page contains the asset title!`)
    }
  } catch (err) {
    console.log(`   Error: ${err}`)
  }

  console.log('\n=== END DIAGNOSTICS ===')
}

main()
