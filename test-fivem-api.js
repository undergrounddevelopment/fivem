// Test FiveM API
const testServerIds = [
  'j8y8q6',  // Example server
  'lzy8l7',  // Elite RP
  'gkd4kq',  // Astro Roleplay
];

async function testAPI(id) {
  console.log(`\n=== Testing: ${id} ===`);
  
  const urls = [
    `https://servers.fivem.net/api/servers/single/${id}`,
    `https://servers-frontend.fivem.net/api/servers/single/${id}`
  ];
  
  for (const url of urls) {
    try {
      console.log(`Trying: ${url}`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ SUCCESS: ${url}`);
        console.log(`Server: ${data.Data?.hostname || 'N/A'}`);
        console.log(`Players: ${data.Data?.clients || 0}/${data.Data?.sv_maxclients || 0}`);
        return true;
      } else {
        console.log(`❌ FAILED: ${res.status}`);
      }
    } catch (e) {
      console.log(`❌ ERROR: ${e.message}`);
    }
  }
  return false;
}

async function runTests() {
  for (const id of testServerIds) {
    await testAPI(id);
  }
}

runTests();
