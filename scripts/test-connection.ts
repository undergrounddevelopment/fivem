import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || ''

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Client Connection...')
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
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
  console.log('🔍 Testing Postgres Connection...')
  try {
    if (!DATABASE_URL) {
      throw new Error('Missing DATABASE_URL / POSTGRES_URL / SUPABASE_DB_URL')
    }

    const sslEnabled = DATABASE_URL.includes('supabase') || DATABASE_URL.includes('neon')
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    })
    const result = await pool.query('SELECT NOW() as time')
    await pool.end()
    
    console.log('✅ Postgres: Connected')
    console.log('   Server Time:', result.rows[0].time)
    return true
  } catch (error) {
    console.error('❌ Postgres Error:', error)
    return false
  }
}

async function testDatabaseTables() {
  console.log('🔍 Testing Database Tables...')
  try {
    if (!DATABASE_URL) {
      throw new Error('Missing DATABASE_URL / POSTGRES_URL / SUPABASE_DB_URL')
    }

    const sslEnabled = DATABASE_URL.includes('supabase') || DATABASE_URL.includes('neon')
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    })
    
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    await pool.end()
    
    console.log('✅ Database Tables:', tablesRes.rows.length)
    tablesRes.rows.forEach(t => console.log('   -', t.table_name))
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
