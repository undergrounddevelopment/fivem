import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdminAccess(userId: string) {
  const supabase = getSupabase()
  
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

async function findUser(userId: string) {
  const supabase = getSupabase()
  
  // Try discord_id
  let { data } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', userId)
    .single()

  // Try UUID
  if (!data) {
    const { data: byUuid } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    data = byUuid
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action, reason } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
    }

    if (!['ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const targetUser = await findUser(userId)
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent banning admins
    if (targetUser.is_admin || targetUser.membership === 'admin') {
      return NextResponse.json({ error: 'Cannot ban admin users' }, { status: 403 })
    }

    const supabase = getSupabase()
    const isBanning = action === 'ban'

    // Update by discord_id
    await supabase
      .from('users')
      .update({
        is_banned: isBanning,
        ban_reason: isBanning ? (reason || 'No reason provided') : null,
        updated_at: new Date().toISOString()
      })
      .eq('discord_id', targetUser.discord_id)

    return NextResponse.json({
      success: true,
      message: `User ${isBanning ? 'banned' : 'unbanned'} successfully`,
      user: { id: targetUser.id, username: targetUser.username, is_banned: isBanning }
    })

  } catch (error: any) {
    console.error('Ban API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const supabase = getSupabase()
    const { data: bannedUsers } = await supabase
      .from('users')
      .select('id, discord_id, username, avatar, is_banned, ban_reason, created_at')
      .eq('is_banned', true)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      bannedUsers: bannedUsers || [],
      count: bannedUsers?.length || 0
    })

  } catch (error: any) {
    console.error('Get banned users error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
