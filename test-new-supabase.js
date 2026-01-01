const { createClient } = require('@supabase/supabase-js')

// New Supabase credentials
const supabaseUrl = 'https://linnqtixdfjwbrixitrb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔄 Testing new Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful!')
    
    // List all tables
    console.log('\n📋 Checking existing tables...')
    const tables = [
      'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
      'banners', 'spin_wheel_prizes', 'spin_wheel_tickets', 'spin_wheel_history',
      'notifications', 'activities', 'downloads', 'coin_transactions', 'testimonials', 'announcements'
    ]
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1)
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Connected`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }
    
    return true
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    return false
  }
}

testConnection()