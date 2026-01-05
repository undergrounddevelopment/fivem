import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: banners, error } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ banners: banners || [] })
  } catch (error) {
    console.error("Banners fetch error:", error)
    return NextResponse.json({ banners: [] })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Check if user is admin
    const { data: user } = await supabase
      .from("users")
      .select("is_admin")
      .eq("discord_id", session.user.id)
      .single()

    if (!user?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, image_url, link, position, sort_order, start_date, end_date } = body

    if (!image_url) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("banners")
      .insert({
        title: title || null,
        image_url,
        link: link || null,
        position: position || "top",
        sort_order: sort_order || 0,
        start_date: start_date || null,
        end_date: end_date || null,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ banner: data })
  } catch (error) {
    console.error("Banner create error:", error)
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Check if user is admin
    const { data: user } = await supabase
      .from("users")
      .select("is_admin")
      .eq("discord_id", session.user.id)
      .single()

    if (!user?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("banners")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ banner: data })
  } catch (error) {
    console.error("Banner update error:", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Check if user is admin
    const { data: user } = await supabase
      .from("users")
      .select("is_admin")
      .eq("discord_id", session.user.id)
      .single()

    if (!user?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Banner ID is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Banner delete error:", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
}
