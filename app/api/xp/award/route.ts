import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { xpQueries } from "@/lib/xp/queries"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { activityId, referenceId } = await request.json()

    if (!activityId) {
      return NextResponse.json({ error: "Activity ID required" }, { status: 400 })
    }

    const result = await xpQueries.awardXP(session.user.id, activityId, referenceId)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("XP award error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
