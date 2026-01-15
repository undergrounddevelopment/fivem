
import fetch from 'node-fetch';

async function main() {
  // Use the specific deployment URL from the logs to be sure, or the alias
  // verified alias from previous logs: fivem-tools-v7-terbaruu.vercel.app
  const urls = [
      'https://fivem-tools-v7-m54agj1d1-m-aurnks-projects.vercel.app/api/forum',
      'https://fivem-tools-v7-terbaruu.vercel.app/api/forum' // Trying this too
  ];

  console.log('--- Testing Live Vercel URLs ---');

  for (const url of urls) {
      try {
        console.log(`Fetching: ${url}...`);
        const res = await fetch(url);
        if (res.status === 200) {
            const json = await res.json();
            const threadCount = json.threads?.length ?? 0;
            console.log(`✅ [${url}] SUCCESS! HTTP 200`);
            console.log(`   Data: Found ${threadCount} threads in response.`);
            if (threadCount > 0) {
                console.log(`   Sample: ${json.threads[0].title} (by ${json.threads[0].author?.username})`);
            }
            break; // Found one that works
        } else {
            console.log(`❌ [${url}] Failed. Status: ${res.status}`);
            const text = await res.text();
            console.log(`   Response: ${text.slice(0, 100)}...`);
        }
      } catch (e) {
          console.log(`❌ [${url}] Error: ${e.message}`);
      }
  }
}

main();
