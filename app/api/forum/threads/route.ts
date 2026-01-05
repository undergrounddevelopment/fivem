import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Direct Supabase connection - use correct env variables
const supabaseUrl = process.env.NEXT_PUBLIC_fivemvip_SUPABASE_URL || 
                    process.env.fivemvip_SUPABASE_URL || 
                    process.env.SUPABASE_URL || ""
const supabaseServiceKey = process.env.fivemvip_SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_ROLE_KEY || ""

function getDirectSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials")
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Helper to fetch authors by discord_id only
async function fetchAuthors(supabase: any, authorIds: string[]) {
  if (!authorIds.length) return {}
  
  const uniqueIds = [...new Set(authorIds.filter(Boolean))]
  const authorsMap: Record<string, any> = {}

  const { data: users } = await supabase
    .from("users")
    .select("id, discord_id, username, avatar, membership, xp, level")
    .in("discord_id", uniqueIds)

  for (const user of users || []) {
    authorsMap[user.discord_id] = user
  }

  return authorsMap
}

function formatAuthor(author: any, fallbackId: string) {
  if (!author) {
    const fallbackUsername = `User_${fallbackId.slice(-4)}`
    return {
      id: fallbackId,
      username: fallbackUsername,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${fallbackUsername}`,
      membership: "member",
      xp: 0,
      level: 1,
    }
  }
  
  return {
    id: author.discord_id,
    username: author.username,
    avatar: author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${author.username}`,
    membership: author.membership || "member",
    xp: author.xp || 0,
    level: author.level || 1,
  }
}

// GET /api/forum/threads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    const supabase = getDirectSupabase()

    // Build query
    let query = supabase
      .from("forum_threads")
      .select("*")
      .eq("is_deleted", false)
      .or("status.eq.approved,status.is.null")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data: threads, error } = await query

    if (error) {
      console.error("[Forum API] Error:", error)
      throw error
    }

    // Fetch authors
    const authorIds = (threads || []).map(t => t.author_id).filter(Boolean)
    const authorsMap = await fetchAuthors(supabase, authorIds)

    // Format threads
    const formattedThreads = (threads || []).map(t => {
      const author = authorsMap[t.author_id]
      
      return {
        id: t.id,
        title: t.title,
        content: t.content,
        category_id: t.category_id,
        author_id: t.author_id,
        status: t.status,
        is_pinned: t.is_pinned,
        is_locked: t.is_locked,
        views: t.views || 0,
        likes: t.likes || 0,
        replies: t.replies_count || t.replies || 0,
        replies_count: t.replies_count || t.replies || 0,
        images: t.images || [],
        created_at: t.created_at,
        updated_at: t.updated_at,
        author: formatAuthor(author, t.author_id),
      }
    })

    return NextResponse.json({
      success: true,
      threads: formattedThreads,
      total: formattedThreads.length,
      totalPages: Math.ceil(formattedThreads.length / limit) || 1,
    })
  } catch (error) {
    console.error('[Forum API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}

// POST /api/forum/threads
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, category_id, images } = body
    const discordId = session.user.id

    // Validation
    if (!title || title.length < 1 || title.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title must be 1-200 characters' },
        { status: 400 }
      )
    }

    if (!content || content.length < 10 || content.length > 50000) {
      return NextResponse.json(
        { success: false, error: 'Content must be 10-50000 characters' },
        { status: 400 }
      )
    }

    const supabase = getDirectSupabase()

    // Create thread with discord_id directly (author_id is TEXT = discord_id)
    const { data: thread, error: insertError } = await supabase
      .from("forum_threads")
      .insert({
        title,
        content,
        category_id,
        author_id: discordId,
        user_id: discordId,
        status: 'pending',
        images: images || [],
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Forum API] Insert error:', insertError)
      throw insertError
    }

    return NextResponse.json({
      success: true,
      data: thread,
    })
  } catch (error) {
    console.error('[Forum API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}
