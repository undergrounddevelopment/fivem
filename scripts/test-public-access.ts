
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

async function main() {
  console.log('--- Testing Public (Anon) Access ---');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing URL or Anon Key in .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Try to fetch assets as a public user would
  const { data: assets, error, count } = await supabase
    .from('assets')
    .select('id, title', { count: 'exact', head: false })
    .limit(5);

  if (error) {
    console.error('❌ Public Query Failed:', error.message);
  } else {
    console.log(`📊 Public Assets Found: ${assets?.length ?? 0}`);
    if (assets?.length === 0) {
        console.warn('⚠️  0 Assets found via Public Key. (Admin found 3+). RLS IS LIKELY BLOCKING VIEW.');
    } else {
        console.log('✅ Public [assets] working. Sample:', assets?.[0]?.title);
    }
  }

  // Check Forum Categories
  const { data: cats, error: catError } = await supabase
    .from('forum_categories')
    .select('id, name')
    .limit(3);
  
  if (catError) console.error('❌ Public [forum_categories] Failed:', catError.message);
  else console.log(`📊 Public [forum_categories] Found: ${cats?.length ?? 0}`);

  // Check Users (Profiles usually public)
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, username')
    .limit(3);

  if (userError) console.error('❌ Public [users] Failed:', userError.message);
  else console.log(`📊 Public [users] Found: ${users?.length ?? 0}`);
}

main();
