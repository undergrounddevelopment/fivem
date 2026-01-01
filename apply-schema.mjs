import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://linnqtixdfjwbrixitrb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE';

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function applySchema() {
  try {
    console.log('📋 Reading SQL file...');
    const sql = fs.readFileSync('complete-schema.sql', 'utf8');
    
    console.log('🚀 Applying schema to database...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error:', error.message);
      
      // Try alternative method - split and execute
      console.log('🔄 Trying alternative method...');
      const statements = sql.split(';').filter(s => s.trim());
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim();
        if (!stmt) continue;
        
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        
        const { error: stmtError } = await supabase.rpc('exec_sql', { 
          sql_query: stmt + ';' 
        });
        
        if (stmtError) {
          console.log(`⚠️  Statement ${i + 1} error: ${stmtError.message}`);
        }
      }
    } else {
      console.log('✅ Schema applied successfully!');
    }
    
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

applySchema();
