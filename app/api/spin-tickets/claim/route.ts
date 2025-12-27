import { NextResponse } from "next/server"

// SECURITY: This entire endpoint is DISABLED
// Having two claim endpoints (/api/spin-tickets/claim AND /api/spin-wheel/claim-daily)
// allowed users to double-claim tickets - this is a bypass vulnerability
// Use /api/spin-wheel/claim-daily instead

export async function POST() {
  return NextResponse.json(
    { 
      error: "This endpoint is disabled. Use /api/spin-wheel/claim-daily instead.",
      redirect: "/api/spin-wheel/claim-daily"
    },
    { status: 403 }
  )
}

export async function GET() {
  return NextResponse.json(
    { 
      error: "This endpoint is disabled. Use /api/spin-wheel/daily-status instead.",
      redirect: "/api/spin-wheel/daily-status"
    },
    { status: 403 }
  )
}
