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

const DAILY_REWARD = 50 // Coins per day

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const discordId = session.user.id

    // Get user
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, discord_id, coins, xp')
      .eq('discord_id', discordId)
      .single()

    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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

    if (lastClaim) {
      const hoursSinceClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)
      if (hoursSinceClaim < 24) {
        const resetTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
        const msUntilReset = resetTime.getTime() - now.getTime()
        const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60))
        const minutesUntilReset = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60))
        
        return NextResponse.json({
          error: 'Already claimed today',
          canClaim: false,
          hoursUntilReset,
          minutesUntilReset
        }, { status: 400 })
      }
    }

    // Claim reward
    const newCoins = (user.coins || 0) + DAILY_REWARD
    const newXp = (user.xp || 0) + 10 // Bonus XP for daily login

    // First try update with last_daily_claim
    const { error: updateErr } = await supabase
      .from('users')
      .update({
        coins: newCoins,
        xp: newXp,
        last_daily_claim: now.toISOString()
      })
      .eq('discord_id', discordId)

    // If failed due to missing column, try without it
    if (updateErr && updateErr.message?.includes('last_daily_claim')) {
      const { error: fallbackErr } = await supabase
        .from('users')
        .update({
          coins: newCoins,
          xp: newXp
        })
        .eq('discord_id', discordId)
      
      if (fallbackErr) {
        console.error('[Daily Claim] Fallback update error:', fallbackErr)
        return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
      }
    } else if (updateErr) {
      console.error('[Daily Claim] Update error:', updateErr)
      return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reward: DAILY_REWARD,
      xpBonus: 10,
      newBalance: newCoins,
      message: `You received ${DAILY_REWARD} coins and 10 XP!`
    })
  } catch (e: any) {
    console.error('[Daily Claim]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
