import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getForumThreads } from '@/lib/database-direct'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { security } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const threads = await getForumThreads(categoryId || undefined)

    return NextResponse.json({
      success: true,
      threads: threads,
      total: threads.length,
    })
  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const title = security.sanitizeInput(body?.title || '')
    const content = security.sanitizeInput(body?.content || '')
    const categoryId = security.sanitizeInput(body?.categoryId || '')
    const images = Array.isArray(body?.images) ? body.images : []

    if (!title || title.length < 1 || title.length > 200) {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
    }

    if (!content || content.length < 10 || content.length > 50000) {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: thread, error } = await supabase
      .from('forum_threads')
      .insert({
        title,
        content,
        category_id: categoryId,
        author_id: session.user.id,
        status: 'pending',
        images,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating thread:', error)
      return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 })
    }

    return NextResponse.json({ success: true, thread }, { status: 201 })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 })
  }
}
