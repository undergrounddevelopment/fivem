import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const categoryId = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const supabase = getDirectSupabase()
    const searchPattern = `%${query.trim()}%`

    let dbQuery = supabase
      .from('forum_threads')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false)
      .or('status.eq.approved,status.is.null')
      .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
      .order('created_at', { ascending: false })

    if (categoryId) {
      dbQuery = dbQuery.eq('category_id', categoryId)
    }

    const { data: threads, error, count } = await dbQuery.range(offset, offset + limit - 1)

    if (error) throw error

    const authorIds = [...new Set((threads || []).map(t => t.author_id).filter(Boolean))]
    const authorsMap: Record<string, any> = {}

    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, discord_id, username, avatar, membership')
        .in('discord_id', authorIds)

      for (const author of authors || []) {
        authorsMap[author.discord_id] = author
      }
    }

    const formattedThreads = (threads || []).map(t => {
      const author = authorsMap[t.author_id]
      if (!author?.username) return null
      
      return {
        id: t.id,
        title: t.title,
        content: t.content.substring(0, 200) + (t.content.length > 200 ? '...' : ''),
        category_id: t.category_id,
        author: {
          id: author.discord_id || t.author_id,
          username: author.username,
          avatar: author.avatar,
          membership: author.membership || 'member',
        },
        replies_count: t.replies_count || 0,
        likes: t.likes || 0,
        views: t.views || 0,
        is_pinned: t.is_pinned || false,
        created_at: t.created_at,
      }
    }).filter(Boolean)

    return NextResponse.json({
      success: true,
      data: {
        threads: formattedThreads,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    })
  } catch (error) {
    console.error('[Search API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search threads' },
      { status: 500 }
    )
  }
}
