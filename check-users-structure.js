const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://peaulqbbvgzpnwshtbok.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlYXVscWJidmd6cG53c2h0Ym9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5MTg2NCwiZXhwIjoyMDgyNzY3ODY0fQ.Mh7RO29q7Ef2qlnBjI76EnDa3-4XtXsnZzJGG2Kvix4';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkUsersStructure() {
  console.log('🔍 Checking users table structure...\n');
  
  try {
    // Get a sample user to see structure
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing users:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const user = data[0];
      console.log('✅ Users table accessible');
      console.log('📋 Sample user structure:');
      Object.keys(user).forEach(key => {
        console.log(`   - ${key}: ${typeof user[key]} (${user[key] !== null ? 'has value' : 'null'})`);
      });
      
      console.log(`\n🔑 Primary key check: ${user.id ? '✅ id field exists' : '❌ no id field'}`);
      console.log(`📊 Total users: ${data.length} (sample)`);
      
      // Check if id is unique by trying to get count
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`📈 Total users in database: ${count}`);
      }
      
    } else {
      console.log('❌ No users found in table');
    }
    
  } catch (err) {
    console.error('❌ Check failed:', err.message);
  }
}

checkUsersStructure();
