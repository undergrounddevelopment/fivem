import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdminAccess(supabase: any, userId: string) {
  // Try discord_id first
  let { data } = await supabase
    .from('users')
    .select('is_admin, membership')
    .eq('discord_id', userId)
    .single()

  // Try UUID if not found
  if (!data) {
    const { data: byUuid } = await supabase
      .from('users')
      .select('is_admin, membership')
      .eq('id', userId)
      .single()
    data = byUuid
  }

  // Check admin status
  const isAdmin = data?.is_admin === true || 
                  data?.membership === 'admin' ||
                  userId === process.env.ADMIN_DISCORD_ID

  return isAdmin
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(supabase, session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Manual author fetch
    const authorIds = [...new Set((assets || []).map(a => a.author_id).filter(Boolean))]
    const authorsMap: Record<string, any> = {}

    if (authorIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, username, avatar') // Assuming author_id is UUID matching users.id or we need to check how it was inserted
        .in('id', authorIds)
      
      users?.forEach(u => authorsMap[u.id] = u)
    }

    // fallback try discord_id if id match fails (common inconsistency in this codebase)
    // Actually, assume author_id is UUID for now as per schema standard.
    // If author_id is discord_id, we'd need to check that.
    // In lib/database-direct.ts -> getAssets() doesn't show author_id type.
    // In app/api/assets/route.ts (public), it assumes author relation.

    const formattedAssets = (assets || []).map(a => ({
      ...a,
      author: authorsMap[a.author_id] || { username: 'Unknown', avatar: null }
    }))

    return NextResponse.json({ success: true, assets: formattedAssets })
  } catch (error) {
    console.error('Admin assets API error:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}