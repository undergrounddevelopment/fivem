const fs = require('fs')
const path = require('path')
require('dotenv').config()

console.log('🔍 Validating FiveM Tools V7 System...\n')

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'SITE_URL'
]

let envValid = true
console.log('📋 Environment Variables:')
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar]
  const status = value ? '✅' : '❌'
  console.log(`  ${status} ${envVar}: ${value ? 'Set' : 'Missing'}`)
  if (!value) envValid = false
})

// Check critical files
const criticalFiles = [
  'next.config.mjs',
  'middleware.ts',
  'app/layout.tsx',
  'lib/supabase/server.ts',
  'lib/supabase/client.ts',
  'components/analytics-wrapper.tsx'
]

console.log('\n📁 Critical Files:')
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file))
  const status = exists ? '✅' : '❌'
  console.log(`  ${status} ${file}`)
})

// Check package.json scripts
console.log('\n📦 Package Scripts:')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const requiredScripts = ['dev', 'build', 'start', 'validate:env', 'db:check']
requiredScripts.forEach(script => {
  const exists = packageJson.scripts[script]
  const status = exists ? '✅' : '❌'
  console.log(`  ${status} ${script}`)
})

console.log('\n🔧 System Status:')
console.log(`  Environment: ${envValid ? '✅ Valid' : '❌ Invalid'}`)
console.log(`  Node Version: ${process.version}`)
console.log(`  Platform: ${process.platform}`)

if (envValid) {
  console.log('\n🎉 System validation passed! Ready to start.')
} else {
  console.log('\n⚠️  System validation failed. Please check missing environment variables.')
  process.exit(1)
}