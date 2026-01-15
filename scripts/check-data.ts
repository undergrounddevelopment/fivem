
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { createAdminClient } = await import('../lib/supabase/server');
  const supabase = createAdminClient();
  
  // Debug: Print config (masked)
  console.log('Supabase Config:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' : 'missing',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '***' : 'missing'
  });

  // Try standard client first
  const { createClient } = await import('@supabase/supabase-js');
  const simpleClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log('--- Simple Client Verification ---');
  const { count: simpleCount, error: simpleError } = await simpleClient
    .from('users')
    .select('*', { count: 'exact', head: true });
    
  if (simpleError) console.error('Simple Client Error:', simpleError);
  else console.log('Simple Client Users Count:', simpleCount);

  // Then try admin
  // const supabase = createAdminClient(); ...

}

main();
