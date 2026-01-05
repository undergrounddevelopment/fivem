// Quick Fix API - Automated Fixes
// Run: node quick-fix-api.js

const fs = require('fs')
const path = require('path')

console.log('🔧 Quick Fix API - Starting...\n')

// 1. Create lib/supabase/helpers.ts
console.log('1️⃣ Creating lib/supabase/helpers.ts...')
const helpersContent = `import { createClient } from '@supabase/supabase-js'

/**
 * Create admin Supabase client for API routes
 * Consistent method across all endpoints
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
`

try {
  fs.writeFileSync(path.join(__dirname, 'lib', 'supabase', 'helpers.ts'), helpersContent)
  console.log('   ✅ Created lib/supabase/helpers.ts\n')
} catch (error) {
  console.error('   ❌ Failed to create helpers.ts:', error.message, '\n')
}

// 2. Update app/api/download/[id]/route.ts
console.log('2️⃣ Updating app/api/download/[id]/route.ts...')
try {
  const downloadPath = path.join(__dirname, 'app', 'api', 'download', '[id]', 'route.ts')
  let downloadContent = fs.readFileSync(downloadPath, 'utf8')
  
  // Add import if not exists
  if (!downloadContent.includes('xpQueries')) {
    downloadContent = downloadContent.replace(
      "import { createClient } from '@supabase/supabase-js'",
      "import { createClient } from '@supabase/supabase-js'\nimport { xpQueries } from '@/lib/xp/queries'"
    )
  }
  
  // Add XP award after activity insert
  if (!downloadContent.includes('xpQueries.awardXP')) {
    downloadContent = downloadContent.replace(
      /await supabase\s+\.from\('activities'\)\s+\.insert\({[\s\S]*?}\)\s+\.catch\(\(\) => {}\)/,
      `await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        type: 'download',
        description: \`Downloaded \${asset.title}\`,
        asset_id: asset.id
      })
      .catch(() => {})

    // Award XP for download
    await xpQueries.awardXP(session.user.id, 'download_asset', asset.id)
      .catch((error) => {
        console.warn('[API Download] XP award failed:', error)
      })`
    )
  }
  
  fs.writeFileSync(downloadPath, downloadContent)
  console.log('   ✅ Updated download API with XP award\n')
} catch (error) {
  console.error('   ❌ Failed to update download API:', error.message, '\n')
}

// 3. Update app/api/stats/route.ts
console.log('3️⃣ Updating app/api/stats/route.ts...')
try {
  const statsPath = path.join(__dirname, 'app', 'api', 'stats', 'route.ts')
  let statsContent = fs.readFileSync(statsPath, 'utf8')
  
  // Add error logging
  if (!statsContent.includes('queryNames')) {
    statsContent = statsContent.replace(
      /const \[\s*usersResult,/,
      `// Log errors for debugging
    const queryNames = ['users', 'assets', 'threads', 'replies', 'downloads', 'online']
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(\`[Stats API] \${queryNames[index]} query failed:\`, result.reason)
      }
    })

    const [usersResult,`
    )
  }
  
  // Add success logging
  if (!statsContent.includes('Stats fetched')) {
    statsContent = statsContent.replace(
      /return NextResponse\.json\({\s*success: true,\s*data: stats\s*}\)/,
      `// Log success stats
    console.log('[Stats API] ✅ Stats fetched:', stats)

    return NextResponse.json({
      success: true,
      data: stats
    })`
    )
  }
  
  fs.writeFileSync(statsPath, statsContent)
  console.log('   ✅ Updated stats API with better logging\n')
} catch (error) {
  console.error('   ❌ Failed to update stats API:', error.message, '\n')
}

// 4. Update lib/fivem-api.ts
console.log('4️⃣ Updating lib/fivem-api.ts...')
try {
  const fivemApiPath = path.join(__dirname, 'lib', 'fivem-api.ts')
  let fivemApiContent = fs.readFileSync(fivemApiPath, 'utf8')
  
  // Replace hardcoded URL
  if (fivemApiContent.includes('const API_BASE = "https://www.fivemtools.net/api"')) {
    fivemApiContent = fivemApiContent.replace(
      'const API_BASE = "https://www.fivemtools.net/api"',
      `import { CONFIG } from '@/lib/config'\n\nconst API_BASE = \`\${CONFIG.site.url}/api\``
    )
    
    fs.writeFileSync(fivemApiPath, fivemApiContent)
    console.log('   ✅ Updated fivem-api.ts with dynamic URL\n')
  } else {
    console.log('   ℹ️  fivem-api.ts already updated or different format\n')
  }
} catch (error) {
  console.error('   ❌ Failed to update fivem-api.ts:', error.message, '\n')
}

console.log('✅ Quick Fix API - Complete!\n')
console.log('📋 Next Steps:')
console.log('   1. Review changes: git diff')
console.log('   2. Test build: pnpm build')
console.log('   3. Test dev: pnpm dev')
console.log('   4. Commit: git add . && git commit -m "fix: API improvements"')
console.log('')
