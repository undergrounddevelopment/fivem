import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('coins, spin_tickets, xp, level')
      .eq('discord_id', session.user.id)
      .single()

    if (error) {
      console.error('[API User Balance] Error:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      coins: user.coins || 0,
      spin_tickets: user.spin_tickets || 0,
      xp: user.xp || 0,
      level: user.level || 1
    })
  } catch (error) {
    console.error('[API User Balance] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}