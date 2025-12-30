const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')

const filesToCheck = [
  'lib/actions/general.ts',
  'lib/database-direct.ts',
  'lib/db.ts',
  'lib/supabase/server.ts',
  'lib/supabase/client.ts',
  'app/api/stats/route.ts',
  'app/api/activity/route.ts',
  'app/api/users/online/route.ts',
  'components/trending-section.tsx',
  'components/recent-assets.tsx',
  'components/activity-feed.tsx'
]

console.log('🔍 Analyzing Supabase Connections...\n')

const issues = []
const correct = []

filesToCheck.forEach(file => {
  const fullPath = path.join(rootDir, file)
  
  if (!fs.existsSync(fullPath)) {
    issues.push(`❌ ${file} - FILE NOT FOUND`)
    return
  }
  
  const content = fs.readFileSync(fullPath, 'utf8')
  
  // Check for correct imports
  const hasSupabaseImport = content.includes('getSupabaseAdminClient') || 
                           content.includes('createClient') ||
                           content.includes('createAdminClient')
  
  const hasDbQuery = content.includes('db.query')
  const hasDirectSQL = content.includes('sql`')
  const hasAPIFetch = content.includes('fetch(') && content.includes('/api/')
  const hasServerAction = content.includes("import('@/lib/actions/") || content.includes('from "@/lib/actions/')
  
  if (hasDbQuery) {
    issues.push(`❌ ${file} - Uses db.query (should use Supabase)`)
  } else if (hasDirectSQL && !file.includes('queries.ts')) {
    issues.push(`⚠️  ${file} - Uses direct SQL`)
  } else if (hasSupabaseImport) {
    correct.push(`✅ ${file} - Correctly uses Supabase`)
  } else if ((hasAPIFetch || hasServerAction) && file.includes('components/')) {
    correct.push(`✅ ${file} - Uses server actions/API (correct for client)`)
  } else {
    issues.push(`⚠️  ${file} - No Supabase connection found`)
  }
})

console.log('✅ Correct Connections:')
correct.forEach(c => console.log(`  ${c}`))

console.log('\n❌ Issues Found:')
if (issues.length === 0) {
  console.log('  None! All connections are correct.')
} else {
  issues.forEach(i => console.log(`  ${i}`))
}

console.log('\n' + '='.repeat(50))
console.log(`Total Files: ${filesToCheck.length}`)
console.log(`Correct: ${correct.length}`)
console.log(`Issues: ${issues.length}`)
console.log(`Status: ${issues.length === 0 ? '✅ ALL GOOD' : '⚠️  NEEDS FIXING'}`)

process.exit(issues.length > 0 ? 1 : 0)
