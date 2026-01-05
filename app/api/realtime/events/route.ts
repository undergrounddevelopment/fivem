import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

function mapActivityType(type: string): {
  type: "user_joined" | "asset_uploaded" | "forum_post" | "download" | "purchase" | "achievement" | "system"
  priority: "low" | "medium" | "high"
  title: string
} {
  switch (type) {
    case "user_joined":
      return { type: "user_joined", priority: "medium", title: "New User Joined" }
    case "asset_uploaded":
      return { type: "asset_uploaded", priority: "medium", title: "New Asset Uploaded" }
    case "forum_post":
      return { type: "forum_post", priority: "low", title: "New Forum Thread" }
    case "download":
      return { type: "download", priority: "low", title: "Asset Downloaded" }
    default:
      return { type: "system", priority: "low", title: "System Event" }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit") || 50) || 50, 100)

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    const userIds = [...new Set((activities || []).map((a: any) => a.user_id).filter(Boolean))]
    let usersMap: Record<string, { id: string; username: string; avatar: string | null }> = {}

    if (userIds.length > 0) {
      const { data: users } = await supabase.from("users").select("id, username, avatar").in("id", userIds)
      usersMap = (users || []).reduce(
        (acc, u: any) => {
          acc[u.id] = u
          return acc
        },
        {} as Record<string, { id: string; username: string; avatar: string | null }>,
      )
    }

    const events = (activities || []).map((activity: any) => {
      const mapped = mapActivityType(activity.type)
      const user = activity.user_id ? usersMap[activity.user_id] : null

      return {
        id: String(activity.id),
        type: mapped.type,
        title: mapped.title,
        description: activity.description || activity.action || `${activity.type} activity`,
        user: user
          ? {
              id: user.id,
              username: user.username,
              avatar: user.avatar || "/placeholder-user.jpg",
            }
          : undefined,
        metadata: activity.metadata || {},
        timestamp: activity.created_at,
        priority: mapped.priority,
      }
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    console.error("[realtime/events] Error:", error)
    return NextResponse.json({ success: false, data: [] }, { status: 500 })
  }
}
