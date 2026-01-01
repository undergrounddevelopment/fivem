const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://peaulqbbvgzpnwshtbok.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlYXVscWJidmd6cG53c2h0Ym9rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE5MTg2NCwiZXhwIjoyMDgyNzY3ODY0fQ.Mh7RO29q7Ef2qlnBjI76EnDa3-4XtXsnZzJGG2Kvix4';

const supabase = createClient(supabaseUrl, serviceKey);

async function testWriteOperations() {
  console.log('🧪 Testing write operations...\n');
  
  // Test 1: Insert a test spin record
  console.log('1. Testing spin_wheel insert...');
  try {
    const { data, error } = await supabase
      .from('spin_wheel')
      .insert({
        user_id: '006e373e-6d58-4a75-bbe6-24367294b8fe', // Use existing user
        prize_type: 'coins',
        prize_value: 50,
        spin_cost: 10,
        is_won: true
      })
      .select();
    
    if (error) {
      console.log('❌ Spin insert failed:', error.message);
    } else {
      console.log('✅ Spin insert successful:', data);
    }
  } catch (e) {
    console.log('❌ Spin insert exception:', e.message);
  }
  
  // Test 2: Insert a coins transaction
  console.log('\n2. Testing coins_transactions insert...');
  try {
    const { data, error } = await supabase
      .from('coins_transactions')
      .insert({
        user_id: '006e373e-6d58-4a75-bbe6-24367294b8fe',
        amount: 50,
        type: 'earned',
        source: 'spin_wheel',
        description: 'Won from spin wheel',
        balance_after: 150
      })
      .select();
    
    if (error) {
      console.log('❌ Transaction insert failed:', error.message);
    } else {
      console.log('✅ Transaction insert successful:', data);
    }
  } catch (e) {
    console.log('❌ Transaction insert exception:', e.message);
  }
  
  // Test 3: Update user coins
  console.log('\n3. Testing user update...');
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ coins: 150 })
      .eq('id', '006e373e-6d58-4a75-bbe6-24367294b8fe')
      .select();
    
    if (error) {
      console.log('❌ User update failed:', error.message);
    } else {
      console.log('✅ User update successful:', data);
    }
  } catch (e) {
    console.log('❌ User update exception:', e.message);
  }
  
  // Test 4: Insert a post
  console.log('\n4. Testing posts insert...');
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: 'Test Post',
        slug: 'test-post-' + Date.now(),
        content: 'This is a test post content',
        excerpt: 'Test post excerpt',
        status: 'published',
        author_id: '006e373e-6d58-4a75-bbe6-24367294b8fe'
      })
      .select();
    
    if (error) {
      console.log('❌ Post insert failed:', error.message);
    } else {
      console.log('✅ Post insert successful:', data);
    }
  } catch (e) {
    console.log('❌ Post insert exception:', e.message);
  }
  
  // Test 5: Read back the data
  console.log('\n5. Testing read operations...');
  try {
    const { data: spins, error: spinError } = await supabase
      .from('spin_wheel')
      .select('*')
      .limit(3);
    
    if (spinError) {
      console.log('❌ Spin read failed:', spinError.message);
    } else {
      console.log('✅ Spin read successful:', spins.length, 'records');
    }
    
    const { data: transactions, error: transError } = await supabase
      .from('coins_transactions')
      .select('*')
      .limit(3);
    
    if (transError) {
      console.log('❌ Transaction read failed:', transError.message);
    } else {
      console.log('✅ Transaction read successful:', transactions.length, 'records');
    }
    
  } catch (e) {
    console.log('❌ Read operations exception:', e.message);
  }
  
  console.log('\n🎯 Write operations test completed!');
}

testWriteOperations();
