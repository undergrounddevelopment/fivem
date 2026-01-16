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

// GET threads
export async function GET(req: NextRequest) {
  try {
    console.log('[Threads API] GET request received')
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('category')
    const queryStr = searchParams.get('q')
    const sort = searchParams.get('sort') || 'new'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    const supabase = getSupabase()

    let query = supabase
      .from("forum_threads")
      .select("*")
      .eq("is_deleted", false)
      .or("status.eq.approved,status.is.null")

    if (categoryId) query = query.eq("category_id", categoryId)
    if (queryStr) {
      query = query.or(`title.ilike.%${queryStr}%,content.ilike.%${queryStr}%`)
    }

    // Apply sorting
    if (sort === 'hot' || sort === 'most_reacted') {
      query = query.order("likes", { ascending: false })
    } else if (sort === 'most_viewed') {
      query = query.order("views", { ascending: false })
    } else if (sort === 'most_messages') {
      query = query.order("replies_count", { ascending: false })
    } else {
      // Default: New topics + Pinned on top
      query = query.order("is_pinned", { ascending: false })
      query = query.order("created_at", { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: threads, error } = await query
    if (error) throw error

    // Get authors - handle both UUID and discord_id
    const authorIds = [...new Set((threads || []).map(t => t.author_id).filter(Boolean))]
    const authorsMap: Record<string, any> = {}

    if (authorIds.length > 0) {
      const uniqueIds = [...new Set(authorIds)]
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const uuids = uniqueIds.filter(id => uuidRegex.test(id))
      const discordIds = uniqueIds.filter(id => !uuidRegex.test(id))

      const fetchedUsers: any[] = []

      // 1. Fetch by UUID
      if (uuids.length > 0) {
        const { data: u1 } = await supabase
          .from("users")
          .select("id, discord_id, username, avatar, membership, xp, level")
          .in("id", uuids)
        if (u1) fetchedUsers.push(...u1)
      }

      // 2. Fetch by Discord ID (safely)
      if (discordIds.length > 0) {
        const { data: u2 } = await supabase
          .from("users")
          .select("id, discord_id, username, avatar, membership, xp, level")
          .in("discord_id", discordIds)
        if (u2) fetchedUsers.push(...u2)
      }

      for (const u of fetchedUsers) {
        if (u.discord_id) authorsMap[u.discord_id] = u
        authorsMap[u.id] = u
      }
    }

    // Get LIVE reply counts from database for accuracy
    const threadIds = (threads || []).map(t => t.id)
    const replyCounts: Record<string, number> = {}
    
    if (threadIds.length > 0) {
      for (const tid of threadIds) {
        const { count } = await supabase
          .from("forum_replies")
          .select("*", { count: 'exact', head: true })
          .eq("thread_id", tid)
          .eq("is_deleted", false)
        replyCounts[tid] = count || 0
      }
    }

    const formatted = (threads || []).map(t => {
      const author = authorsMap[t.author_id]
      const liveReplyCount = replyCounts[t.id] || t.replies_count || 0
      return {
        id: t.id, title: t.title, content: t.content, category_id: t.category_id,
        author_id: t.author_id, status: t.status, is_pinned: t.is_pinned, is_locked: t.is_locked,
        views: t.views || 0, likes: t.likes || 0, replies: liveReplyCount,
        replies_count: liveReplyCount, images: t.images || [],
        thread_type: t.thread_type || "discussion",
        created_at: t.created_at, updated_at: t.updated_at,
        author: {
          id: author?.discord_id || t.author_id, username: author?.username || "Unknown",
          avatar: author?.avatar, membership: author?.membership || "member",
          xp: author?.xp || 0, level: author?.level || 1,
        },
      }
    })

    // Get total count for pagination
    const { count: totalThreads } = await supabase
      .from("forum_threads")
      .select("*", { count: 'exact', head: true })
      .eq("is_deleted", false)
      .or("status.eq.approved,status.is.null")

    const total = totalThreads || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({ 
      success: true, 
      threads: formatted, 
      total, 
      totalPages 
    })
  } catch (e: any) {
    console.error('[Threads GET]', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

// POST thread
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 })
    }

    const { title, content, category_id, images, thread_type } = await req.json()
    const discordId = session.user.id

    if (!title || title.length < 1) return NextResponse.json({ success: false, error: 'Title required' }, { status: 400 })
    if (!content || content.length < 10) return NextResponse.json({ success: false, error: 'Content min 10 chars' }, { status: 400 })

    const supabase = getSupabase()

    const { data: user, error: userErr } = await supabase.from("users").select("id").eq("discord_id", discordId).single()
    if (userErr || !user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    const { data: thread, error: insertErr } = await supabase
      .from("forum_threads")
      .insert({ 
        title, 
        content, 
        category_id, 
        author_id: user.id, 
        status: 'approved', // Automatically approve for now as requested
        images: images || [],
        thread_type: thread_type || 'discussion'
      })
      .select().single()

    if (insertErr) throw insertErr

    // Award XP for creating thread
    const { xpQueries } = await import('@/lib/xp/queries')
    await xpQueries.awardXP(discordId, 'create_thread', thread.id)

    return NextResponse.json({ success: true, data: thread })
  } catch (e: any) {
    console.error('[Threads POST]', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
