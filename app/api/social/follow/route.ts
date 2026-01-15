import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetUserId, action } = await request.json()
    const followerId = session.user.id

    if (followerId === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    if (action === "follow") {
      const { error } = await supabase
        .from("followers")
        .insert({ follower_id: followerId, following_id: targetUserId })

      if (error) {
        // Ignore unique constraint violation (already following)
        if (error.code !== "23505") {
          throw error
        }
      } else {
        // Create notification
        await supabase.from("notifications").insert({
          user_id: targetUserId,
          type: "follow",
          title: "New Follower",
          message: `${session.user.name || "Someone"} started following you`,
          data: { followerId },
        })
      }
    } else if (action === "unfollow") {
      const { error } = await supabase
        .from("followers")
        .delete()
        .match({ follower_id: followerId, following_id: targetUserId })

      if (error) throw error
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error("Follow API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
