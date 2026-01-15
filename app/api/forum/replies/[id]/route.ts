import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: replyId } = await params
    const supabase = getSupabase()
    const userId = session.user.id

    // Get reply
    const { data: reply } = await supabase
      .from('forum_replies')
      .select('author_id, thread_id')
      .eq('id', replyId)
      .single()

    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 })
    }

    // Get user to check if author or admin
    const { data: user } = await supabase
      .from('users')
      .select('id, discord_id, membership')
      .eq('discord_id', userId)
      .single()

    const isAuthor = user?.id === reply.author_id
    const isAdmin = user?.membership === 'admin' || session.user.email?.includes('admin')

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete
    await supabase
      .from('forum_replies')
      .update({ is_deleted: true })
      .eq('id', replyId)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[Delete Reply]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
