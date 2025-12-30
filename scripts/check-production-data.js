const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://linnqtixdfjwbrixitrb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Mengecek data production...\n');

  // Check users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, email, role, created_at')
    .order('created_at', { ascending: false });

  if (usersError) {
    console.error('❌ Error mengambil users:', usersError.message);
  } else {
    console.log(`👥 Total Users: ${users.length}`);
    console.log('\nUser List:');
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.username || user.email} (${user.role}) - ${new Date(user.created_at).toLocaleDateString()}`);
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Check assets
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('id, title, category, downloads, created_at')
    .order('created_at', { ascending: false });

  if (assetsError) {
    console.error('❌ Error mengambil assets:', assetsError.message);
  } else {
    console.log(`📦 Total Assets: ${assets.length}`);
    console.log('\nAsset List:');
    assets.forEach((asset, i) => {
      console.log(`${i + 1}. ${asset.title} (${asset.category}) - ${asset.downloads} downloads - ${new Date(asset.created_at).toLocaleDateString()}`);
    });
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Stats
  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  const totalDownloads = assets?.reduce((sum, a) => sum + (a.downloads || 0), 0) || 0;

  console.log('📊 Statistik:');
  console.log(`   - Admin: ${adminCount}`);
  console.log(`   - Regular Users: ${(users?.length || 0) - adminCount}`);
  console.log(`   - Total Downloads: ${totalDownloads}`);
}

checkData().catch(console.error);
