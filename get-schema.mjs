import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://linnqtixdfjwbrixitrb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getFullSchema() {
  try {
    console.log('🔍 Fetching schema...');

    const tables = [
      'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
      'announcements', 'banners', 'spin_wheel_prizes', 'spin_wheel_tickets',
      'spin_wheel_history', 'notifications', 'activities', 'downloads',
      'coin_transactions', 'testimonials'
    ];

    let sql = `-- FiveM Tools V7 - Full Database Schema\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n\n`;

    for (const table of tables) {
      console.log(`📋 Processing ${table}...`);
      
      const { data, error } = await supabase.from(table).select('*').limit(0);
      
      if (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
        continue;
      }

      // Get actual data for structure
      const { data: sampleData } = await supabase.from(table).select('*').limit(1);
      
      if (sampleData && sampleData.length > 0) {
        const columns = Object.keys(sampleData[0]);
        sql += `-- Table: ${table}\n`;
        sql += `CREATE TABLE ${table} (\n`;
        
        const columnDefs = columns.map(col => {
          const value = sampleData[0][col];
          let type = 'TEXT';
          
          if (col === 'id') type = 'UUID PRIMARY KEY DEFAULT gen_random_uuid()';
          else if (col.includes('_at')) type = 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()';
          else if (typeof value === 'number') type = value % 1 === 0 ? 'INTEGER' : 'NUMERIC';
          else if (typeof value === 'boolean') type = 'BOOLEAN';
          else if (col.includes('_id')) type = 'UUID';
          
          return `  ${col} ${type}`;
        });
        
        sql += columnDefs.join(',\n');
        sql += `\n);\n\n`;
      }
    }

    // Add indexes
    sql += `\n-- Common Indexes\n`;
    sql += `CREATE INDEX idx_assets_type ON assets(type);\n`;
    sql += `CREATE INDEX idx_assets_category ON assets(category);\n`;
    sql += `CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);\n`;
    sql += `CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id);\n`;
    sql += `CREATE INDEX idx_downloads_asset ON downloads(asset_id);\n`;
    sql += `CREATE INDEX idx_downloads_user ON downloads(user_id);\n`;

    fs.writeFileSync('full-schema.sql', sql);
    console.log('✅ Schema saved to full-schema.sql');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getFullSchema();
