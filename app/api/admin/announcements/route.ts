import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

// GET - Fetch all announcements for admin
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all")

    let query = supabase.from("announcements").select("*").order("created_at", { ascending: false })

    if (all !== "true") {
      query = query.eq("is_active", true)
    }

    const { data: announcements, error } = await query

    if (error) throw error

    return NextResponse.json({ announcements: announcements || [] })
  } catch (error) {
    return NextResponse.json({ announcements: [], error: String(error) })
  }
}

// POST - Create a new announcement
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, message, type, is_dismissible, sort_order, link, start_date, end_date } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title: title || null,
        message,
        type: type || "info",
        is_active: true,
        is_dismissible: is_dismissible ?? true,
        sort_order: sort_order || 0,
        link: link || null,
        start_date: start_date || null,
        end_date: end_date || null,
        created_by: (session.user as any).discord_id || session.user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ announcement: data, success: true })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
  }
}

// PUT - Update an existing announcement
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("announcements")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ announcement: data, success: true })
  } catch (error) {
    console.error("Error updating announcement:", error)
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 })
  }
}

// DELETE - Delete an announcement
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("announcements").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
  }
}
