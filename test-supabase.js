require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('=== SUPABASE CONNECTION TEST ===')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n1. Environment Check:')
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing required environment variables')
  process.exit(1)
}

async function testConnection() {
  console.log('\n2. Connection Test:')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Client created')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('assets')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log('❌ Connection failed:', testError.message)
      return
    }
    
    console.log('✅ Database connection OK')
    
    // Test specific asset
    const assetId = '7df9764a-99bb-4d84-acaa-92d6c2db4dba'
    console.log(`\n3. Testing Asset ID: ${assetId}`)
    
    const { data: asset, error } = await supabase
      .from('assets')
      .select('id, title, status, author_id')
      .eq('id', assetId)
      .single()
    
    if (error) {
      console.log('❌ Asset query failed:', error.message)
      console.log('Error code:', error.code)
      console.log('Error details:', error.details)
    } else {
      console.log('✅ Asset found:')
      console.log('  Title:', asset.title)
      console.log('  Status:', asset.status)
      console.log('  Author ID:', asset.author_id)
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message)
    console.log('Stack:', err.stack)
  }
}

testConnection()