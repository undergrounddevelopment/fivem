// scripts/full-site-diagnostic.ts
// Comprehensive diagnostic script to test all major endpoints

const BASE_URL = 'https://www.fivemtools.net'

interface TestResult {
  name: string
  url: string
  status: 'ok' | 'error' | 'warning'
  statusCode?: number
  message?: string
  dataCount?: number
}

async function testEndpoint(name: string, path: string, expectJson = true): Promise<TestResult> {
  const url = `${BASE_URL}${path}`
  try {
    const res = await fetch(url, { redirect: 'manual' })
    
    // Check for redirects
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      return {
        name,
        url,
        status: 'warning',
        statusCode: res.status,
        message: `Redirect to: ${location}`
      }
    }

    if (!res.ok) {
      return {
        name,
        url,
        status: 'error',
        statusCode: res.status,
        message: res.statusText
      }
    }

    if (expectJson) {
      const data = await res.json()
      const count = Array.isArray(data) ? data.length :
                    data.assets?.length || data.items?.length || data.threads?.length || 
                    data.users?.length || data.count || null
      return {
        name,
        url,
        status: 'ok',
        statusCode: res.status,
        dataCount: count
      }
    } else {
      const html = await res.text()
      return {
        name,
        url,
        status: 'ok',
        statusCode: res.status,
        message: `HTML size: ${html.length} bytes`
      }
    }
  } catch (err: any) {
    return {
      name,
      url,
      status: 'error',
      message: err.message
    }
  }
}

async function main() {
  console.log('=== COMPREHENSIVE SITE DIAGNOSTIC ===\n')
  console.log(`Target: ${BASE_URL}`)
  console.log(`Time: ${new Date().toISOString()}\n`)

  const tests: TestResult[] = []

  // 1. Main Pages (HTML)
  console.log('📄 TESTING MAIN PAGES...')
  tests.push(await testEndpoint('Home Page', '/', false))
  tests.push(await testEndpoint('Scripts Page', '/scripts', false))
  tests.push(await testEndpoint('MLO Page', '/mlo', false))
  tests.push(await testEndpoint('Vehicles Page', '/vehicles', false))
  tests.push(await testEndpoint('Forum Page', '/forum', false))
  tests.push(await testEndpoint('Clothing Page', '/clothing', false))

  // 2. API Endpoints
  console.log('🔌 TESTING API ENDPOINTS...')
  tests.push(await testEndpoint('API: Scripts', '/api/assets?category=scripts'))
  tests.push(await testEndpoint('API: MLO', '/api/assets?category=mlo'))
  tests.push(await testEndpoint('API: Vehicles', '/api/assets?category=vehicles'))
  tests.push(await testEndpoint('API: Clothing', '/api/assets?category=clothing'))
  tests.push(await testEndpoint('API: Forum', '/api/forum'))
  tests.push(await testEndpoint('API: Stats', '/api/stats'))
  tests.push(await testEndpoint('API: Banners', '/api/public/banners'))
  tests.push(await testEndpoint('API: Online Users', '/api/realtime/online-users'))

  // 3. Asset Detail (sample)
  console.log('📦 TESTING ASSET DETAIL...')
  tests.push(await testEndpoint('API: Asset Detail', '/api/assets/45fab085-c704-47fb-bc0d-2909c35675d4'))
  tests.push(await testEndpoint('Page: Asset Detail', '/asset/45fab085-c704-47fb-bc0d-2909c35675d4', false))

  // 4. Forum Thread (sample)
  console.log('💬 TESTING FORUM...')
  // First get a thread ID
  const forumRes = await fetch(`${BASE_URL}/api/forum`)
  if (forumRes.ok) {
    const forumData = await forumRes.json()
    const firstThread = forumData.threads?.[0]
    if (firstThread) {
      tests.push(await testEndpoint('API: Thread Detail', `/api/forum/threads/${firstThread.id}`))
      tests.push(await testEndpoint('API: Thread Replies', `/api/forum/threads/${firstThread.id}/replies`))
      tests.push(await testEndpoint('Page: Thread', `/forum/thread/${firstThread.id}`, false))
    }
  }

  // Print Results
  console.log('\n=== RESULTS ===\n')
  
  const errors = tests.filter(t => t.status === 'error')
  const warnings = tests.filter(t => t.status === 'warning')
  const ok = tests.filter(t => t.status === 'ok')

  console.log(`✅ OK: ${ok.length}`)
  console.log(`⚠️  Warnings: ${warnings.length}`)
  console.log(`❌ Errors: ${errors.length}`)
  console.log('')

  for (const test of tests) {
    const icon = test.status === 'ok' ? '✅' : test.status === 'warning' ? '⚠️' : '❌'
    const info = test.dataCount !== undefined ? `(${test.dataCount} items)` : 
                 test.message || ''
    console.log(`${icon} ${test.name}: ${test.statusCode || 'N/A'} ${info}`)
  }

  if (errors.length > 0) {
    console.log('\n=== ERRORS DETAIL ===')
    for (const err of errors) {
      console.log(`\n❌ ${err.name}`)
      console.log(`   URL: ${err.url}`)
      console.log(`   Message: ${err.message}`)
    }
  }

  if (warnings.length > 0) {
    console.log('\n=== WARNINGS DETAIL ===')
    for (const warn of warnings) {
      console.log(`\n⚠️ ${warn.name}`)
      console.log(`   URL: ${warn.url}`)
      console.log(`   Message: ${warn.message}`)
    }
  }

  console.log('\n=== END DIAGNOSTIC ===')
}

main()
