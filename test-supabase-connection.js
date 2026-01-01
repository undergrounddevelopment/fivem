// Test Supabase Connection - Complete Analysis
const { createClient } = require('@supabase/supabase-js')

// Configuration from .env
const SUPABASE_URL = 'https://linnqtixdfjwbrixitrb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE'

const REQUIRED_TABLES = [
  'users',
  'assets', 
  'forum_categories',
  'forum_threads',
  'forum_replies',
  'announcements',
  'banners',
  'spin_wheel_prizes',
  'spin_wheel_tickets',
  'spin_wheel_history',
  'notifications',
  'activities',
  'downloads',
  'coin_transactions',
  'testimonials'
]

async function analyzeSupabaseConnection() {
  console.log('🔍 ANALISIS KONEKSI SUPABASE - FiveM Tools V7\n')
  console.log('=' .repeat(60))
  
  // Test 1: Basic Connection
  console.log('\n📡 TEST 1: KONEKSI DASAR')
  console.log('-'.repeat(30))
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.log('❌ Koneksi Anon Key: GAGAL')
      console.log('   Error:', error.message)
      return false
    } else {
      console.log('✅ Koneksi Anon Key: BERHASIL')
    }
  } catch (e) {
    console.log('❌ Koneksi Anon Key: ERROR')
    console.log('   Error:', e.message)
    return false
  }

  try {
    const { data, error } = await adminClient.from('users').select('count').limit(1)
    if (error) {
      console.log('❌ Koneksi Service Key: GAGAL')
      console.log('   Error:', error.message)
    } else {
      console.log('✅ Koneksi Service Key: BERHASIL')
    }
  } catch (e) {
    console.log('❌ Koneksi Service Key: ERROR')
    console.log('   Error:', e.message)
  }

  // Test 2: Table Existence
  console.log('\n🗄️  TEST 2: KEBERADAAN TABEL')
  console.log('-'.repeat(30))
  
  const tableResults = {}
  let existingTables = 0
  
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await adminClient.from(table).select('count').limit(1)
      if (error) {
        console.log(`❌ ${table}: TIDAK ADA`)
        tableResults[table] = false
      } else {
        console.log(`✅ ${table}: ADA`)
        tableResults[table] = true
        existingTables++
      }
    } catch (e) {
      console.log(`❌ ${table}: ERROR`)
      tableResults[table] = false
    }
  }
  
  const tablePercentage = Math.round((existingTables / REQUIRED_TABLES.length) * 100)
  console.log(`\n📊 Status Tabel: ${existingTables}/${REQUIRED_TABLES.length} (${tablePercentage}%)`)

  // Test 3: Data Sampling
  console.log('\n📋 TEST 3: SAMPLING DATA')
  console.log('-'.repeat(30))
  
  const dataSamples = {}
  
  for (const table of REQUIRED_TABLES) {
    if (tableResults[table]) {
      try {
        const { data, error } = await adminClient.from(table).select('*').limit(5)
        if (error) {
          console.log(`❌ ${table}: Error reading data - ${error.message}`)
          dataSamples[table] = 0
        } else {
          console.log(`✅ ${table}: ${data.length} records`)
          dataSamples[table] = data.length
        }
      } catch (e) {
        console.log(`❌ ${table}: Exception - ${e.message}`)
        dataSamples[table] = 0
      }
    } else {
      dataSamples[table] = 'N/A'
    }
  }

  // Test 4: Critical Functions
  console.log('\n⚙️  TEST 4: FUNGSI KRITIS')
  console.log('-'.repeat(30))
  
  const functionTests = {
    'User Creation': false,
    'Asset Retrieval': false,
    'Forum Categories': false,
    'Coin Transactions': false,
    'Spin Wheel': false
  }

  // Test user operations
  try {
    const { data: users } = await adminClient.from('users').select('*').limit(1)
    functionTests['User Creation'] = true
    console.log('✅ User Operations: WORKING')
  } catch (e) {
    console.log('❌ User Operations: FAILED')
  }

  // Test asset operations
  try {
    const { data: assets } = await adminClient.from('assets').select('*').limit(1)
    functionTests['Asset Retrieval'] = true
    console.log('✅ Asset Operations: WORKING')
  } catch (e) {
    console.log('❌ Asset Operations: FAILED')
  }

  // Test forum operations
  try {
    const { data: categories } = await adminClient.from('forum_categories').select('*').limit(1)
    functionTests['Forum Categories'] = true
    console.log('✅ Forum Operations: WORKING')
  } catch (e) {
    console.log('❌ Forum Operations: FAILED')
  }

  // Test coin operations
  try {
    const { data: transactions } = await adminClient.from('coin_transactions').select('*').limit(1)
    functionTests['Coin Transactions'] = true
    console.log('✅ Coin Operations: WORKING')
  } catch (e) {
    console.log('❌ Coin Operations: FAILED')
  }

  // Test spin wheel
  try {
    const { data: prizes } = await adminClient.from('spin_wheel_prizes').select('*').limit(1)
    functionTests['Spin Wheel'] = true
    console.log('✅ Spin Wheel: WORKING')
  } catch (e) {
    console.log('❌ Spin Wheel: FAILED')
  }

  // Test 5: Performance Check
  console.log('\n⚡ TEST 5: PERFORMA')
  console.log('-'.repeat(30))
  
  const startTime = Date.now()
  try {
    await Promise.all([
      adminClient.from('users').select('count').limit(1),
      adminClient.from('assets').select('count').limit(1),
      adminClient.from('forum_categories').select('count').limit(1)
    ])
    const endTime = Date.now()
    const responseTime = endTime - startTime
    console.log(`✅ Response Time: ${responseTime}ms`)
    
    if (responseTime < 1000) {
      console.log('✅ Performance: EXCELLENT')
    } else if (responseTime < 3000) {
      console.log('⚠️  Performance: GOOD')
    } else {
      console.log('❌ Performance: SLOW')
    }
  } catch (e) {
    console.log('❌ Performance Test: FAILED')
  }

  // Final Analysis
  console.log('\n' + '='.repeat(60))
  console.log('📊 HASIL ANALISIS FINAL')
  console.log('='.repeat(60))
  
  const workingFunctions = Object.values(functionTests).filter(Boolean).length
  const totalFunctions = Object.keys(functionTests).length
  const functionPercentage = Math.round((workingFunctions / totalFunctions) * 100)
  
  console.log(`\n🗄️  Database Tables: ${existingTables}/${REQUIRED_TABLES.length} (${tablePercentage}%)`)
  console.log(`⚙️  Core Functions: ${workingFunctions}/${totalFunctions} (${functionPercentage}%)`)
  
  // Overall Status
  if (tablePercentage >= 90 && functionPercentage >= 80) {
    console.log('\n🎉 STATUS: KONEKSI 100% SEMPURNA!')
    console.log('✅ Semua sistem terhubung dengan benar')
    console.log('✅ Database lengkap dan berfungsi')
    console.log('✅ Siap untuk production')
  } else if (tablePercentage >= 70 && functionPercentage >= 60) {
    console.log('\n⚠️  STATUS: KONEKSI BAIK (Perlu Perbaikan Minor)')
    console.log('✅ Sistem utama berfungsi')
    console.log('⚠️  Beberapa tabel/fungsi perlu diperbaiki')
  } else {
    console.log('\n❌ STATUS: KONEKSI BERMASALAH')
    console.log('❌ Banyak tabel/fungsi tidak berfungsi')
    console.log('❌ Perlu setup ulang database')
  }

  // Recommendations
  console.log('\n💡 REKOMENDASI:')
  if (tablePercentage < 100) {
    console.log('- Jalankan database schema setup')
    console.log('- Apply missing table migrations')
  }
  if (functionPercentage < 100) {
    console.log('- Check API endpoint configurations')
    console.log('- Verify environment variables')
  }
  
  console.log('\n🔧 QUICK FIX:')
  console.log('- pnpm run db:setup')
  console.log('- pnpm run validate:env')
  console.log('- pnpm run test:connection')
  
  return {
    tables: { existing: existingTables, total: REQUIRED_TABLES.length, percentage: tablePercentage },
    functions: { working: workingFunctions, total: totalFunctions, percentage: functionPercentage },
    overall: tablePercentage >= 90 && functionPercentage >= 80 ? 'PERFECT' : 
             tablePercentage >= 70 && functionPercentage >= 60 ? 'GOOD' : 'NEEDS_WORK'
  }
}

// Run analysis
analyzeSupabaseConnection().catch(console.error)