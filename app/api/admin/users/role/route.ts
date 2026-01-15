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
    const { userId, membership, isAdmin: makeAdmin } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const validMemberships = ['free', 'premium', 'vip', 'staff', 'admin']
    if (!membership || !validMemberships.includes(membership)) {
      return NextResponse.json({ error: 'Invalid membership level' }, { status: 400 })
    }

    const targetUser = await findUser(userId)
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent changing own role
    if (targetUser.discord_id === session.user.id || targetUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 403 })
    }

    const supabase = getSupabase()

    // Update user role and membership
    const updateData: any = {
      membership,
      is_admin: makeAdmin === true,
      updated_at: new Date().toISOString()
    }

    // If making admin, also set role
    if (makeAdmin) {
      updateData.role = 'admin'
    } else if (membership === 'staff') {
      updateData.role = 'staff'
    } else {
      updateData.role = 'member'
    }

    // Update by discord_id
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('discord_id', targetUser.discord_id)

    if (error) {
      console.error('Role update error:', error)
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
    }

    // Log the role change
    try {
      await supabase.from('admin_logs').insert({
        admin_id: session.user.id,
        action: 'role_change',
        target_user_id: targetUser.discord_id,
        details: `Changed role to ${membership}${makeAdmin ? ' (Admin)' : ''}`,
        created_at: new Date().toISOString()
      })
    } catch (logError) {
      console.error('Failed to log role change:', logError)
      // Don't fail the request for logging errors
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${membership}${makeAdmin ? ' (Admin)' : ''}`,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        membership,
        is_admin: makeAdmin
      }
    })

  } catch (error: any) {
    console.error('Role change API error:', error)
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
    
    // Get role statistics
    const { data: roleStats } = await supabase
      .from('users')
      .select('membership, is_admin')
      .not('membership', 'is', null)

    const stats = {
      free: roleStats?.filter(u => u.membership === 'free').length || 0,
      premium: roleStats?.filter(u => u.membership === 'premium').length || 0,
      vip: roleStats?.filter(u => u.membership === 'vip').length || 0,
      staff: roleStats?.filter(u => u.membership === 'staff').length || 0,
      admin: roleStats?.filter(u => u.membership === 'admin' || u.is_admin).length || 0,
      total: roleStats?.length || 0
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error('Get role stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}