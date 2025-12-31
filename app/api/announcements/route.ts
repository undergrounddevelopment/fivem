import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

// GET - Fetch active announcements
export async function GET() {
  try {
    const supabase = await createAdminClient()

    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) throw error

    return NextResponse.json({ announcements: announcements || [] })
  } catch (error) {
    return NextResponse.json({ announcements: [] })
  }
}

// POST - Create new announcement (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    const isAdmin = user?.is_admin === true || user?.membership === "admin"
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, message, type, is_dismissible, sort_order } = body

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title,
        message,
        type: type || "info",
        is_active: true,
        is_dismissible: is_dismissible ?? true,
        sort_order: sort_order || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ announcement: data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
  }
}

// PUT - Update announcement (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    const isAdmin = user?.is_admin === true || user?.membership === "admin"
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, message, type, is_active, is_dismissible, sort_order } = body

    const updateData: any = { updated_at: new Date().toISOString() }
    if (title !== undefined) updateData.title = title
    if (message !== undefined) updateData.message = message
    if (type !== undefined) updateData.type = type
    if (is_active !== undefined) updateData.is_active = is_active
    if (is_dismissible !== undefined) updateData.is_dismissible = is_dismissible
    if (sort_order !== undefined) updateData.sort_order = sort_order

    const { data, error } = await supabase.from("announcements").update(updateData).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json({ announcement: data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 })
  }
}

// DELETE - Delete announcement (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    const isAdmin = user?.is_admin === true || user?.membership === "admin"
    if (!isAdmin) {
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
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
  }
}
