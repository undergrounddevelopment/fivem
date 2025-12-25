#!/usr/bin/env tsx
/**
 * Verify Setup Script
 * Quick verification that all environment variables are configured correctly
 */

import * as fs from 'fs'
import * as path from 'path'

interface CheckResult {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
}

const results: CheckResult[] = []

function check(name: string, condition: boolean, okMessage: string, errorMessage: string) {
  results.push({
    name,
    status: condition ? 'ok' : 'error',
    message: condition ? okMessage : errorMessage,
  })
}

function checkWarning(name: string, condition: boolean, okMessage: string, warningMessage: string) {
  results.push({
    name,
    status: condition ? 'ok' : 'warning',
    message: condition ? okMessage : warningMessage,
  })
}

console.log('🔍 Verifying Setup...\n')

// Check .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExists = fs.existsSync(envPath)
check('.env.local file', envExists, 'File exists', 'File not found! Run setup first.')

// Check environment variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const optionalVars = ['POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING']

// Load .env.local if exists
if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach((line) => {
    const [key, value] = line.split('=')
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim()
    }
  })
}

// Check required variables
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  check(varName, !!value && value.length > 0, 'Configured', 'Missing or empty')
})

// Check optional variables
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  checkWarning(varName, !!value && value.length > 0, 'Configured', 'Not configured (optional)')
})

// Check Supabase URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (supabaseUrl) {
  const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')
  check('Supabase URL format', isValidUrl, 'Valid format', 'Invalid format')
}

// Check key formats
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (anonKey) {
  const isValidKey = anonKey.startsWith('eyJ') && anonKey.length > 100
  check('Anon Key format', isValidKey, 'Valid JWT format', 'Invalid format')
}

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (serviceKey) {
  const isValidKey = serviceKey.startsWith('eyJ') && serviceKey.length > 100
  check('Service Role Key format', isValidKey, 'Valid JWT format', 'Invalid format')
}

// Check critical files
const criticalFiles = [
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'lib/supabase/config.ts',
  'package.json',
  'next.config.mjs',
]

criticalFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  const exists = fs.existsSync(filePath)
  check(file, exists, 'Exists', 'Missing')
})

// Check .gitignore
const gitignorePath = path.join(process.cwd(), '.gitignore')
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
  const ignoresEnv = gitignoreContent.includes('.env')
  check('.gitignore protects .env', ignoresEnv, '.env* is ignored', '.env* not ignored - SECURITY RISK!')
}

// Print results
console.log('=' .repeat(70))
console.log('VERIFICATION RESULTS')
console.log('='.repeat(70))

let hasErrors = false
let hasWarnings = false

results.forEach((result) => {
  let icon = '✅'
  let color = '\x1b[32m' // Green

  if (result.status === 'error') {
    icon = '❌'
    color = '\x1b[31m' // Red
    hasErrors = true
  } else if (result.status === 'warning') {
    icon = '⚠️ '
    color = '\x1b[33m' // Yellow
    hasWarnings = true
  }

  console.log(`${icon} ${color}${result.name}\x1b[0m`)
  console.log(`   ${result.message}`)
})

console.log('\n' + '='.repeat(70))

// Summary
const okCount = results.filter((r) => r.status === 'ok').length
const warningCount = results.filter((r) => r.status === 'warning').length
const errorCount = results.filter((r) => r.status === 'error').length

console.log('\n📊 SUMMARY:')
console.log(`   ✅ OK: ${okCount}`)
console.log(`   ⚠️  Warnings: ${warningCount}`)
console.log(`   ❌ Errors: ${errorCount}`)

if (hasErrors) {
  console.log('\n❌ Setup has errors! Please fix them before continuing.')
  console.log('💡 Check QUICK_START.md for setup instructions.')
  process.exit(1)
} else if (hasWarnings) {
  console.log('\n⚠️  Setup has warnings but should work.')
  console.log('💡 Consider configuring optional variables for full functionality.')
  process.exit(0)
} else {
  console.log('\n✅ All checks passed! Setup is complete.')
  console.log('💡 You can now run: npm run dev')
  process.exit(0)
}
