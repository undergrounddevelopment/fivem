import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { XP_CONFIG, getLevelFromXP } from '@/lib/xp-badges'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, targetUserId } = body
    
    // session.user.id is discord_id
    const discordId = targetUserId || session.user.id
    
    // Get XP reward for this action
    const xpReward = XP_CONFIG.rewards[action as keyof typeof XP_CONFIG.rewards]
    if (!xpReward) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get current user XP by discord_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, discord_id, xp, level, current_badge')
      .eq('discord_id', discordId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate new XP and level
    const newXP = (user.xp || 0) + xpReward
    const levelInfo = getLevelFromXP(newXP)
    const leveledUp = levelInfo.level > (user.level || 1)

    // Update user XP and level
    const { error: updateError } = await supabase
      .from('users')
      .update({
        xp: newXP,
        level: levelInfo.level,
        current_badge: levelInfo.title.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('discord_id', discordId)

    if (updateError) {
      console.error('Error updating XP:', updateError)
      return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 })
    }

    // Log XP transaction
    await supabase
      .from('xp_transactions')
      .insert({
        user_id: discordId,
        amount: xpReward,
        activity_type: action,
        description: `Earned ${xpReward} XP for ${action.toLowerCase().replace(/_/g, ' ')}`,
      })

    return NextResponse.json({
      success: true,
      xpGained: xpReward,
      totalXP: newXP,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      progress: levelInfo.progress,
      leveledUp,
    })
  } catch (error) {
    console.error('XP API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const discordId = searchParams.get('userId')

    if (!discordId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user XP data by discord_id
    const { data: user, error } = await supabase
      .from('users')
      .select('id, discord_id, xp, level, current_badge, username, avatar, membership, created_at')
      .eq('discord_id', discordId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user stats for badges
    // forum_threads.author_id is TEXT (discord_id), assets.author_id is UUID
    const [threadsResult, repliesResult, assetsResult, likesResult, badgesResult] = await Promise.all([
      supabase.from('forum_threads').select('id', { count: 'exact', head: true }).eq('author_id', discordId),
      supabase.from('forum_replies').select('id', { count: 'exact', head: true }).eq('author_id', discordId),
      supabase.from('assets').select('id, downloads', { count: 'exact' }).eq('author_id', user.id), // UUID
      supabase.from('likes').select('id', { count: 'exact', head: true }).eq('target_id', discordId),
      supabase.from('user_badges').select('*, badges(*)').eq('user_id', discordId),
    ])

    const threads = threadsResult.count || 0
    const replies = repliesResult.count || 0
    const posts = threads + replies
    const assets = assetsResult.count || 0
    const assetDownloads = (assetsResult.data || []).reduce((sum, a) => sum + (a.downloads || 0), 0)
    const likesReceived = likesResult.count || 0
    const userBadges = badgesResult.data || []

    // Calculate level info
    const levelInfo = getLevelFromXP(user.xp || 0)

    return NextResponse.json({
      user: {
        id: user.id,
        discord_id: user.discord_id,
        username: user.username,
        avatar: user.avatar,
        membership: user.membership,
      },
      xp: {
        total: user.xp || 0,
        level: levelInfo.level,
        title: levelInfo.title,
        progress: levelInfo.progress,
        nextLevelXP: levelInfo.nextLevelXP,
      },
      stats: {
        threads,
        replies,
        posts,
        assets,
        assetDownloads,
        likesReceived,
      },
      badges: userBadges,
      createdAt: user.created_at,
    })
  } catch (error) {
    console.error('XP GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
