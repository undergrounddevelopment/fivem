import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateAdminRole } from '@/lib/security'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!validateAdminRole(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('asset_comments')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: comments, error } = await query

    if (error) throw error

    // Manually fetch authors to be safe
    const userIds = [...new Set((comments || []).map(c => c.user_id).filter(Boolean))]
    const authorsMap: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('discord_id, username, avatar')
        .in('discord_id', userIds)
      
      users?.forEach(u => authorsMap[u.discord_id] = u)
    }

    const formattedComments = (comments || []).map(c => ({
      ...c,
      author: authorsMap[c.user_id] || { username: 'Unknown', avatar: null }
    }))

    return NextResponse.json({ success: true, comments: formattedComments })

  } catch (error) {
    console.error('[Admin Comments] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
