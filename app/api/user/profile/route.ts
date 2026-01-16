import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const discordId = session.user.id

    // Fetch user coins from 'users' table
    
    // 1. Get User
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, coins, spin_tickets, username, avatar_url')
      .eq('discord_id', discordId)
      .single()

    if (userError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Tickets are now in users table
    return NextResponse.json({
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        coins: user.coins || 0,
        tickets: user.spin_tickets || 0
    })

  } catch (error) {
    console.error('[API User Profile] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
