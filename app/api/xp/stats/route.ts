import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { xpQueries } from "@/lib/xp/queries"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow viewing other user's stats via query param
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId') || session.user.id

    const stats = await xpQueries.getUserXPStats(targetUserId)

    if (!stats) {
      return NextResponse.json({ error: "Stats not found" }, { status: 404 })
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("XP stats error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
