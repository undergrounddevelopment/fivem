
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key to bypass RLS and perform schema changes if possible (though schema changes usually need direct SQL or owner, usually service role can insert)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const COMMUNITY_BANNERS = [
  { title: 'Community Banner 1', image_url: '/bann/Comp_1_iteration_2.gif', position: 'community', order_index: 0 },
  { title: 'Community Banner 2', image_url: '/bann/SSZ_Signature.gif.998f970435dd066c4b4b504dad332be3_2-ezgif.com-video-to-gif-converter.gif', position: 'community', order_index: 1 },
  { title: 'Community Banner 3', image_url: '/bann/banner_1_iteration_1.gif', position: 'community', order_index: 2 },
  { title: 'Community Banner 4', image_url: '/bann/render_iteration_1.gif', position: 'community', order_index: 3 },
  { title: 'Community Banner 5', image_url: '/bann/sad.gif', position: 'community', order_index: 4 },
];

async function main() {
  console.log('🚀 Starting Database Migration: Banner Position & Seeding');

  // 1. Add 'position' column if not exists
  // We use a raw SQL query via rpc 'exec_sql' if available (setup usually creates this function)
  // If not valid, we might need a direct SQL connection, but let's try RPC first as it was used in setup script.
  
  const addColumnSql = `
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'position') THEN 
        ALTER TABLE banners ADD COLUMN position TEXT DEFAULT 'home'; 
      END IF; 
    END $$;
  `;

  try {
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: addColumnSql });
    if (schemaError) {
       // Fallback: If exec_sql is restricted or missing, we can try to just run it on the SQL query tab manually OR 
       // rely on the user to run it. However, since we have the service role, let's hope RLS allows modifying structure or the function exists.
       console.warn('⚠️ Schema update via RPC failed (might need manual SQL run). Trying insert anyway in case column exists...', schemaError.message);
    } else {
       console.log('✅ Base Schema Updated (position column added)');
    }
  } catch (e) {
      console.log('⚠️ RPC exec_sql call failed:', e);
  }

  // 2. Insert Data
  // First clean up old community banners to avoid duplicates if re-running
  await supabase.from('banners').delete().eq('position', 'community');

  const { error: insertError, data } = await supabase
    .from('banners')
    .insert(COMMUNITY_BANNERS)
    .select();

  if (insertError) {
    console.error('❌ Failed to insert banners:', insertError.message);
    console.error('   Hint: If column "position" does not exist, you MUST run this SQL manually:');
    console.error(`   ALTER TABLE banners ADD COLUMN position TEXT DEFAULT 'home';`);
  } else {
    console.log(`✅ Successfully seeded ${data.length} community banners!`);
  }
}

main();
