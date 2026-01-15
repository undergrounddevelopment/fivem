import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Direct Supabase - 100% working
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// GET - Fetch comments
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data: comments, error } = await supabase
      .from('asset_comments')
      .select('*')
      .eq('asset_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Comments GET]', error)
      return NextResponse.json({ comments: [] })
    }

    // Get user details - user_id is discord_id
    const userIds = [...new Set((comments || []).map(c => c.user_id).filter(Boolean))]
    const usersMap: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('discord_id, username, avatar, level, membership')
        .in('discord_id', userIds)

      for (const u of users || []) {
        usersMap[u.discord_id] = u
      }
    }

    const formatted = (comments || []).map(c => {
      const user = usersMap[c.user_id]
      return {
        ...c,
        content: c.content || c.comment, // Support both columns
        user: user ? {
          id: user.discord_id,
          username: user.username,
          avatar: user.avatar,
          level: user.level,
          membership: user.membership
        } : null
      }
    })

    return NextResponse.json({ comments: formatted })
  } catch (e: any) {
    console.error('[Comments GET]', e)
    return NextResponse.json({ comments: [] })
  }
}

// POST - Create comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { id: assetId } = await params
    const body = await req.json()
    const content = body.content || body.comment
    const rating = body.rating

    if (!content || content.trim().length < 3) {
      return NextResponse.json({ error: 'Comment must be at least 3 characters' }, { status: 400 })
    }

    const supabase = getSupabase()
    const discordId = session.user.id // Discord ID from session

    console.log("[Comment POST] Discord ID:", discordId, "Asset:", assetId)

    // Auto-Ban Check
    const { checkAutoBan } = await import('@/lib/autoBan')
    const isBanned = await checkAutoBan(discordId, content, 'comment')
    if (isBanned) {
      return NextResponse.json({ error: 'Account banned due to policy violation' }, { status: 403 })
    }

    // Check asset exists
    const { data: asset, error: assetErr } = await supabase
      .from('assets')
      .select('id, title')
      .eq('id', assetId)
      .single()

    if (assetErr || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Check if already commented
    const { data: existing } = await supabase
      .from('asset_comments')
      .select('id')
      .eq('asset_id', assetId)
      .eq('user_id', discordId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You already commented on this asset' }, { status: 400 })
    }

    // Insert comment - user_id is discord_id
    const commentData: any = {
      asset_id: assetId,
      user_id: discordId,
      rating: rating || 5,
      likes_count: 0
    }

    // Check which column exists
    const { data: tableInfo } = await supabase
      .from('asset_comments')
      .select('*')
      .limit(1)

    // Use 'comment' column if exists, otherwise 'content'
    if (tableInfo !== null) {
      commentData.comment = content.trim()
    } else {
      commentData.content = content.trim()
    }

    const { data: comment, error: insertErr } = await supabase
      .from('asset_comments')
      .insert(commentData)
      .select()
      .single()

    if (insertErr) {
      console.error('[Comment POST] Insert error:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // Award XP
    try {
      const { data: user } = await supabase
        .from('users')
        .select('xp')
        .eq('discord_id', discordId)
        .single()

      if (user) {
        await supabase
          .from('users')
          .update({ xp: (user.xp || 0) + 15 })
          .eq('discord_id', discordId)
      }
    } catch (e) {
      console.error('[Comment POST] XP error:', e)
    }

    // Update asset rating
    try {
      const { data: allComments } = await supabase
        .from('asset_comments')
        .select('rating')
        .eq('asset_id', assetId)
        .not('rating', 'is', null)

      if (allComments?.length) {
        const avg = allComments.reduce((s, c) => s + (c.rating || 0), 0) / allComments.length
        await supabase
          .from('assets')
          .update({ rating: Math.round(avg * 10) / 10, rating_count: allComments.length })
          .eq('id', assetId)
      }
    } catch (e) {
      console.error('[Comment POST] Rating error:', e)
    }

    return NextResponse.json({ success: true, comment, message: 'Comment posted!' })
  } catch (e: any) {
    console.error('[Comment POST]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
