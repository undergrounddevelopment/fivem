import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { forumQueries } from '@/lib/db/queries'
import { hasPgConnection, pgPool } from '@/lib/db/postgres'

// GET /api/forum/threads - Get all threads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const page = parseInt(searchParams.get('page') || '1')
    const calculatedOffset = (page - 1) * limit

    console.log(`[Forum API] Fetching threads - category: ${categoryId}, limit: ${limit}, hasPG: ${hasPgConnection}`)

    // Prefer Akamai Postgres when available
    let rawThreads: any[] = []
    if (hasPgConnection && pgPool) {
      const where: string[] = ["t.is_deleted = false"]
      const params: any[] = []

      if (categoryId) {
        params.push(categoryId)
        where.push(`t.category_id = $${params.length}`)
      }

      params.push(limit)
      params.push(calculatedOffset)

      // Try join on UUID first, fallback to discord_id if author not found
      const sql = `
        SELECT
          t.*,
          COALESCE(u1.id, u2.id) AS author_user_id,
          COALESCE(u1.discord_id, u2.discord_id) AS author_discord_id,
          COALESCE(u1.username, u2.username) AS author_username,
          COALESCE(u1.avatar, u2.avatar) AS author_avatar,
          COALESCE(u1.membership, u2.membership) AS author_membership
        FROM forum_threads t
        LEFT JOIN users u1 ON u1.id::text = t.author_id::text
        LEFT JOIN users u2 ON u2.discord_id = t.author_id::text AND u1.id IS NULL
        WHERE ${where.join(" AND ")}
        ORDER BY t.is_pinned DESC, t.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `

      try {
        const res = await pgPool.query(sql, params)
        rawThreads = res.rows || []
        console.log(`[Forum API] PG returned ${rawThreads.length} threads`)
      } catch (pgErr) {
        console.error('[Forum API] PG query failed, falling back to Supabase:', pgErr)
        rawThreads = await forumQueries.getThreads(categoryId || undefined, limit, calculatedOffset)
      }
    } else {
      console.log('[Forum API] Using Supabase fallback')
      rawThreads = await forumQueries.getThreads(categoryId || undefined, limit, calculatedOffset)
      console.log(`[Forum API] Supabase returned ${rawThreads.length} threads`)
    }

    console.log(`[Forum API] Total raw threads: ${rawThreads.length}`)

    // Transform threads to include author object
    const threads = rawThreads.map((t: any) => ({
      id: t.id,
      title: t.title,
      content: t.content,
      category_id: t.category_id,
      author_id: t.author_id,
      status: (t as any).status,
      is_pinned: t.is_pinned,
      is_locked: t.is_locked,
      views: t.views || 0,
      likes: t.likes || 0,
      replies: (t.replies ?? t.replies_count) || 0,
      replies_count: (t.replies ?? t.replies_count) || 0,
      images: (t.images || []),
      created_at: t.created_at,
      updated_at: t.updated_at,
      author: t.author ? {
        id: t.author.id || t.author_id,
        username: t.author.username || 'Unknown',
        avatar: t.author.avatar,
        membership: t.author.membership || 'member'
      } : (t.author_discord_id || t.author_user_id) ? {
        id: t.author_discord_id || t.author_user_id,
        username: t.author_username || 'Unknown',
        avatar: t.author_avatar,
        membership: t.author_membership || 'member'
      } : { id: t.author_id, username: 'Unknown', avatar: null, membership: 'member' }
    }))

    return NextResponse.json({
      success: true,
      threads: threads,
      total: threads.length,
      totalPages: Math.ceil(threads.length / limit) || 1,
    })
  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}

// POST /api/forum/threads - Create new thread (SECURED)
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, category_id, images } = body
    
    // SECURITY: Use session user ID, NOT from body (prevents impersonation)
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

    let thread: any = null
    if (hasPgConnection && pgPool) {
      const userRes = await pgPool.query('SELECT id FROM users WHERE discord_id = $1 LIMIT 1', [discordId])
      const authorUuid = userRes.rows?.[0]?.id
      if (!authorUuid) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      const res = await pgPool.query(
        `
          INSERT INTO forum_threads (title, content, category_id, author_id)
          VALUES ($1,$2,$3,$4)
          RETURNING *
        `,
        [title, content, category_id, authorUuid],
      )
      thread = res.rows?.[0] || null
    } else {
      thread = await forumQueries.createThread({
        title,
        content,
        category_id,
        author_id: discordId,
        images: images || [],
      })
    }

    return NextResponse.json({
      success: true,
      data: thread,
    })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}
