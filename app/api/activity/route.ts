import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseAdminClient()

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) throw error

    // Get unique user IDs
    const userIds = [...new Set((activities || []).map((a) => a.user_id).filter(Boolean))]

    // Fetch users separately
    let usersMap: Record<string, any> = {}
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("discord_id, username, avatar")
        .in("discord_id", userIds)

      usersMap = (users || []).reduce(
        (acc, user) => {
          acc[user.discord_id] = user
          return acc
        },
        {} as Record<string, any>,
      )
    }

    const formattedActivities = (activities || []).map((activity) => {
      const user = usersMap[activity.user_id]
      return {
        id: activity.id,
        userId: activity.user_id,
        type: activity.type,
        action: activity.action,
        targetId: activity.target_id,
        createdAt: activity.created_at,
        user: user
          ? {
              username: user.username,
              avatar: user.avatar,
            }
          : null,
      }
    })

    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error("Activity error:", error)
    return NextResponse.json([])
  }
}
