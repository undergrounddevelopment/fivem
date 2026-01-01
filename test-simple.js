const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://peaulqbbvgzpnwshtbok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlYXVscWJidmd6cG53c2h0Ym9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5MTg2NCwiZXhwIjoyMDgyNzY3ODY0fQ.Mh7RO29q7Ef2qlnBjI76EnDa3-4XtXsnZzJGG2Kvix4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimple() {
  try {
    console.log('Testing simple connection...');
    
    // Try to get any table that might exist
    const { data, error } = await supabase.rpc('get_table_info');
    
    if (error) {
      console.log('RPC failed, trying direct SQL...');
      
      // Try using raw SQL
      const { data: sqlData, error: sqlError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .limit(10);
      
      if (sqlError) {
        console.log('pg_tables failed, checking if any user tables exist...');
        
        // List common table names that might exist
        const commonTables = ['users', 'profiles', 'posts', 'testimonials', 'settings', 'spin_wheel'];
        
        for (const tableName of commonTables) {
          try {
            const { data: tableData, error: tableError } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (!tableError) {
              console.log(`✅ Found table: ${tableName}`);
              console.log(`Sample data:`, tableData);
              return;
            }
          } catch (e) {
            // Table doesn't exist, continue
          }
        }
        
        console.log('❌ No common tables found. Database might be empty.');
      } else {
        console.log('✅ Found tables:', sqlData);
      }
    } else {
      console.log('✅ RPC success:', data);
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testSimple();
