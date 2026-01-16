// Auto Database Setup API
// GET: Check status, POST: Run setup

import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

import { BADGES } from "@/lib/xp-badges"

const BADGE_DATA = BADGES.map(b => ({
  id: b.id,
  name: b.name,
  description: b.description,
  image_url: b.icon,
  min_xp: b.requirement.type === 'level' ? b.requirement.value * 1000 : 0, // Approximate fallback or strict mapping
  max_xp: null,
  color: b.color,
  tier: b.requirement.type === 'level' ? b.requirement.value : 1
}))

// Check database status
export async function GET() {
  const results: { table: string; status: string; count?: number }[] = []
  
  try {
    const supabase = getSupabaseAdminClient()
    
    // Check badges table
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('id')
    
    if (badgesError) {
      results.push({ table: 'badges', status: 'missing' })
    } else {
      results.push({ table: 'badges', status: 'ok', count: badges?.length || 0 })
    }
    
    // Check user_badges table
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('id')
      .limit(1)
    
    if (userBadgesError) {
      results.push({ table: 'user_badges', status: 'missing' })
    } else {
      results.push({ table: 'user_badges', status: 'ok' })
    }
    
    // Check asset_comments table
    const { data: comments, error: commentsError } = await supabase
      .from('asset_comments')
      .select('id')
      .limit(1)
    
    if (commentsError) {
      results.push({ table: 'asset_comments', status: 'missing' })
    } else {
      results.push({ table: 'asset_comments', status: 'ok' })
    }
    
    // Check forum_threads status column
    const { data: threads, error: threadsError } = await supabase
      .from('forum_threads')
      .select('status')
      .limit(1)
    
    if (threadsError) {
      results.push({ table: 'forum_threads.status', status: 'missing' })
    } else {
      results.push({ table: 'forum_threads.status', status: 'ok' })
    }
    
    // Check users xp column
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('xp, level, current_badge')
      .limit(1)
    
    if (usersError) {
      results.push({ table: 'users.xp', status: 'missing' })
    } else {
      results.push({ table: 'users.xp', status: 'ok' })
    }
    
    return NextResponse.json({ 
      status: 'checked',
      results,
      needsSetup: results.some(r => r.status === 'missing')
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error',
      error: error.message,
      results
    }, { status: 500 })
  }
}

// Run database setup
export async function POST() {
  const logs: string[] = []
  
  try {
    const supabase = getSupabaseAdminClient()
    
    // 1. Ensure badges table has data
    logs.push('Checking badges table...')
    
    const { data: existingBadges, error: checkError } = await supabase
      .from('badges')
      .select('id')
    
    if (checkError) {
      logs.push(`⚠️ Badges table check failed: ${checkError.message}`)
      logs.push('Table may not exist - please run SQL setup first')
    } else if (!existingBadges || existingBadges.length === 0) {
      logs.push('Seeding badges...')
      
      const { error: insertError } = await supabase
        .from('badges')
        .upsert(BADGE_DATA, { onConflict: 'id' })
      
      if (insertError) {
        logs.push(`❌ Failed to seed badges: ${insertError.message}`)
      } else {
        logs.push('✅ Badges seeded successfully (5 badges)')
      }
    } else {
      logs.push(`✅ Badges already exist (${existingBadges.length} badges)`)
      
      // Update existing badges to use local images
      const { error: updateError } = await supabase
        .from('badges')
        .upsert(BADGE_DATA, { onConflict: 'id' })
      
      if (!updateError) {
        logs.push('✅ Badge images updated to local paths')
      }
    }
    
    // 2. Check and update users with default XP values
    logs.push('Checking users XP fields...')
    
    const { error: updateUsersError } = await supabase
      .from('users')
      .update({ 
        xp: 0,
        level: 1,
        current_badge: 'beginner'
      })
      .is('xp', null)
    
    if (updateUsersError) {
      logs.push(`⚠️ Users XP update: ${updateUsersError.message}`)
    } else {
      logs.push('✅ Users XP fields checked')
    }
    
    // 3. Verify forum_threads status
    logs.push('Checking forum_threads status column...')
    
    const { data: threadCheck, error: threadError } = await supabase
      .from('forum_threads')
      .select('status')
      .limit(1)
    
    if (threadError) {
      logs.push(`⚠️ forum_threads status: ${threadError.message}`)
    } else {
      logs.push('✅ forum_threads status column exists')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      logs
    })
  } catch (error: any) {
    logs.push(`❌ Error: ${error.message}`)
    return NextResponse.json({
      success: false,
      error: error.message,
      logs
    }, { status: 500 })
  }
}
