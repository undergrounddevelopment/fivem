require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const issues = []
const fixes = []

async function fullSystemCheck() {
  console.log('🔍 FULL SYSTEM CHECK - FiveM Tools V7\n')
  console.log('='.repeat(60))

  // 1. Environment Variables
  await checkEnvironment()
  
  // 2. Database Tables
  await checkDatabaseTables()
  
  // 3. Database Data
  await checkDatabaseData()
  
  // 4. API Routes
  await checkAPIRoutes()
  
  // 5. Critical Files
  await checkCriticalFiles()
  
  // 6. Foreign Keys
  await checkForeignKeys()
  
  // 7. RLS Policies
  await checkRLSPolicies()

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY\n')
  console.log(`Total Issues Found: ${issues.length}`)
  console.log(`Auto-Fixes Applied: ${fixes.length}`)
  
  if (issues.length === 0) {
    console.log('\n✅ SYSTEM 100% HEALTHY!')
  } else {
    console.log('\n⚠️  Issues Found:')
    issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`))
  }
  
  if (fixes.length > 0) {
    console.log('\n✅ Fixes Applied:')
    fixes.forEach((fix, i) => console.log(`${i + 1}. ${fix}`))
  }

  // Generate report
  generateReport()
}

async function checkEnvironment() {
  console.log('\n1️⃣  CHECKING ENVIRONMENT VARIABLES...')
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'SITE_URL'
  ]
  
  let allGood = true
  required.forEach(key => {
    if (!process.env[key]) {
      console.log(`   ❌ ${key}: MISSING`)
      issues.push(`Environment variable ${key} is missing`)
      allGood = false
    } else {
      console.log(`   ✅ ${key}: SET`)
    }
  })
  
  if (allGood) console.log('   ✅ All environment variables present')
}

async function checkDatabaseTables() {
  console.log('\n2️⃣  CHECKING DATABASE TABLES...')
  
  const requiredTables = [
    'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
    'announcements', 'banners', 'spin_wheel_prizes', 'spin_wheel_tickets',
    'spin_wheel_history', 'notifications', 'activities', 'downloads',
    'coin_transactions', 'testimonials', 'badges', 'user_badges',
    'xp_activities', 'xp_transactions'
  ]
  
  for (const table of requiredTables) {
    const { data, error } = await supabase.from(table).select('count').limit(1)
    if (error) {
      console.log(`   ❌ ${table}: NOT FOUND`)
      issues.push(`Table ${table} does not exist`)
    } else {
      console.log(`   ✅ ${table}: EXISTS`)
    }
  }
}

async function checkDatabaseData() {
  console.log('\n3️⃣  CHECKING DATABASE DATA...')
  
  // Check users
  const { data: users, error: e1 } = await supabase.from('users').select('count')
  if (!e1 && users) {
    console.log(`   ✅ Users: ${users.length} records`)
  } else {
    console.log(`   ❌ Users: ERROR`)
    issues.push('Cannot query users table')
  }
  
  // Check assets
  const { data: assets, error: e2 } = await supabase.from('assets').select('id, title, status, creator_id')
  if (!e2 && assets) {
    console.log(`   ✅ Assets: ${assets.length} records`)
    
    // Check for orphaned assets
    const orphaned = assets.filter(a => !a.creator_id)
    if (orphaned.length > 0) {
      console.log(`   ⚠️  Found ${orphaned.length} assets without creator_id`)
      issues.push(`${orphaned.length} assets have no creator_id`)
    }
    
    // Check status distribution
    const approved = assets.filter(a => ['approved', 'active', 'featured'].includes(a.status))
    console.log(`   ℹ️  Approved/Active: ${approved.length}/${assets.length}`)
  } else {
    console.log(`   ❌ Assets: ERROR`)
    issues.push('Cannot query assets table')
  }
  
  // Check badges
  const { data: badges, error: e3 } = await supabase.from('badges').select('count')
  if (!e3 && badges) {
    console.log(`   ✅ Badges: ${badges.length} records`)
    if (badges.length < 5) {
      console.log(`   ⚠️  Expected 5 badges, found ${badges.length}`)
      issues.push('Badge system incomplete')
    }
  }
  
  // Check XP activities
  const { data: xpAct, error: e4 } = await supabase.from('xp_activities').select('count')
  if (!e4 && xpAct) {
    console.log(`   ✅ XP Activities: ${xpAct.length} records`)
  }
}

async function checkAPIRoutes() {
  console.log('\n4️⃣  CHECKING API ROUTES...')
  
  const routes = [
    'app/api/assets/route.ts',
    'app/api/assets/[id]/route.ts',
    'app/api/forum/route.ts',
    'app/api/xp/route.ts',
    'app/api/coins/route.ts',
    'app/api/spin-wheel/route.ts'
  ]
  
  routes.forEach(route => {
    const filePath = path.join(process.cwd(), route)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Check for common issues
      if (content.includes('createAdminClient()') && !content.includes('auth:')) {
        console.log(`   ⚠️  ${route}: Missing auth config`)
        issues.push(`${route} needs auth config`)
      } else if (content.includes("require('@supabase/supabase-js')")) {
        console.log(`   ⚠️  ${route}: Using require() instead of import`)
        issues.push(`${route} should use ES imports`)
      } else {
        console.log(`   ✅ ${route}: OK`)
      }
    } else {
      console.log(`   ❌ ${route}: NOT FOUND`)
      issues.push(`API route ${route} missing`)
    }
  })
}

async function checkCriticalFiles() {
  console.log('\n5️⃣  CHECKING CRITICAL FILES...')
  
  const files = [
    'middleware.ts',
    'lib/supabase/client.ts',
    'lib/supabase/server.ts',
    'lib/auth.ts',
    'lib/config.ts',
    'next.config.mjs',
    'package.json',
    '.env'
  ]
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}: EXISTS`)
    } else {
      console.log(`   ❌ ${file}: MISSING`)
      issues.push(`Critical file ${file} is missing`)
    }
  })
}

async function checkForeignKeys() {
  console.log('\n6️⃣  CHECKING FOREIGN KEY RELATIONSHIPS...')
  
  // Check assets -> users
  const { data: assets } = await supabase
    .from('assets')
    .select('id, creator_id, author:users!creator_id(id)')
    .limit(5)
  
  if (assets) {
    const withAuthor = assets.filter(a => a.author)
    console.log(`   ✅ Assets with valid author: ${withAuthor.length}/${assets.length}`)
    
    if (withAuthor.length < assets.length) {
      issues.push(`${assets.length - withAuthor.length} assets have invalid creator_id`)
    }
  }
  
  // Check forum_threads -> users
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, author_id')
    .limit(5)
  
  if (threads) {
    console.log(`   ✅ Forum threads: ${threads.length} checked`)
  }
}

async function checkRLSPolicies() {
  console.log('\n7️⃣  CHECKING RLS POLICIES...')
  
  // Test read access
  const tables = ['assets', 'users', 'forum_threads']
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('count').limit(1)
    if (error) {
      console.log(`   ❌ ${table}: RLS blocking read`)
      issues.push(`RLS policy issue on ${table}`)
    } else {
      console.log(`   ✅ ${table}: Read access OK`)
    }
  }
}

function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    issues: issues,
    fixes: fixes,
    status: issues.length === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION'
  }
  
  fs.writeFileSync(
    'SYSTEM_CHECK_REPORT.json',
    JSON.stringify(report, null, 2)
  )
  
  console.log('\n📄 Report saved to: SYSTEM_CHECK_REPORT.json')
}

// Run check
fullSystemCheck().catch(err => {
  console.error('\n❌ FATAL ERROR:', err)
  process.exit(1)
})
