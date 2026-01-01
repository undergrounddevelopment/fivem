import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    let query = supabase
      .from("assets")
      .select("*, user:users!assets_user_id_fkey(discord_id, username, avatar)")
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (type !== "all") {
      query = query.eq("type", type)
    }

    const { data: assets, error } = await query

    if (error) throw error

    return NextResponse.json({ assets: assets || [] })
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

    const { error } = await supabase
      .from("assets")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
        rejection_reason: action === "reject" ? reason : null
      })
      .eq("id", id)

    if (error) throw error

    const { data: asset } = await supabase
      .from("assets")
      .select("user_id, title")
      .eq("id", id)
      .single()

    if (asset) {
      await supabase.from("notifications").insert({
        user_id: asset.user_id,
        title: action === "approve" ? "Asset Approved!" : "Asset Rejected",
        message: action === "approve" 
          ? `Your asset "${asset.title}" has been approved and is now live!`
          : `Your asset "${asset.title}" was rejected. Reason: ${reason || "No reason provided"}`,
        type: action === "approve" ? "success" : "warning"
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update asset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
