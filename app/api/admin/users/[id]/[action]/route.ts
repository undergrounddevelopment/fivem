import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateAdminRole } from '@/lib/security'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!validateAdminRole(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId, action } = await params

    if (!['ban', 'unban'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const isBanned = action === 'ban'
    const supabase = getSupabase()

    console.log(`[Admin] Attempting to ${action} user:`, userId)

    // Try to update by id first
    let { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
        is_banned: isBanned,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    // If not found by id, try discord_id
    if (error || !updatedUser) {
      console.log('[Admin] Trying discord_id...')
      const result = await supabase
        .from('users')
        .update({ 
          is_banned: isBanned,
          updated_at: new Date().toISOString()
        })
        .eq('discord_id', userId)
        .select()
        .single()
      
      updatedUser = result.data
      error = result.error
    }

    if (error || !updatedUser) {
      console.error('[Admin] Update failed:', error)
      return NextResponse.json({ 
        error: 'User not found or update failed',
        details: error?.message
      }, { status: 404 })
    }

    console.log(`[Admin] User ${userId} ${action}ned successfully by ${session.user?.id}`)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${action}ned successfully`
    })

  } catch (error) {
    console.error(`[Admin Ban/Unban] Error:`, error)
    return NextResponse.json({ 
      error: 'Failed to update user status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
