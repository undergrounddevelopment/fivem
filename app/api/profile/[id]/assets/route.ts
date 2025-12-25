import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdminClient()

    // Get user first to get discord_id
    const { data: user } = await supabase
      .from("users")
      .select("discord_id")
      .or(`id.eq.${id},discord_id.eq.${id}`)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get recent assets
    const { data: assets, error } = await supabase
      .from("assets")
      .select("id, title, category, downloads, created_at, thumbnail")
      .eq("author_id", user.discord_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ assets: assets || [] })
  } catch (error) {
    console.error("Error fetching user assets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
