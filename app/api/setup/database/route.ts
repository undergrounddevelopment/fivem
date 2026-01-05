// Auto Database Setup API
// GET: Check status, POST: Run setup

import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

const BADGE_DATA = [
  { id: 'beginner', name: 'Beginner Bolt', description: 'Start your journey - New member rank', image_url: '/badges/badge1.png', min_xp: 0, max_xp: 999, color: '#84CC16', tier: 1 },
  { id: 'intermediate', name: 'Intermediate Bolt', description: 'Rising star - Active community member', image_url: '/badges/badge2.png', min_xp: 1000, max_xp: 4999, color: '#3B82F6', tier: 2 },
  { id: 'advanced', name: 'Advanced Bolt', description: 'Skilled contributor - Experienced member', image_url: '/badges/badge3.png', min_xp: 5000, max_xp: 14999, color: '#9333EA', tier: 3 },
  { id: 'expert', name: 'Expert Bolt', description: 'Elite status - Top community member', image_url: '/badges/badge4.png', min_xp: 15000, max_xp: 49999, color: '#DC2626', tier: 4 },
  { id: 'legend', name: 'Legend Bolt', description: 'Legendary - Ultimate rank achieved', image_url: '/badges/badge5.png', min_xp: 50000, max_xp: null, color: '#F59E0B', tier: 5 },
]

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
