import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")
    const all = searchParams.get("all")

    let query = supabase.from("banners").select("*").order("sort_order", { ascending: true })

    if (all !== "true") {
      query = query.eq("is_active", true)
    }

    if (position) {
      query = query.eq("position", position)
    }

    const { data: banners, error } = await query

    if (error) throw error

    return NextResponse.json({ banners: banners || [] })
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ banners: [] })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Check if user is admin
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
    const { title, image_url, link, position, sort_order } = body

    const { data, error } = await supabase
      .from("banners")
      .insert({
        title,
        image_url,
        link,
        position: position || "top",
        sort_order: sort_order || 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ banner: data })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Check if user is admin
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
    const { id, ...updates } = body

    const { data, error } = await supabase
      .from("banners")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ banner: data })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Check if user is admin
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
      return NextResponse.json({ error: "Banner ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("banners").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
}
