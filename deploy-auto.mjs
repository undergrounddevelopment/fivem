import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://linnqtixdfjwbrixitrb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE';

const supabase = createClient(supabaseUrl, serviceKey);

async function executeSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  return response;
}

async function deploySchema() {
  console.log('🚀 FiveM Tools V7 - Database Deployment\n');
  
  try {
    console.log('📋 Reading schema file...');
    const schema = fs.readFileSync('complete-schema.sql', 'utf8');
    
    console.log('🗑️  Dropping existing tables...');
    const dropTables = `
      DROP TABLE IF EXISTS forum_replies CASCADE;
      DROP TABLE IF EXISTS forum_threads CASCADE;
      DROP TABLE IF EXISTS forum_categories CASCADE;
      DROP TABLE IF EXISTS downloads CASCADE;
      DROP TABLE IF EXISTS coin_transactions CASCADE;
      DROP TABLE IF EXISTS spin_wheel_history CASCADE;
      DROP TABLE IF EXISTS spin_wheel_tickets CASCADE;
      DROP TABLE IF EXISTS spin_wheel_prizes CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS activities CASCADE;
      DROP TABLE IF EXISTS testimonials CASCADE;
      DROP TABLE IF EXISTS banners CASCADE;
      DROP TABLE IF EXISTS announcements CASCADE;
      DROP TABLE IF EXISTS assets CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    
    // Split into individual statements
    const statements = schema.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...\n`);
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;
      
      const preview = stmt.substring(0, 50).replace(/\n/g, ' ');
      process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);
      
      try {
        // Execute via REST API
        const { error } = await supabase.rpc('exec', { sql: stmt + ';' });
        
        if (error) {
          console.log('❌');
          failed++;
        } else {
          console.log('✅');
          success++;
        }
      } catch (err) {
        console.log('⚠️');
        failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Results:`);
    console.log(`   ✅ Success: ${success}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 Schema deployed successfully!');
      console.log('\n📝 Next: Run seed-data.sql for sample data');
    } else {
      console.log('\n⚠️  Some statements failed. Check manually in Supabase Dashboard.');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.log('\n💡 Alternative: Use apply-schema.bat untuk manual deployment');
  }
}

deploySchema();
