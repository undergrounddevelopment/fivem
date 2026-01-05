import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { targetId, targetType } = await req.json()
    if (!targetId || !targetType || !['thread', 'reply'].includes(targetType)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const supabase = getSupabase()
    const userId = session.user.id

    const table = targetType === 'thread' ? 'forum_threads' : 'forum_replies'
    
    // Check if already disliked
    const { data: existing } = await supabase
      .from('forum_dislikes')
      .select('id')
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .single()

    if (existing) {
      // Remove dislike
      await supabase.from('forum_dislikes').delete().eq('id', existing.id)
      await supabase.from(table).update({ dislikes: supabase.rpc('greatest', [0, supabase.raw('dislikes - 1')]) }).eq('id', targetId)
      return NextResponse.json({ success: true, disliked: false })
    } else {
      // Add dislike
      await supabase.from('forum_dislikes').insert({ user_id: userId, target_id: targetId, target_type: targetType })
      await supabase.from(table).update({ dislikes: supabase.raw('COALESCE(dislikes, 0) + 1') }).eq('id', targetId)
      return NextResponse.json({ success: true, disliked: true })
    }
  } catch (e: any) {
    console.error('[Dislike]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
