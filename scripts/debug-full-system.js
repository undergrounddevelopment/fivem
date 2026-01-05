// Full System Debug Script
// Run: node scripts/debug-full-system.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Try multiple possible env var names
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.SUPABASE_URL || 
                    process.env.fivemvip_SUPABASE_URL ||
                    process.env.NEXT_PUBLIC_fivemvip_SUPABASE_URL

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.fivemvip_SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Using Supabase URL:', supabaseUrl)
console.log('🔧 Service Key exists:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.log('Available env vars with SUPABASE:')
  Object.keys(process.env).filter(k => k.includes('SUPABASE')).forEach(k => {
    console.log(`  ${k}: ${process.env[k]?.substring(0, 30)}...`)
  })
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugSystem() {
  console.log('🔍 FULL SYSTEM DEBUG\n')
  console.log('=' .repeat(60))
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  }

  // 1. Test Database Connection
  console.log('\n📡 1. DATABASE CONNECTION')
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) throw error
    console.log('   ✅ Database connected')
    results.passed.push('Database connection')
  } catch (e) {
    console.log('   ❌ Database error:', e.message)
    results.failed.push('Database connection: ' + e.message)
  }

  // 2. Check Users Table
  console.log('\n👥 2. USERS TABLE')
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, discord_id, username, xp, level, current_badge, coins, membership')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Users table OK (${users?.length || 0} sample users)`)
    
    if (users && users.length > 0) {
      console.log('   Sample user:', JSON.stringify(users[0], null, 2).split('\n').map(l => '   ' + l).join('\n'))
      
      // Check XP columns
      const hasXP = users[0].xp !== undefined
      const hasLevel = users[0].level !== undefined
      const hasBadge = users[0].current_badge !== undefined
      
      if (!hasXP) results.warnings.push('Users missing xp column')
      if (!hasLevel) results.warnings.push('Users missing level column')
      if (!hasBadge) results.warnings.push('Users missing current_badge column')
    }
    results.passed.push('Users table')
  } catch (e) {
    console.log('   ❌ Users error:', e.message)
    results.failed.push('Users table: ' + e.message)
  }

  // 3. Check Badges Table
  console.log('\n🏅 3. BADGES TABLE')
  try {
    const { data: badges, error } = await supabase
      .from('badges')
      .select('*')
      .order('tier', { ascending: true })
    
    if (error) throw error
    console.log(`   ✅ Badges table OK (${badges?.length || 0} badges)`)
    
    if (badges && badges.length > 0) {
      badges.forEach(b => {
        console.log(`   - ${b.id}: ${b.name} (${b.min_xp}-${b.max_xp || '∞'} XP) → ${b.image_url}`)
      })
    } else {
      results.warnings.push('Badges table is empty - needs seeding')
    }
    results.passed.push('Badges table')
  } catch (e) {
    console.log('   ❌ Badges error:', e.message)
    results.failed.push('Badges table: ' + e.message)
  }

  // 4. Check User Badges Table
  console.log('\n🎖️ 4. USER_BADGES TABLE')
  try {
    const { data: userBadges, error } = await supabase
      .from('user_badges')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ User badges table OK (${userBadges?.length || 0} records)`)
    results.passed.push('User badges table')
  } catch (e) {
    console.log('   ❌ User badges error:', e.message)
    results.failed.push('User badges table: ' + e.message)
  }

  // 5. Check Forum Threads
  console.log('\n💬 5. FORUM_THREADS TABLE')
  try {
    const { data: threads, error } = await supabase
      .from('forum_threads')
      .select('id, title, status, author_id, category_id, is_deleted')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Forum threads table OK (${threads?.length || 0} sample threads)`)
    
    if (threads && threads.length > 0) {
      const hasStatus = threads[0].status !== undefined
      console.log(`   Status column: ${hasStatus ? '✅ exists' : '❌ missing'}`)
      
      if (!hasStatus) {
        results.warnings.push('forum_threads missing status column')
      }
      
      // Check for pending threads
      const { data: pending } = await supabase
        .from('forum_threads')
        .select('id')
        .eq('status', 'pending')
      
      console.log(`   Pending threads: ${pending?.length || 0}`)
    }
    results.passed.push('Forum threads table')
  } catch (e) {
    console.log('   ❌ Forum threads error:', e.message)
    results.failed.push('Forum threads table: ' + e.message)
  }

  // 6. Check Forum Categories
  console.log('\n📁 6. FORUM_CATEGORIES TABLE')
  try {
    const { data: categories, error } = await supabase
      .from('forum_categories')
      .select('*')
    
    if (error) throw error
    console.log(`   ✅ Forum categories OK (${categories?.length || 0} categories)`)
    
    if (categories && categories.length > 0) {
      categories.forEach(c => {
        console.log(`   - ${c.id}: ${c.name}`)
      })
    }
    results.passed.push('Forum categories table')
  } catch (e) {
    console.log('   ❌ Forum categories error:', e.message)
    results.failed.push('Forum categories table: ' + e.message)
  }

  // 7. Check Assets Table
  console.log('\n📦 7. ASSETS TABLE')
  try {
    const { data: assets, error } = await supabase
      .from('assets')
      .select('id, title, category, status, author_id, price')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Assets table OK (${assets?.length || 0} sample assets)`)
    results.passed.push('Assets table')
  } catch (e) {
    console.log('   ❌ Assets error:', e.message)
    results.failed.push('Assets table: ' + e.message)
  }

  // 8. Check Asset Comments Table
  console.log('\n💭 8. ASSET_COMMENTS TABLE')
  try {
    const { data: comments, error } = await supabase
      .from('asset_comments')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ Asset comments table OK (${comments?.length || 0} comments)`)
    results.passed.push('Asset comments table')
  } catch (e) {
    console.log('   ❌ Asset comments error:', e.message)
    results.failed.push('Asset comments table: ' + e.message)
  }

  // 9. Check XP Transactions Table
  console.log('\n⚡ 9. XP_TRANSACTIONS TABLE')
  try {
    const { data: xpTx, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .limit(5)
    
    if (error) throw error
    console.log(`   ✅ XP transactions table OK (${xpTx?.length || 0} records)`)
    results.passed.push('XP transactions table')
  } catch (e) {
    console.log('   ❌ XP transactions error:', e.message)
    results.failed.push('XP transactions table: ' + e.message)
  }

  // 10. Test Profile API Logic
  console.log('\n👤 10. PROFILE API LOGIC TEST')
  try {
    // Get a sample user
    const { data: sampleUser } = await supabase
      .from('users')
      .select('discord_id, username, xp')
      .limit(1)
      .single()
    
    if (sampleUser) {
      console.log(`   Testing with user: ${sampleUser.username} (${sampleUser.discord_id})`)
      
      // Test badges query
      const { data: allBadges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .order('min_xp', { ascending: true })
      
      if (badgeError) {
        console.log('   ❌ Badges query failed:', badgeError.message)
        results.failed.push('Profile badges query')
      } else {
        const userXP = sampleUser.xp || 0
        const earnedBadges = (allBadges || []).filter(b => 
          userXP >= b.min_xp && (!b.max_xp || userXP <= b.max_xp)
        )
        console.log(`   ✅ User XP: ${userXP}, Earned badges: ${earnedBadges.length}`)
        results.passed.push('Profile badges query')
      }
    }
  } catch (e) {
    console.log('   ❌ Profile test error:', e.message)
    results.failed.push('Profile API logic: ' + e.message)
  }

  // 11. Test Admin Forum Pending Logic
  console.log('\n🛡️ 11. ADMIN FORUM PENDING TEST')
  try {
    const { data: pendingThreads, error } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('status', 'pending')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('   ❌ Pending query failed:', error.message)
      results.failed.push('Admin forum pending query')
    } else {
      console.log(`   ✅ Pending threads query OK (${pendingThreads?.length || 0} pending)`)
      results.passed.push('Admin forum pending query')
    }
  } catch (e) {
    console.log('   ❌ Admin forum error:', e.message)
    results.failed.push('Admin forum pending: ' + e.message)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 DEBUG SUMMARY')
  console.log('='.repeat(60))
  console.log(`\n✅ PASSED: ${results.passed.length}`)
  results.passed.forEach(p => console.log(`   - ${p}`))
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS: ${results.warnings.length}`)
    results.warnings.forEach(w => console.log(`   - ${w}`))
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED: ${results.failed.length}`)
    results.failed.forEach(f => console.log(`   - ${f}`))
  }
  
  console.log('\n' + '='.repeat(60))
  
  if (results.failed.length === 0) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL!')
  } else {
    console.log('⚠️ SOME ISSUES NEED ATTENTION')
    console.log('\nRun this SQL in Supabase to fix missing tables:')
    console.log('File: scripts/AUTO-RUN-SETUP.sql')
  }
}

debugSystem().catch(console.error)
