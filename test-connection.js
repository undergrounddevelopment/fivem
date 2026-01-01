const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://peaulqbbvgzpnwshtbok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlYXVscWJidmd6cG53c2h0Ym9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5MTg2NCwiZXhwIjoyMDgyNzY3ODY0fQ.Mh7RO29q7Ef2qlnBjI76EnDa3-4XtXsnZzJGG2Kvix4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public').limit(5);
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('Tables found:', data?.length || 0);
    
    // Get table count
    const { count, error: countError } = await supabase
      .from('information_schema.tables')
      .select('*', { count: 'exact', head: true })
      .eq('table_schema', 'public');
    
    if (countError) {
      console.error('Count error:', countError);
    } else {
      console.log(`✅ Found ${count} tables in public schema`);
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testConnection();
