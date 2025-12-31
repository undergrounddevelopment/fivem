const fs = require('fs')
const path = require('path')

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
]

const optionalVars = [
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'LINKVERTISE_AUTH_TOKEN',
  'LINKVERTISE_USER_ID',
]

console.log('🔍 Validating environment variables...\n')

// Read .env file
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found! Ensure you have configured DATABASE_URL or POSTGRES_URL alongside other required keys.')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

let hasErrors = false
let hasWarnings = false

// Check required variables
console.log('📋 Required Variables:')
requiredVars.forEach(varName => {
  const value = envVars[varName]
  if (!value || value === 'your_' || value.includes('YOUR_')) {
    console.log(`  ❌ ${varName}: Missing or placeholder`)
    hasErrors = true
  } else {
    console.log(`  ✅ ${varName}: Configured`)
  }
})

console.log('\n📋 Optional Variables:')
optionalVars.forEach(varName => {
  const value = envVars[varName]
  if (!value || value === 'your_' || value.includes('YOUR_')) {
    console.log(`  ⚠️  ${varName}: Not configured (optional)`)
    hasWarnings = true
  } else {
    console.log(`  ✅ ${varName}: Configured`)
  }
})

console.log('\n' + '='.repeat(50))

if (hasErrors) {
  console.log('❌ Validation failed! Please configure required variables.')
  process.exit(1)
} else if (hasWarnings) {
  console.log('⚠️  Validation passed with warnings.')
  console.log('   Some optional features may not work.')
  process.exit(0)
} else {
  console.log('✅ All environment variables configured!')
  process.exit(0)
}
