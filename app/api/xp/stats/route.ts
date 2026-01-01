import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { xpQueries } from "@/lib/xp/queries"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await xpQueries.getUserXPStats(session.user.id)

    if (!stats) {
      return NextResponse.json({ error: "Stats not found" }, { status: 404 })
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("XP stats error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
