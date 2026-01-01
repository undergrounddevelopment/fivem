import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface UserData {
  id: string
  discord_id: string
  username: string
  email: string | null
  avatar: string | null
  membership: string
  coins: number
  reputation: number
  downloads: number
  points: number
  is_banned: boolean
  ban_reason: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
  last_seen: string
  spin_tickets: number
  role: string
  is_active: boolean
  xp: number
  level: number
  bio: string | null
}

// Parse SQL INSERT statement
function parseSQLInsert(sql: string): UserData[] {
  const users: UserData[] = []
  const insertPattern = /INSERT INTO users \([^)]+\) VALUES \(([^;]+)\);/g
  let match

  while ((match = insertPattern.exec(sql)) !== null) {
    const values = match[1]
    const parsed = parseValues(values)
    if (parsed) users.push(parsed)
  }

  return users
}

function parseValues(valueString: string): UserData | null {
  try {
    // Split by comma but respect quotes
    const values: string[] = []
    let current = ''
    let inQuote = false
    
    for (let i = 0; i < valueString.length; i++) {
      const char = valueString[i]
      
      if (char === "'" && valueString[i - 1] !== '\\') {
        inQuote = !inQuote
        current += char
      } else if (char === ',' && !inQuote) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    // Clean values
    const cleanValue = (v: string) => {
      v = v.trim()
      if (v === 'NULL') return null
      if (v.startsWith("'") && v.endsWith("'")) {
        return v.slice(1, -1).replace(/\\'/g, "'")
      }
      if (v === 'true') return true
      if (v === 'false') return false
      return v
    }

    return {
      id: cleanValue(values[0]) as string,
      discord_id: cleanValue(values[1]) as string,
      username: cleanValue(values[2]) as string,
      email: cleanValue(values[3]) as string | null,
      avatar: cleanValue(values[4]) as string | null,
      membership: cleanValue(values[5]) as string,
      coins: parseInt(cleanValue(values[6]) as string),
      reputation: parseInt(cleanValue(values[7]) as string),
      downloads: parseInt(cleanValue(values[8]) as string),
      points: parseInt(cleanValue(values[9]) as string),
      is_banned: cleanValue(values[10]) as boolean,
      ban_reason: cleanValue(values[11]) as string | null,
      is_admin: cleanValue(values[12]) as boolean,
      created_at: cleanValue(values[13]) as string,
      updated_at: cleanValue(values[14]) as string,
      last_seen: cleanValue(values[15]) as string,
      spin_tickets: parseInt(cleanValue(values[16]) as string),
      role: cleanValue(values[17]) as string,
      is_active: cleanValue(values[18]) as boolean,
      xp: parseInt(cleanValue(values[19]) as string),
      level: parseInt(cleanValue(values[20]) as string),
      bio: cleanValue(values[21]) as string | null,
    }
  } catch (error) {
    console.error('Parse error:', error)
    return null
  }
}

// Analyze user data
function analyzeUsers(users: UserData[]) {
  console.log('\n📊 ANALISIS DATA USER\n')
  console.log(`Total Users: ${users.length}`)
  
  // Membership distribution
  const membershipCount = users.reduce((acc, u) => {
    acc[u.membership] = (acc[u.membership] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('\n🎫 Membership:')
  Object.entries(membershipCount).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`)
  })

  // Admin count
  const admins = users.filter(u => u.is_admin).length
  console.log(`\n👑 Admins: ${admins}`)

  // Banned users
  const banned = users.filter(u => u.is_banned).length
  console.log(`🚫 Banned: ${banned}`)

  // Active users
  const active = users.filter(u => u.is_active).length
  console.log(`✅ Active: ${active}`)

  // Coins statistics
  const totalCoins = users.reduce((sum, u) => sum + u.coins, 0)
  const avgCoins = Math.round(totalCoins / users.length)
  const maxCoins = Math.max(...users.map(u => u.coins))
  console.log(`\n💰 Coins:`)
  console.log(`  Total: ${totalCoins.toLocaleString()}`)
  console.log(`  Average: ${avgCoins}`)
  console.log(`  Max: ${maxCoins}`)

  // Downloads statistics
  const totalDownloads = users.reduce((sum, u) => sum + u.downloads, 0)
  const usersWithDownloads = users.filter(u => u.downloads > 0).length
  console.log(`\n📥 Downloads:`)
  console.log(`  Total: ${totalDownloads}`)
  console.log(`  Users with downloads: ${usersWithDownloads}`)

  // Top users by coins
  const topCoins = users.sort((a, b) => b.coins - a.coins).slice(0, 5)
  console.log(`\n🏆 Top 5 by Coins:`)
  topCoins.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.username}: ${u.coins} coins`)
  })

  // Top users by downloads
  const topDownloads = users.sort((a, b) => b.downloads - a.downloads).slice(0, 5)
  console.log(`\n📊 Top 5 by Downloads:`)
  topDownloads.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.username}: ${u.downloads} downloads`)
  })

  // Registration timeline
  const byMonth = users.reduce((acc, u) => {
    const month = u.created_at.substring(0, 7)
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log(`\n📅 Registrations by Month:`)
  Object.entries(byMonth).sort().forEach(([month, count]) => {
    console.log(`  ${month}: ${count}`)
  })
}

// Push to Supabase in batches
async function pushToSupabase(users: UserData[]) {
  console.log('\n🚀 PUSHING TO SUPABASE...\n')
  
  const batchSize = 100
  let success = 0
  let failed = 0
  const errors: any[] = []

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}...`)

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(batch, { onConflict: 'discord_id' })

      if (error) {
        console.error(`❌ Batch error:`, error.message)
        failed += batch.length
        errors.push({ batch: i / batchSize + 1, error: error.message })
      } else {
        success += batch.length
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} success: ${batch.length} users`)
      }
    } catch (err: any) {
      console.error(`❌ Exception:`, err.message)
      failed += batch.length
      errors.push({ batch: i / batchSize + 1, error: err.message })
    }

    // Wait a bit between batches
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n📈 MIGRATION SUMMARY\n')
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Total: ${users.length}`)
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:')
    errors.forEach(e => console.log(`  Batch ${e.batch}: ${e.error}`))
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    total: users.length,
    success,
    failed,
    errors
  }
  
  fs.writeFileSync(
    path.join(__dirname, '../migration-report.json'),
    JSON.stringify(report, null, 2)
  )
  console.log('\n📄 Report saved to migration-report.json')
}

// Main execution
async function main() {
  console.log('🎯 FiveM Tools - User Migration Script\n')

  // Read SQL file
  const sqlPath = path.join(__dirname, '../database-dump/complete_data_dump.sql')
  console.log(`📂 Reading: ${sqlPath}`)
  
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
  console.log(`✅ File loaded: ${(sqlContent.length / 1024).toFixed(2)} KB`)

  // Parse users
  console.log('\n🔍 Parsing SQL data...')
  const users = parseSQLInsert(sqlContent)
  console.log(`✅ Parsed ${users.length} users`)

  // Analyze
  analyzeUsers(users)

  // Confirm before push
  console.log('\n⚠️  Ready to push to Supabase!')
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
  
  await new Promise(resolve => setTimeout(resolve, 5000))

  // Push to Supabase
  await pushToSupabase(users)

  console.log('\n✨ Migration complete!\n')
}

main().catch(console.error)
