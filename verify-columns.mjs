import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://linnqtixdfjwbrixitrb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'
);

async function verifyColumns() {
  console.log('🔍 Verifying Column Names\n');

  const tables = [
    'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
    'announcements', 'banners', 'spin_wheel_prizes', 'spin_wheel_tickets',
    'spin_wheel_history', 'notifications', 'activities', 'downloads',
    'coin_transactions', 'testimonials'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`✅ ${table}:`);
      console.log(`   Columns: ${columns.join(', ')}\n`);
    } else {
      console.log(`⚠️  ${table}: No data (empty table)\n`);
    }
  }
}

verifyColumns();
