import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Direct Supabase connection
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const discordId = session.user.id

    // Get user's last claim time
    const { data: user, error } = await supabase
      .from('users')
      .select('coins')
      .eq('discord_id', discordId)
      .single()

    if (error || !user) {
      return NextResponse.json({ canClaim: true, hoursUntilReset: 0, minutesUntilReset: 0 })
    }

    // Try to get last_daily_claim if column exists
    let lastClaim: Date | null = null
    try {
      const { data: claimData } = await supabase
        .from('users')
        .select('last_daily_claim')
        .eq('discord_id', discordId)
        .single()
      
      if (claimData?.last_daily_claim) {
        lastClaim = new Date(claimData.last_daily_claim)
      }
    } catch {
      // Column might not exist, allow claim
    }

    const now = new Date()

    if (!lastClaim) {
      return NextResponse.json({ canClaim: true, hoursUntilReset: 0, minutesUntilReset: 0, coins: user.coins || 0 })
    }

    // Check if 24 hours have passed
    const hoursSinceClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)
    const canClaim = hoursSinceClaim >= 24

    if (canClaim) {
      return NextResponse.json({ canClaim: true, hoursUntilReset: 0, minutesUntilReset: 0, coins: user.coins || 0 })
    }

    // Calculate time until reset
    const resetTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
    const msUntilReset = resetTime.getTime() - now.getTime()
    const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60))
    const minutesUntilReset = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60))

    return NextResponse.json({
      canClaim: false,
      hoursUntilReset,
      minutesUntilReset,
      coins: user.coins || 0,
      nextClaimAt: resetTime.toISOString()
    })
  } catch (e: any) {
    console.error('[Daily Status]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
