const fetch = require('node-fetch')

async function testAPI() {
  const assetId = '7df9764a-99bb-4d84-acaa-92d6c2db4dba'
  const url = `http://localhost:3000/api/assets/${assetId}`
  
  console.log(`Testing: ${url}`)
  
  try {
    const response = await fetch(url)
    console.log(`Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Success:', JSON.stringify(data, null, 2))
    } else {
      const error = await response.text()
      console.log('Error response:', error)
    }
  } catch (err) {
    console.error('Fetch error:', err.message)
  }
}

testAPI()