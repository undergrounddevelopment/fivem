const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://peaulqbbvgzpnwshtbok.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlYXVscWJidmd6cG53c2h0Ym9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5MTg2NCwiZXhwIjoyMDgyNzY3ODY0fQ.Mh7RO29q7Ef2qlnBjI76EnDa3-4XtXsnZzJGG2Kvix4';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkFullAccess() {
  console.log('🔍 Checking full Supabase access...\n');
  
  // Test 1: Raw SQL access
  console.log('1. Testing raw SQL access...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;' 
    });
    
    if (error) {
      console.log('❌ Raw SQL failed:', error.message);
    } else {
      console.log('✅ Raw SQL works, tables:', data?.length || 0);
    }
  } catch (e) {
    console.log('❌ Raw SQL exception:', e.message);
  }
  
  // Test 2: Direct table access with service role
  console.log('\n2. Testing service role permissions...');
  const commonTables = [
    'users', 'profiles', 'posts', 'testimonials', 'settings', 
    'spin_wheel', 'spin_history', 'forum_posts', 'forum_categories',
    'downloads', 'coins_transactions', 'rewards', 'admin_logs'
  ];
  
  let accessibleTables = [];
  let inaccessibleTables = [];
  
  for (const tableName of commonTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        inaccessibleTables.push(`${tableName}: ${error.message}`);
      } else {
        accessibleTables.push(tableName);
        console.log(`✅ ${tableName}: ${data.length} rows`);
      }
    } catch (e) {
      inaccessibleTables.push(`${tableName}: ${e.message}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Accessible tables: ${accessibleTables.length}`);
  console.log(`❌ Inaccessible tables: ${inaccessibleTables.length}`);
  
  if (inaccessibleTables.length > 0) {
    console.log('\n❌ Issues found:');
    inaccessibleTables.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // Test 3: Write permissions
  console.log('\n3. Testing write permissions...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .single();
    
    if (error) {
      console.log('❌ Read access failed:', error.message);
    } else {
      console.log('✅ Read access works');
    }
  } catch (e) {
    console.log('❌ Read test exception:', e.message);
  }
  
  // Test 4: Check if we need to create missing tables
  console.log('\n4. Checking database schema...');
  try {
    // Try to get schema using a different approach
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.log('❌ Cannot access pg_tables:', error.message);
      console.log('🔧 Suggestion: May need to enable pg_tables access or create missing tables');
    } else {
      console.log('✅ Found tables in pg_tables:', data);
    }
  } catch (e) {
    console.log('❌ Schema check failed:', e.message);
  }
  
  return {
    accessibleTables,
    inaccessibleTables,
    totalChecked: commonTables.length
  };
}

checkFullAccess().then(result => {
  console.log('\n🎯 Final Result:');
  console.log(`- Success rate: ${Math.round((result.accessibleTables.length / result.totalChecked) * 100)}%`);
  console.log(`- Accessible: ${result.accessibleTables.length}/${result.totalChecked}`);
  
  if (result.inaccessibleTables.length > 0) {
    console.log('\n⚠️  Action needed: Fix access for missing tables');
  } else {
    console.log('\n✅ Full access confirmed!');
  }
}).catch(err => {
  console.error('❌ Check failed:', err);
});
