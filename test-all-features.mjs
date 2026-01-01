import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://linnqtixdfjwbrixitrb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'
);

async function testAllFeatures() {
  console.log('🧪 Testing All Features with Correct Tables\n');

  const tests = [
    { name: 'Users', table: 'users', query: () => supabase.from('users').select('*').limit(1) },
    { name: 'Assets', table: 'assets', query: () => supabase.from('assets').select('*').limit(1) },
    { name: 'Forum Categories', table: 'forum_categories', query: () => supabase.from('forum_categories').select('*').limit(1) },
    { name: 'Forum Threads', table: 'forum_threads', query: () => supabase.from('forum_threads').select('*').limit(1) },
    { name: 'Forum Replies', table: 'forum_replies', query: () => supabase.from('forum_replies').select('*').limit(1) },
    { name: 'Announcements', table: 'announcements', query: () => supabase.from('announcements').select('*').limit(1) },
    { name: 'Banners', table: 'banners', query: () => supabase.from('banners').select('*').limit(1) },
    { name: 'Spin Wheel Prizes', table: 'spin_wheel_prizes', query: () => supabase.from('spin_wheel_prizes').select('*').limit(1) },
    { name: 'Spin Wheel Tickets', table: 'spin_wheel_tickets', query: () => supabase.from('spin_wheel_tickets').select('*').limit(1) },
    { name: 'Spin Wheel History', table: 'spin_wheel_history', query: () => supabase.from('spin_wheel_history').select('*').limit(1) },
    { name: 'Notifications', table: 'notifications', query: () => supabase.from('notifications').select('*').limit(1) },
    { name: 'Activities', table: 'activities', query: () => supabase.from('activities').select('*').limit(1) },
    { name: 'Downloads', table: 'downloads', query: () => supabase.from('downloads').select('*').limit(1) },
    { name: 'Coin Transactions', table: 'coin_transactions', query: () => supabase.from('coin_transactions').select('*').limit(1) },
    { name: 'Testimonials', table: 'testimonials', query: () => supabase.from('testimonials').select('*').limit(1) },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const { data, error } = await test.query();
    
    if (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    } else {
      console.log(`✅ ${test.name}: OK`);
      passed++;
    }
  }

  console.log(`\n📊 Results: ${passed}/${tests.length} passed`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL FEATURES READY!');
  } else {
    console.log(`\n⚠️  ${failed} features need attention`);
  }
}

testAllFeatures();
