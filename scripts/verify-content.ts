
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { createAdminClient } = await import('../lib/supabase/server');
  const supabase = createAdminClient();
  
  console.log('--- Verifying Latest Content ---');

  // Check Users
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('username, email, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (userError) console.error('❌ Users Error:', userError);
  else {
    console.log(`✅ Latest 3 Users Found:`);
    users?.forEach(u => console.log(`   - ${u.username} (${u.email})`));
  }

  // Check Assets (what usually appears on homepage)
  const { data: assets, error: assetError } = await supabase
    .from('assets')
    .select('title, id, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (assetError) console.error('❌ Assets Error:', assetError);
  else {
    console.log(`✅ Latest 3 Assets Found:`);
    assets?.forEach(a => console.log(`   - ${a.title} (ID: ${a.id})`));
  }
}

main();
