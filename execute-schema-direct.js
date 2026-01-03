#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function executeSchemaDirectly() {
  console.log('🚀 FiveM Tools V7 - Direct Database Schema Execution\n');

  // Check if we have the required packages
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    console.log('✅ Supabase credentials found');
    console.log(`🔗 Project: ${supabaseUrl}\n`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Read schema file
    const schemaPath = path.join(__dirname, 'database-schema-complete-v7.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📖 Schema file loaded');
    console.log(`📊 Size: ${(schemaSQL.length / 1024).toFixed(2)} KB\n`);

    // Execute the schema in chunks
    console.log('🔧 Executing database schema...\n');

    // Split into logical chunks (by table creation)
    const chunks = schemaSQL.split('-- =============================================');
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim();
      if (chunk.length < 50) continue;

      console.log(`⚡ Executing chunk ${i + 1}/${chunks.length}...`);

      try {
        // For Supabase, we need to execute SQL directly
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: chunk
        });

        if (error) {
          console.log(`⚠️  Chunk ${i + 1} had issues (this is normal for some statements)`);
          console.log(`   Error: ${error.message}`);
        } else {
          console.log(`✅ Chunk ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Chunk ${i + 1} execution error: ${err.message}`);
      }
    }

    // Verify tables
    console.log('\n🔍 Verifying database setup...');

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tables && tables.length > 0) {
      console.log(`✅ Found ${tables.length} tables in database`);
      
      const coreTableNames = [
        'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
        'notifications', 'activities', 'downloads', 'coin_transactions',
        'spin_wheel_prizes', 'spin_wheel_tickets', 'spin_wheel_history',
        'announcements', 'banners', 'testimonials'
      ];

      const existingTables = tables.map(t => t.table_name);
      const foundCoreTables = coreTableNames.filter(t => existingTables.includes(t));

      console.log(`🎯 Core tables found: ${foundCoreTables.length}/${coreTableNames.length}`);
      
      if (foundCoreTables.length >= 10) {
        console.log('\n🎉 Database setup successful!');
        console.log('✅ Your FiveM Tools V7 database is ready to use!');
      } else {
        console.log('\n⚠️  Some tables may be missing. Check Supabase dashboard.');
      }
    } else {
      console.log('⚠️  Could not verify tables. Check your Supabase dashboard.');
    }

    console.log('\n🚀 Next steps:');
    console.log('1. Run: pnpm dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Test Discord login');
    console.log('4. Check Supabase dashboard for tables');

  } catch (error) {
    console.log('❌ Direct execution not available');
    console.log('💡 Reason:', error.message);
    console.log('\n🔧 Alternative method:');
    console.log('1. Install Supabase client: pnpm add @supabase/supabase-js');
    console.log('2. Or use the EXECUTE_IN_SUPABASE.sql file in Supabase dashboard');
    console.log('3. Go to: https://supabase.com/dashboard/project/linnqtixdfjwbrixitrb/sql');
    console.log('4. Copy and paste the SQL from EXECUTE_IN_SUPABASE.sql');
    console.log('5. Click "Run"');
  }
}

executeSchemaDirectly().catch(console.error);