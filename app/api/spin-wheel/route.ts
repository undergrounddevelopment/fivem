import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/spin-wheel/prizes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'prizes') {
      const prizes = await db.spinWheel.getPrizes()
      return NextResponse.json({ success: true, data: prizes })
    }

    if (action === 'tickets') {
      const userId = searchParams.get('userId')
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID required' },
          { status: 400 }
        )
      }
      const tickets = await db.spinWheel.getTickets(userId)
      return NextResponse.json({ success: true, data: tickets })
    }

    if (action === 'history') {
      const userId = searchParams.get('userId')
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID required' },
          { status: 400 }
        )
      }
      const history = await db.spinWheel.getHistory(userId)
      return NextResponse.json({ success: true, data: history })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in spin wheel GET:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// POST - DISABLED for security - use /api/spin-wheel/spin instead
// This endpoint was insecure because it accepted userId from body without authentication
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'This endpoint is disabled. Use /api/spin-wheel/spin instead.' },
    { status: 403 }
  )
}
