const fs = require('fs')
const path = require('path')

console.log('🔍 CHECKING ALL FEATURES\n')
console.log('='.repeat(60))

const features = {
  'Authentication': [
    'app/api/auth/[...nextauth]/route.ts',
    'components/auth-provider.tsx',
    'lib/auth.ts'
  ],
  'Forum': [
    'app/forum/page.tsx',
    'app/api/forum/threads/route.ts',
    'lib/database-direct.ts'
  ],
  'Assets': [
    'app/assets/page.tsx',
    'app/api/assets/route.ts',
    'components/asset-card.tsx'
  ],
  'Coins': [
    'app/api/coins/route.ts',
    'app/api/coins/daily/route.ts'
  ],
  'Spin Wheel': [
    'app/spin-wheel/page.tsx',
    'app/api/spin-wheel/route.ts'
  ],
  'Admin': [
    'app/admin/page.tsx',
    'app/api/admin/users/route.ts'
  ],
  'Linkvertise': [
    'app/api/linkvertise/verify/route.ts',
    'lib/linkvertise-service.ts'
  ],
  'Online Users': [
    'app/api/users/online/route.ts',
    'components/online-users.tsx'
  ]
}

const results = {}
let totalFiles = 0
let existingFiles = 0
let missingFiles = 0

Object.entries(features).forEach(([feature, files]) => {
  console.log(`\n📦 ${feature}:`)
  results[feature] = { exists: [], missing: [] }
  
  files.forEach(file => {
    totalFiles++
    const fullPath = path.join(__dirname, '..', file)
    
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${file}`)
      results[feature].exists.push(file)
      existingFiles++
    } else {
      console.log(`  ❌ ${file} - MISSING`)
      results[feature].missing.push(file)
      missingFiles++
    }
  })
})

console.log('\n' + '='.repeat(60))
console.log('\n📊 SUMMARY\n')

Object.entries(results).forEach(([feature, status]) => {
  const total = status.exists.length + status.missing.length
  const percentage = Math.round((status.exists.length / total) * 100)
  const icon = percentage === 100 ? '✅' : '⚠️'
  
  console.log(`${icon} ${feature}: ${status.exists.length}/${total} (${percentage}%)`)
})

console.log('\n' + '='.repeat(60))
console.log(`\nTOTAL: ${existingFiles}/${totalFiles} files exist (${Math.round((existingFiles/totalFiles)*100)}%)`)

if (missingFiles === 0) {
  console.log('\n✅ ALL FEATURES COMPLETE - NO MISSING FILES')
  process.exit(0)
} else {
  console.log(`\n⚠️  ${missingFiles} files missing`)
  process.exit(1)
}
