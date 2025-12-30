import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU'
const DATABASE_URL = process.env.POSTGRES_URL || 'postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres'

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Client Connection...')
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) throw error
    console.log('✅ Supabase Client: Connected')
    return true
  } catch (error) {
    console.error('❌ Supabase Client Error:', error)
    return false
  }
}

async function testPostgresConnection() {
  console.log('🔍 Testing Postgres.js Connection...')
  try {
    const sql = postgres(DATABASE_URL, { ssl: 'require' })
    const result = await sql`SELECT NOW() as time`
    await sql.end()
    
    console.log('✅ Postgres.js: Connected')
    console.log('   Server Time:', result[0].time)
    return true
  } catch (error) {
    console.error('❌ Postgres.js Error:', error)
    return false
  }
}

async function testDatabaseTables() {
  console.log('🔍 Testing Database Tables...')
  try {
    const sql = postgres(DATABASE_URL, { ssl: 'require' })
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    await sql.end()
    
    console.log('✅ Database Tables:', tables.length)
    tables.forEach(t => console.log('   -', t.table_name))
    return true
  } catch (error) {
    console.error('❌ Database Tables Error:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Database Connection Tests\n')
  
  const results = await Promise.all([
    testSupabaseConnection(),
    testPostgresConnection(),
    testDatabaseTables()
  ])
  
  const allPassed = results.every(r => r === true)
  
  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED')
  } else {
    console.log('❌ SOME TESTS FAILED')
  }
  console.log('='.repeat(50))
  
  process.exit(allPassed ? 0 : 1)
}

main()
