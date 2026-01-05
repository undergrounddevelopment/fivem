const fetch = require('node-fetch');

async function testForum() {
  console.log('🔍 Testing Forum API...\n');
  
  try {
    const res = await fetch('http://localhost:3000/api/forum/threads?limit=5');
    const data = await res.json();
    
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.threads && data.threads.length > 0) {
      console.log('\n📊 Thread Details:');
      data.threads.forEach((thread, i) => {
        console.log(`\n${i + 1}. ${thread.title}`);
        console.log(`   Author: ${thread.author?.username || 'NO AUTHOR'}`);
        console.log(`   Avatar: ${thread.author?.avatar ? 'YES' : 'NO'}`);
        console.log(`   Membership: ${thread.author?.membership || 'N/A'}`);
      });
    } else {
      console.log('❌ No threads found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testForum();
