import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

// GET - Fetch forum settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get categories with counts
    const { data: categories } = await supabase.from("forum_categories").select("*").order("sort_order", { ascending: true })

    // Get forum settings
    const { data: settings } = await supabase.from("site_settings").select("*").eq("category", "forum")

    return NextResponse.json({
      categories: categories || [],
      settings: settings || [],
    })
  } catch (error) {
    console.error("Error fetching forum settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// POST - Create category
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, icon, color, order, is_active } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    const { data, error } = await supabase
      .from("forum_categories")
      .insert({
        id: slug,
        name,
        description: description || "",
        icon: icon || "message-circle",
        color: color || "#3B82F6",
        sort_order: order || 0,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ category: data, success: true })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

// PUT - Update category or settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { type, id, ...updates } = body

    if (type === "category") {
      const { data, error } = await supabase
        .from("forum_categories")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ category: data, success: true })
    } else if (type === "setting") {
      // Upsert setting
      const { data, error } = await supabase
        .from("site_settings")
        .upsert({
          key: id,
          value: updates.value,
          category: "forum",
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ setting: data, success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error updating:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

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
      return NextResponse.json({ error: "Category ID required" }, { status: 400 })
    }

    // Check if category has threads
    const { count } = await supabase
      .from("forum_threads")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id)

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with existing threads",
        },
        { status: 400 },
      )
    }

    const { error } = await supabase.from("forum_categories").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
