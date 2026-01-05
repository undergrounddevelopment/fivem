// Quick API Test
const BASE = 'http://localhost:3000'

async function test() {
  console.log('Testing Forum API...\n')

  // Test threads
  console.log('1. GET /api/forum/threads')
  try {
    const r = await fetch(`${BASE}/api/forum/threads?limit=3`)
    const d = await r.json()
    console.log('   Status:', r.status)
    console.log('   Threads:', d.threads?.length || 0)
    if (d.threads?.[0]) {
      console.log('   First:', d.threads[0].title?.substring(0, 30), 'by', d.threads[0].author?.username)
    }
  } catch (e) {
    console.log('   Error:', e.message)
  }

  // Test thread detail
  console.log('\n2. GET /api/forum/threads/[id]')
  try {
    const r1 = await fetch(`${BASE}/api/forum/threads?limit=1`)
    const d1 = await r1.json()
    if (d1.threads?.[0]) {
      const id = d1.threads[0].id
      const r = await fetch(`${BASE}/api/forum/threads/${id}`)
      const d = await r.json()
      console.log('   Status:', r.status)
      console.log('   Title:', d.title?.substring(0, 30))
      console.log('   Author:', d.author?.username)
    }
  } catch (e) {
    console.log('   Error:', e.message)
  }

  console.log('\nDone!')
}

test()
