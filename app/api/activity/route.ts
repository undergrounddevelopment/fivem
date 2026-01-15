import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[Activity API] Fetching activities...")
    const supabase = getSupabaseAdminClient()

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[Activity API] Database error:", error)
      throw error
    }

    if (!activities) {
      console.log("[Activity API] No activities found")
      return NextResponse.json([])
    }

    // Get unique user IDs
    const userIds = [...new Set(activities.map((a: any) => a.user_id).filter(Boolean))]

    // Fetch users separately
    let usersMap: Record<string, { id: string; username: string; avatar: string }> = {}
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, username, avatar")
        .in("id", userIds)

      if (usersError) {
        console.warn("[Activity API] Failed to fetch users for activities:", usersError)
      }

      usersMap = (users || []).reduce(
        (acc, user) => {
          acc[user.id] = user
          return acc
        },
        {} as Record<string, { id: string; username: string; avatar: string }>,
      )
    }

    const formattedActivities = activities.map((activity: any) => {
      const user = usersMap[activity.user_id]
      return {
        id: activity.id,
        userId: activity.user_id,
        type: activity.type || activity.action || 'activity',
        description: activity.description || activity.action || `${activity.type} activity`,
        action: activity.action || activity.type,
        targetId: activity.target_id || null,
        createdAt: activity.created_at,
        metadata: activity.metadata || {},
        user: user
          ? {
            username: user.username,
            avatar: user.avatar,
          }
          : null,
      }
    })

    console.log(`[Activity API] Returning ${formattedActivities.length} activities`)
    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error("Activity API CRITICAL error:", error)
    return NextResponse.json([], { status: 200 }) // Return empty instead of 500 for UI stability
  }
}
