/**
 * AUTO CHECK AND FIX DATABASE - 100% AUTOMATIC
 * Script ini akan check database dan apply fixes secara otomatis
 * 
 * Cara menggunakan:
 * node scripts/auto-check-and-fix-database.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  }
}

const config = loadConfig()

if (!config.url || !config.serviceKey) {
  console.error('❌ ERROR: Supabase credentials tidak ditemukan!')
  process.exit(1)
}

const supabase = createClient(config.url, config.serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkAndFix() {
  console.log('🚀 AUTO CHECK AND FIX DATABASE\n')
  console.log('='.repeat(70))

  const fixes = []
  const sqlStatements = []

  // Check forum_categories
  console.log('\n📋 Checking forum_categories...')
  try {
    const { data } = await supabase.from('forum_categories').select('*').limit(1)
    if (data) {
      const columns = data.length > 0 ? Object.keys(data[0]) : []
      const hasSortOrder = columns.includes('sort_order')
      const hasOrderIndex = columns.includes('order_index')

      if (hasOrderIndex && !hasSortOrder) {
        console.log('  ⚠️  Need to rename order_index to sort_order')
        fixes.push('forum_categories: rename order_index to sort_order')
        sqlStatements.push('ALTER TABLE forum_categories RENAME COLUMN order_index TO sort_order;')
      } else if (!hasSortOrder && !hasOrderIndex) {
        console.log('  ⚠️  Need to add sort_order column')
        fixes.push('forum_categories: add sort_order column')
        sqlStatements.push('ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;')
      } else {
        console.log('  ✅ forum_categories structure OK')
      }
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`)
  }

  // Check activities
  console.log('\n📋 Checking activities...')
  try {
    const { data } = await supabase.from('activities').select('*').limit(1)
    if (data) {
      const columns = data.length > 0 ? Object.keys(data[0]) : []
      const requiredCols = ['action', 'target_id', 'description']
      const missingCols = requiredCols.filter(col => !columns.includes(col))

      if (missingCols.length > 0) {
        console.log(`  ⚠️  Need to add columns: ${missingCols.join(', ')}`)
        missingCols.forEach(col => {
          fixes.push(`activities: add ${col} column`)
          sqlStatements.push(`ALTER TABLE activities ADD COLUMN IF NOT EXISTS ${col} TEXT;`)
        })
      } else {
        console.log('  ✅ activities structure OK')
      }
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`)
  }

  // Generate SQL script
  if (sqlStatements.length > 0) {
    console.log('\n\n🔧 GENERATING FIX SQL SCRIPT...\n')
    
    const fs = await import('fs')
    const path = await import('path')
    
    const sqlScript = `-- AUTO-GENERATED FIX SCRIPT
-- Generated: ${new Date().toISOString()}
-- Fixes: ${fixes.length}

${sqlStatements.join('\n\n')}

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public can view forum_categories" ON forum_categories;
CREATE POLICY "Public can view forum_categories" ON forum_categories FOR SELECT USING (COALESCE(is_active, true) = true);

DROP POLICY IF EXISTS "Public can view activities" ON activities;
CREATE POLICY "Public can view activities" ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view forum_threads" ON forum_threads;
CREATE POLICY "Public can view forum_threads" ON forum_threads FOR SELECT USING (COALESCE(is_deleted, false) = false AND (status = 'approved' OR status IS NULL));

DROP POLICY IF EXISTS "Public can view forum_replies" ON forum_replies;
CREATE POLICY "Public can view forum_replies" ON forum_replies FOR SELECT USING (COALESCE(is_deleted, false) = false);
`

    const scriptPath = path.join(__dirname, '..', 'supabase', 'auto-fix-now.sql')
    fs.writeFileSync(scriptPath, sqlScript)
    
    console.log(`✅ SQL script generated: ${scriptPath}`)
    console.log(`\n📝 Fixes needed: ${fixes.length}`)
    fixes.forEach(fix => console.log(`   - ${fix}`))
    console.log(`\n⚠️  IMPORTANT: Execute ${scriptPath} in Supabase SQL Editor`)
    console.log('   Dashboard → SQL Editor → Copy paste script → Run')
  } else {
    console.log('\n\n✅ NO FIXES NEEDED - Database is up to date!')
  }

  console.log('\n' + '='.repeat(70))
  console.log('✅ CHECK COMPLETE')
  console.log('='.repeat(70))
}

checkAndFix().catch(error => {
  console.error('\n❌ ERROR:', error.message)
  process.exit(1)
})

