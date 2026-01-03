/**
 * ANALISIS STRUKTUR DATABASE SUPABASE - 100% LENGKAP
 * Script ini akan menganalisis semua tabel di Supabase dan membandingkan dengan kode
 * 
 * Cara menggunakan:
 * 1. Pastikan environment variables SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah di-set
 * 2. Jalankan: node scripts/analyze-supabase-tables.js
 * 3. Script akan menghasilkan file analisis lengkap
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus di-set!')
  console.error('Set di .env.local atau environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function getAllTables() {
  console.log('📋 Mengambil daftar semua tabel...')
  
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE')
    .order('table_name')

  if (error) {
    // Fallback: Query langsung menggunakan RPC atau query manual
    console.log('⚠️  Tidak bisa query information_schema, menggunakan metode alternatif...')
    return await getTablesAlternative()
  }

  return data.map(t => t.table_name)
}

async function getTablesAlternative() {
  // Coba query beberapa tabel yang diketahui
  const knownTables = [
    'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
    'activities', 'downloads', 'notifications', 'coin_transactions',
    'spin_wheel_prizes', 'spin_wheel_history', 'spin_wheel_tickets',
    'announcements', 'banners', 'testimonials', 'messages', 'reports',
    'likes', 'daily_rewards', 'admin_actions', 'security_events'
  ]

  const existingTables = []
  
  for (const table of knownTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (!error) {
        existingTables.push(table)
        console.log(`  ✅ ${table}`)
      }
    } catch (e) {
      // Table tidak ada atau tidak bisa diakses
    }
  }

  return existingTables
}

async function getTableStructure(tableName) {
  console.log(`  📊 Menganalisis struktur tabel: ${tableName}...`)
  
  try {
    // Coba query dengan limit 0 untuk mendapatkan structure info
    const { data, error, status, statusText } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      return {
        exists: false,
        error: error.message,
        status,
        statusText
      }
    }

    // Get column info by trying to query with specific columns
    const columnInfo = await getColumnInfo(tableName)
    
    return {
      exists: true,
      columns: columnInfo,
      sampleData: data && data.length > 0 ? data[0] : null
    }
  } catch (e) {
    return {
      exists: false,
      error: e.message
    }
  }
}

async function getColumnInfo(tableName) {
  // Query untuk mendapatkan info kolom
  // Kita akan infer dari sample data dan common columns
  const { data } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)

  if (data && data.length > 0) {
    return Object.keys(data[0]).map(key => ({
      name: key,
      type: typeof data[0][key],
      sampleValue: data[0][key]
    }))
  }

  return []
}

async function checkRLSPolicies(tableName) {
  // Check if RLS is enabled by trying to query as anon user
  // If RLS blocks, we'll know it's enabled
  try {
    const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await anonClient.from(tableName).select('*').limit(0)
    
    return {
      enabled: error?.code === 'PGRST301' || error?.message?.includes('policy'),
      canRead: !error || error.code !== 'PGRST301'
    }
  } catch (e) {
    return {
      enabled: 'unknown',
      canRead: false
    }
  }
}

async function analyzeDatabase() {
  console.log('🚀 MULAI ANALISIS DATABASE SUPABASE\n')
  console.log('=' .repeat(60))
  
  const tables = await getAllTables()
  console.log(`\n✅ Ditemukan ${tables.length} tabel:\n`)
  tables.forEach(t => console.log(`  - ${t}`))
  
  const analysis = {
    timestamp: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    totalTables: tables.length,
    tables: {}
  }

  console.log('\n\n📊 MENGANALISIS STRUKTUR SETIAP TABEL:\n')
  console.log('='.repeat(60))

  for (const table of tables) {
    console.log(`\n🔍 Analisis: ${table}`)
    const structure = await getTableStructure(table)
    const rls = await checkRLSPolicies(table)
    
    analysis.tables[table] = {
      ...structure,
      rls
    }

    if (structure.exists) {
      console.log(`  ✅ Tabel ada`)
      console.log(`  📋 Kolom: ${structure.columns?.length || 0}`)
      if (structure.columns) {
        structure.columns.forEach(col => {
          console.log(`     - ${col.name} (${col.type})`)
        })
      }
    } else {
      console.log(`  ❌ Tabel tidak ada atau error: ${structure.error}`)
    }
  }

  // Generate report
  const reportPath = path.join(process.cwd(), 'SUPABASE_ANALYSIS_REPORT.json')
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2))
  console.log(`\n\n✅ Laporan disimpan ke: ${reportPath}`)

  // Generate SQL script untuk perbaikan
  await generateFixScript(analysis)

  return analysis
}

async function generateFixScript(analysis) {
  console.log('\n\n🔧 MEMBUAT SCRIPT PERBAIKAN...\n')
  
  let sqlScript = `-- ============================================\n`
  sqlScript += `-- SCRIPT PERBAIKAN DATABASE - GENERATED\n`
  sqlScript += `-- Tanggal: ${new Date().toISOString()}\n`
  sqlScript += `-- Berdasarkan analisis ${analysis.totalTables} tabel\n`
  sqlScript += `-- ============================================\n\n`

  // Analyze missing columns
  const requiredStructures = {
    'forum_categories': ['id', 'name', 'description', 'icon', 'color', 'sort_order', 'is_active', 'thread_count', 'post_count'],
    'activities': ['id', 'user_id', 'type', 'description', 'action', 'target_id', 'metadata', 'created_at'],
    'forum_threads': ['id', 'title', 'content', 'category_id', 'author_id', 'status', 'is_deleted'],
    'forum_replies': ['id', 'thread_id', 'content', 'author_id', 'is_deleted'],
    'users': ['id', 'discord_id', 'username', 'avatar', 'membership', 'coins', 'is_admin']
  }

  for (const [tableName, requiredColumns] of Object.entries(requiredStructures)) {
    const tableInfo = analysis.tables[tableName]
    
    if (!tableInfo || !tableInfo.exists) {
      sqlScript += `-- ⚠️  Table ${tableName} tidak ditemukan\n\n`
      continue
    }

    const existingColumns = tableInfo.columns?.map(c => c.name) || []
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))

    if (missingColumns.length > 0) {
      sqlScript += `-- Table: ${tableName}\n`
      sqlScript += `-- Kolom yang hilang: ${missingColumns.join(', ')}\n\n`
      
      missingColumns.forEach(col => {
        sqlScript += `-- ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${col} ...;\n`
      })
      sqlScript += `\n`
    }
  }

  // RLS Policies
  sqlScript += `-- ============================================\n`
  sqlScript += `-- RLS POLICIES\n`
  sqlScript += `-- ============================================\n\n`

  for (const tableName of Object.keys(analysis.tables)) {
    const tableInfo = analysis.tables[tableName]
    if (tableInfo.exists && tableInfo.rls.enabled === false) {
      sqlScript += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n`
      sqlScript += `CREATE POLICY "Public can view ${tableName}" ON ${tableName} FOR SELECT USING (true);\n\n`
    }
  }

  const scriptPath = path.join(process.cwd(), 'supabase', 'auto-fix-generated.sql')
  fs.writeFileSync(scriptPath, sqlScript)
  console.log(`✅ Script perbaikan disimpan ke: ${scriptPath}`)
}

// Run analysis
analyzeDatabase()
  .then(() => {
    console.log('\n\n✅ ANALISIS SELESAI!')
    console.log('='.repeat(60))
    process.exit(0)
  })
  .catch(error => {
    console.error('\n\n❌ ERROR:', error)
    process.exit(1)
  })

