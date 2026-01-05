require('dotenv').config()
const { CONFIG, validateConfig } = require('./lib/config.ts')

console.log('=== CONFIGURATION TEST ===')

console.log('\n1. Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

console.log('\n2. CONFIG Object:')
console.log('Supabase URL:', CONFIG.supabase.url ? '✅ Set' : '❌ Missing')
console.log('Supabase Anon Key:', CONFIG.supabase.anonKey ? '✅ Set' : '❌ Missing')
console.log('Supabase Service Key:', CONFIG.supabase.serviceKey ? '✅ Set' : '❌ Missing')

console.log('\n3. Validation:')
const isValid = validateConfig()
console.log('Config Valid:', isValid ? '✅' : '❌')

// Test Supabase connection
async function testSupabase() {
  console.log('\n4. Supabase Connection Test:')
  
  try {
    const { createClient } = require('@supabase/supabase-js')
    
    const supabase = createClient(
      CONFIG.supabase.url,
      CONFIG.supabase.serviceKey || CONFIG.supabase.anonKey
    )
    
    console.log('Client created successfully')
    
    const { data, error } = await supabase
      .from('assets')
      .select('id, title')
      .eq('id', '7df9764a-99bb-4d84-acaa-92d6c2db4dba')
      .single()
    
    if (error) {
      console.log('❌ Query failed:', error.message)
      console.log('Error details:', error)
    } else {
      console.log('✅ Query successful')
      console.log('Asset found:', data?.title)
    }
    
  } catch (err) {
    console.log('❌ Connection failed:', err.message)
  }
}

testSupabase()