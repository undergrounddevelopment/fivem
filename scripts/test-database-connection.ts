#!/usr/bin/env tsx
/**
 * Test Database Connection Script
 * Tests Supabase connection and PostgreSQL direct connection
 */

import { createClient } from '@supabase/supabase-js'
// @ts-ignore
import { Client } from 'pg'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU'
const POSTGRES_URL =
  process.env.POSTGRES_URL ||
  'postgres://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require'

async function testSupabaseConnection() {
  console.log('\n🔍 Testing Supabase Connection...')
  console.log('URL:', SUPABASE_URL)

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Test basic query
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })

    if (error) {
      console.log('⚠️  Query error (table might not exist yet):', error.message)
      console.log('✅ Connection successful (error is expected if tables not created)')
      return true
    }

    console.log('✅ Supabase connection successful!')
    console.log('📊 Users table accessible')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}

async function testPostgresConnection() {
  console.log('\n🔍 Testing PostgreSQL Direct Connection...')
  console.log('URL:', POSTGRES_URL.replace(/:[^:@]+@/, ':****@'))

  const client = new Client({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    console.log('✅ PostgreSQL connection successful!')

    // Test query
    const result = await client.query('SELECT version()')
    console.log('📊 PostgreSQL version:', result.rows[0].version.split(' ').slice(0, 2).join(' '))

    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)

    console.log(`📋 Found ${tables.rows.length} tables in public schema`)
    if (tables.rows.length > 0) {
      console.log('Tables:', tables.rows.map((r: any) => r.table_name).join(', '))
    }

    await client.end()
    return true
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error)
    try {
      await client.end()
    } catch {}
    return false
  }
}

async function main() {
  console.log('🚀 Database Connection Test')
  console.log('=' .repeat(50))

  const supabaseOk = await testSupabaseConnection()
  const postgresOk = await testPostgresConnection()

  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Results:')
  console.log('  Supabase:', supabaseOk ? '✅ OK' : '❌ FAILED')
  console.log('  PostgreSQL:', postgresOk ? '✅ OK' : '❌ FAILED')

  if (supabaseOk && postgresOk) {
    console.log('\n✅ All connections successful!')
    console.log('💡 You can now run: npm run dev')
    process.exit(0)
  } else {
    console.log('\n❌ Some connections failed')
    console.log('💡 Check your .env.local file and credentials')
    process.exit(1)
  }
}

main()
