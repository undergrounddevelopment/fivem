import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Use public_notifications table instead of notifications
    const { data: notifications, error } = await supabase
      .from("public_notifications")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Public notifications fetch error:", error)
      return NextResponse.json({ notifications: [] })
    }

    return NextResponse.json({ notifications: notifications || [] })
  } catch (error) {
    console.error("Error fetching public notifications:", error)
    return NextResponse.json({ notifications: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { title, message, type, link, asset_id, expires_at, created_by } = body

    const { data, error } = await supabase
      .from("public_notifications")
      .insert({
        title,
        message,
        type: type || "info",
        link,
        asset_id,
        expires_at,
        created_by,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification: data })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
