import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function mapLegacyTypeToCategory(type: string) {
  switch (type) {
    case "script":
      return "scripts"
    case "vehicle":
      return "vehicles"
    default:
      return type
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: userData } = await supabase
      .from("users")
      .select("membership")
      .eq("discord_id", session.user.id)
      .single()

    if (userData?.membership !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"
    const status = searchParams.get("status") || "pending"

    let query = supabase.from("assets").select("*").eq("status", status).order("created_at", { ascending: false })

    if (type !== "all") {
      query = query.eq("category", mapLegacyTypeToCategory(type))
    }

    const { data: assets, error } = await query

    if (error) throw error

    const safeAssets = assets || []
    const authorIds = Array.from(new Set(safeAssets.map((a: any) => a.author_id).filter(Boolean)))
    const { data: users, error: usersError } = authorIds.length
      ? await supabase.from("users").select("discord_id, username, avatar").in("discord_id", authorIds)
      : { data: [], error: null }

    if (usersError) throw usersError
    const usersByDiscordId = new Map<string, any>()
    for (const u of users || []) usersByDiscordId.set(u.discord_id, u)

    const hydrated = safeAssets.map((asset: any) => {
      const author = usersByDiscordId.get(asset.author_id)
      return {
        ...asset,
        user: author ? { username: author.username, avatar: author.avatar } : { username: "Unknown", avatar: null },
        image_url: asset.thumbnail,
        download_url: asset.download_link,
        type: asset.category,
      }
    })

    return NextResponse.json({ assets: hydrated })
  } catch (error) {
    console.error("Pending assets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { data: userData } = await supabase
      .from("users")
      .select("membership")
      .eq("discord_id", session.user.id)
      .single()

    if (userData?.membership !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, action, reason } = body

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "active" : "rejected"

    const updatePayload: any = {
      status: newStatus,
    }

    let updateError: any = null
    const { error: firstUpdateError } = await supabase.from("assets").update(updatePayload).eq("id", id)
    updateError = firstUpdateError
    if (updateError) throw updateError

    const { data: asset } = await supabase.from("assets").select("author_id, title").eq("id", id).single()

    if (asset) {
      const notificationPayload: any = {
        user_id: asset.author_id,
        type: "system",
        title: action === "approve" ? "Asset Approved!" : "Asset Rejected",
        message:
          action === "approve"
            ? `Your asset "${asset.title}" has been approved and is now live!`
            : `Your asset "${asset.title}" was rejected. Reason: ${reason || "No reason provided"}`,
        link: `/asset/${id}`,
        is_read: false,
      }

      const { error: notifError } = await supabase.from("notifications").insert(notificationPayload)
      if (notifError) {
        await supabase.from("notifications").insert({
          user_id: asset.author_id,
          type: notificationPayload.type,
          title: notificationPayload.title,
          message: notificationPayload.message,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update asset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
