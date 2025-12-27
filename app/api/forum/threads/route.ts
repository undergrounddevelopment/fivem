import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/forum/threads - Get all threads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const page = parseInt(searchParams.get('page') || '1')
    const calculatedOffset = (page - 1) * limit

    const rawThreads = await db.forum.getThreads(categoryId || undefined, limit, calculatedOffset)

    // Transform threads to include author object
    const threads = rawThreads.map((t: any) => ({
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
      replies: t.replies_count || 0,
      images: t.images || [],
      created_at: t.created_at,
      updated_at: t.updated_at,
      author: t.author_username ? {
        id: t.user_id,
        username: t.author_username,
        avatar: t.author_avatar,
        membership: t.author_membership
      } : null
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
    const author_id = session.user.id

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

    const thread = await db.forum.createThread({
      title,
      content,
      category_id,
      author_id,
      images: images || [],
    })

    return NextResponse.json({
      success: true,
      data: thread[0],
    })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}
