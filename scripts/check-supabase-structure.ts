/**
 * CHECK SUPABASE STRUCTURE - TypeScript Version
 * Analisis struktur database Supabase dan bandingkan dengan kode
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: Environment variables tidak lengkap!')
  console.error('Diperlukan: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_URL')
  console.error('Diperlukan: SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TableInfo {
  name: string
  exists: boolean
  columns: string[]
  rlsEnabled: boolean
  sampleRow?: any
  error?: string
}

const KNOWN_TABLES = [
  'users',
  'assets',
  'forum_categories',
  'forum_threads',
  'forum_replies',
  'activities',
  'downloads',
  'notifications',
  'coin_transactions',
  'spin_wheel_prizes',
  'spin_wheel_history',
  'spin_wheel_tickets',
  'announcements',
  'banners',
  'testimonials',
  'messages',
  'reports',
  'likes',
  'daily_rewards',
  'admin_actions',
  'security_events',
  'firewall_rules'
]

async function checkTable(tableName: string): Promise<TableInfo> {
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      return {
        name: tableName,
        exists: false,
        columns: [],
        rlsEnabled: error.code === 'PGRST301' || error.message?.includes('policy'),
        error: error.message
      }
    }

    const columns = data && data.length > 0 ? Object.keys(data[0]) : []
    
    return {
      name: tableName,
      exists: true,
      columns,
      rlsEnabled: false, // Will check separately
      sampleRow: data?.[0]
    }
  } catch (e: any) {
    return {
      name: tableName,
      exists: false,
      columns: [],
      rlsEnabled: false,
      error: e.message
    }
  }
}

async function checkAllTables() {
  console.log('🔍 Menganalisis struktur database Supabase...\n')
  console.log('='.repeat(70))

  const results: TableInfo[] = []

  for (const table of KNOWN_TABLES) {
    console.log(`\n📋 Memeriksa: ${table}`)
    const info = await checkTable(table)
    results.push(info)

    if (info.exists) {
      console.log(`  ✅ Tabel ada`)
      console.log(`  📊 Kolom (${info.columns.length}): ${info.columns.slice(0, 5).join(', ')}${info.columns.length > 5 ? '...' : ''}`)
      if (info.error) {
        console.log(`  ⚠️  Warning: ${info.error}`)
      }
    } else {
      console.log(`  ❌ Tabel tidak ada atau tidak dapat diakses`)
      if (info.error) {
        console.log(`  📝 Error: ${info.error}`)
      }
    }
  }

  return results
}

async function generateReport(results: TableInfo[]) {
  const report = {
    timestamp: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL.replace(/\/\/.*@/, '//***@'), // Hide credentials
    totalTablesChecked: results.length,
    existingTables: results.filter(r => r.exists).length,
    missingTables: results.filter(r => !r.exists).length,
    tables: results.reduce((acc, table) => {
      acc[table.name] = {
        exists: table.exists,
        columns: table.columns,
        rlsEnabled: table.rlsEnabled,
        error: table.error
      }
      return acc
    }, {} as Record<string, any>)
  }

  const reportPath = path.join(process.cwd(), 'SUPABASE_STRUCTURE_REPORT.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n\n✅ Laporan disimpan: ${reportPath}`)

  return report
}

async function generateFixSQL(results: TableInfo[]) {
  console.log('\n🔧 Membuat script SQL perbaikan...\n')

  let sql = `-- ============================================\n`
  sql += `-- AUTO-GENERATED FIX SCRIPT\n`
  sql += `-- Generated: ${new Date().toISOString()}\n`
  sql += `-- ============================================\n\n`

  // Check forum_categories
  const forumCategories = results.find(r => r.name === 'forum_categories')
  if (forumCategories?.exists) {
    const hasSortOrder = forumCategories.columns.includes('sort_order')
    const hasOrderIndex = forumCategories.columns.includes('order_index')
    
    if (hasOrderIndex && !hasSortOrder) {
      sql += `-- Fix forum_categories: Rename order_index to sort_order\n`
      sql += `ALTER TABLE forum_categories RENAME COLUMN order_index TO sort_order;\n\n`
    }
    if (!hasSortOrder && !hasOrderIndex) {
      sql += `-- Fix forum_categories: Add sort_order column\n`
      sql += `ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;\n\n`
    }
  }

  // Check activities
  const activities = results.find(r => r.name === 'activities')
  if (activities?.exists) {
    const requiredColumns = ['id', 'user_id', 'type', 'description', 'action', 'target_id', 'metadata', 'created_at']
    const missingColumns = requiredColumns.filter(col => !activities.columns.includes(col))
    
    if (missingColumns.length > 0) {
      sql += `-- Fix activities: Add missing columns\n`
      if (missingColumns.includes('action')) {
        sql += `ALTER TABLE activities ADD COLUMN IF NOT EXISTS action TEXT;\n`
      }
      if (missingColumns.includes('target_id')) {
        sql += `ALTER TABLE activities ADD COLUMN IF NOT EXISTS target_id TEXT;\n`
      }
      if (missingColumns.includes('description') && !activities.columns.includes('description')) {
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
    const table = results.find(r => r.name === tableName)
    if (table?.exists) {
      sql += `-- Enable RLS for ${tableName}\n`
      sql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`
      sql += `-- Public read policy for ${tableName}\n`
      sql += `DROP POLICY IF EXISTS "Public can view ${tableName}" ON ${tableName};\n`
      sql += `CREATE POLICY "Public can view ${tableName}" ON ${tableName} FOR SELECT USING (true);\n\n`
    }
  }

  const sqlPath = path.join(process.cwd(), 'supabase', 'auto-fix-structure.sql')
  fs.writeFileSync(sqlPath, sql)
  console.log(`✅ Script SQL disimpan: ${sqlPath}`)
}

async function main() {
  try {
    const results = await checkAllTables()
    const report = await generateReport(results)
    await generateFixSQL(results)

    console.log('\n' + '='.repeat(70))
    console.log('✅ ANALISIS SELESAI!')
    console.log(`📊 Total tabel: ${report.totalTablesChecked}`)
    console.log(`✅ Tabel yang ada: ${report.existingTables}`)
    console.log(`❌ Tabel yang hilang: ${report.missingTables}`)
    console.log('='.repeat(70))
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message)
    process.exit(1)
  }
}

main()

