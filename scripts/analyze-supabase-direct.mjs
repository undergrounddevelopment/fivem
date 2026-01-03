/**
 * ANALISIS DATABASE SUPABASE LANGSUNG
 * Script ini akan connect langsung ke Supabase dan menganalisis semua tabel
 * 
 * Cara menggunakan:
 * node scripts/analyze-supabase-direct.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load config from .env.local or use defaults from lib/config.ts
function loadConfig() {
  try {
    const envPath = join(__dirname, '..', '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    const env = {}
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
      }
    })
    
    return {
      url: env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL,
      serviceKey: env.SUPABASE_SERVICE_ROLE_KEY
    }
  } catch (e) {
    // Use defaults from config.ts
    return {
      url: 'https://linnqtixdfjwbrixitrb.supabase.co',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  }
}

const config = loadConfig()

if (!config.url || !config.serviceKey) {
  console.error('❌ ERROR: Supabase credentials tidak ditemukan!')
  console.error('\nPastikan file .env.local berisi:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  console.error('\nAtau set sebagai environment variables:')
  console.error('export SUPABASE_URL=...')
  console.error('export SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(config.url, config.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const KNOWN_TABLES = [
  'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
  'activities', 'downloads', 'notifications', 'coin_transactions',
  'spin_wheel_prizes', 'spin_wheel_history', 'spin_wheel_tickets',
  'announcements', 'banners', 'testimonials', 'messages', 'reports',
  'likes', 'daily_rewards', 'admin_actions', 'security_events', 'firewall_rules'
]

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      return {
        exists: false,
        error: error.message,
        code: error.code
      }
    }

    const columns = data && data.length > 0 ? Object.keys(data[0]) : []
    const sampleRow = data?.[0] || null
    
    // Get column types
    const columnInfo = columns.map(col => ({
      name: col,
      type: sampleRow ? typeof sampleRow[col] : 'unknown',
      nullable: sampleRow ? sampleRow[col] === null : false
    }))

    return {
      exists: true,
      columns,
      columnInfo,
      sampleRow,
      rowCount: data?.length || 0
    }
  } catch (e) {
    return {
      exists: false,
      error: e.message
    }
  }
}

async function analyzeAllTables() {
  console.log('🔍 ANALISIS DATABASE SUPABASE LANGSUNG\n')
  console.log('='.repeat(70))
  console.log(`📡 URL: ${config.url.replace(/\/\/.*@/, '//***@')}`)
  console.log('='.repeat(70))
  console.log(`\n📋 Memeriksa ${KNOWN_TABLES.length} tabel...\n`)

  const results = {}
  let existingCount = 0
  let missingCount = 0

  for (const table of KNOWN_TABLES) {
    process.stdout.write(`  🔍 ${table}... `)
    const info = await checkTable(table)
    results[table] = info

    if (info.exists) {
      console.log(`✅ (${info.columns.length} kolom)`)
      existingCount++
    } else {
      console.log(`❌ ${info.error || 'tidak ditemukan'}`)
      missingCount++
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log(`📊 HASIL ANALISIS`)
  console.log('='.repeat(70))
  console.log(`✅ Tabel yang ada: ${existingCount}`)
  console.log(`❌ Tabel yang hilang: ${missingCount}`)
  console.log('='.repeat(70))

  return results
}

function generateDetailedReport(results) {
  console.log('\n\n📄 LAPORAN DETAIL:\n')
  console.log('='.repeat(70))

  for (const [tableName, info] of Object.entries(results)) {
    console.log(`\n📋 ${tableName}`)
    console.log('-'.repeat(70))
    
    if (info.exists) {
      console.log(`  ✅ Status: Ada`)
      console.log(`  📊 Jumlah kolom: ${info.columns.length}`)
      console.log(`  📝 Kolom:`)
      info.columns.forEach(col => {
        const colInfo = info.columnInfo?.find(c => c.name === col)
        const type = colInfo?.type || 'unknown'
        console.log(`     - ${col} (${type})`)
      })
      
      if (info.sampleRow) {
        console.log(`  📦 Sample data: Ada`)
      }
    } else {
      console.log(`  ❌ Status: Tidak ada atau error`)
      console.log(`  ⚠️  Error: ${info.error}`)
    }
  }
}

function generateSQLFix(results) {
  console.log('\n\n🔧 GENERATING SQL FIX SCRIPT...\n')
  
  let sql = `-- ============================================\n`
  sql += `-- AUTO-GENERATED FIX SCRIPT\n`
  sql += `-- Generated: ${new Date().toISOString()}\n`
  sql += `-- Based on analysis of ${Object.keys(results).length} tables\n`
  sql += `-- ============================================\n\n`

  // Check forum_categories
  const forumCategories = results['forum_categories']
  if (forumCategories?.exists) {
    const hasSortOrder = forumCategories.columns.includes('sort_order')
    const hasOrderIndex = forumCategories.columns.includes('order_index')
    
    if (hasOrderIndex && !hasSortOrder) {
      sql += `-- Fix: Rename order_index to sort_order in forum_categories\n`
      sql += `ALTER TABLE forum_categories RENAME COLUMN order_index TO sort_order;\n\n`
    } else if (!hasSortOrder && !hasOrderIndex) {
      sql += `-- Fix: Add sort_order column to forum_categories\n`
      sql += `ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;\n\n`
    }
  }

  // Check activities
  const activities = results['activities']
  if (activities?.exists) {
    const requiredCols = ['action', 'target_id', 'description']
    const missingCols = requiredCols.filter(col => !activities.columns.includes(col))
    
    if (missingCols.length > 0) {
      sql += `-- Fix: Add missing columns to activities\n`
      if (missingCols.includes('action')) {
        sql += `ALTER TABLE activities ADD COLUMN IF NOT EXISTS action TEXT;\n`
      }
      if (missingCols.includes('target_id')) {
        sql += `ALTER TABLE activities ADD COLUMN IF NOT EXISTS target_id TEXT;\n`
      }
      if (missingCols.includes('description')) {
        sql += `ALTER TABLE activities ADD COLUMN IF NOT EXISTS description TEXT;\n`
      }
      sql += `\n`
    }
  }

  // RLS Policies
  sql += `-- ============================================\n`
  sql += `-- RLS POLICIES\n`
  sql += `-- ============================================\n\n`

  const tablesNeedingRLS = ['forum_categories', 'activities', 'forum_threads', 'forum_replies']
  for (const tableName of tablesNeedingRLS) {
    const table = results[tableName]
    if (table?.exists) {
      sql += `-- Enable RLS for ${tableName}\n`
      sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`
      sql += `-- Public read policy\n`
      sql += `DROP POLICY IF EXISTS "Public can view ${tableName}" ON ${tableName};\n`
      sql += `CREATE POLICY "Public can view ${tableName}" ON ${tableName} FOR SELECT USING (true);\n\n`
    }
  }

  const fs = await import('fs')
  const path = await import('path')
  const scriptPath = path.join(__dirname, '..', 'supabase', 'auto-fix-from-analysis.sql')
  fs.writeFileSync(scriptPath, sql)
  console.log(`✅ SQL script disimpan: ${scriptPath}`)
}

async function saveJSONReport(results) {
  const fs = await import('fs')
  const path = await import('path')
  
  const report = {
    timestamp: new Date().toISOString(),
    supabaseUrl: config.url.replace(/\/\/.*@/, '//***@'),
    totalTables: Object.keys(results).length,
    existingTables: Object.values(results).filter(r => r.exists).length,
    missingTables: Object.values(results).filter(r => !r.exists).length,
    tables: results
  }

  const reportPath = path.join(__dirname, '..', 'SUPABASE_ANALYSIS_REPORT.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`✅ JSON report disimpan: ${reportPath}`)
}

async function main() {
  try {
    const results = await analyzeAllTables()
    generateDetailedReport(results)
    await generateSQLFix(results)
    await saveJSONReport(results)
    
    console.log('\n\n✅ ANALISIS SELESAI!')
    console.log('='.repeat(70))
    console.log('\n📝 Langkah selanjutnya:')
    console.log('1. Baca SUPABASE_ANALYSIS_REPORT.json untuk detail lengkap')
    console.log('2. Jalankan supabase/auto-fix-from-analysis.sql di Supabase SQL Editor')
    console.log('3. Refresh aplikasi dan cek apakah error sudah hilang')
    console.log('\n')
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()

