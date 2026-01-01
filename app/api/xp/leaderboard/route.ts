import { NextResponse } from "next/server"
import { xpQueries } from "@/lib/xp/queries"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const leaderboard = await xpQueries.getLeaderboard(limit)

    return NextResponse.json(leaderboard)
  } catch (error: any) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
