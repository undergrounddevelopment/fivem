import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/coins/balance - SECURED: requires authentication
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const balance = await db.coins.getUserBalance(session.user.id)

    return NextResponse.json({
      success: true,
      data: { balance },
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}

// POST /api/coins/claim-daily - SECURED: requires authentication
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const claimType = 'coins'
    const amount = 100

    // Check if can claim
    const canClaim = await db.coins.canClaimDaily(userId, claimType)
    
    if (!canClaim) {
      return NextResponse.json(
        { success: false, error: 'Already claimed today' },
        { status: 400 }
      )
    }

    // Claim reward
    const result = await db.coins.claimDailyReward(userId, claimType, amount)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error claiming daily:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to claim daily reward' },
      { status: 500 }
    )
  }
}
