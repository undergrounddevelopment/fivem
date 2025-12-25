import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET - Fetch all testimonials (public gets featured only, admin gets all)
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseAdminClient()
    const session = await getServerSession(authOptions)

    // Check if admin
    let isAdmin = false
    if (session?.user?.id) {
      const { data: userData } = await supabase
        .from("users")
        .select("is_admin, role, membership")
        .eq("discord_id", session.user.id)
        .single()

      isAdmin =
        userData?.is_admin || ["admin", "owner"].includes(userData?.role || "") || userData?.membership === "admin"
    }

    const query = supabase.from("testimonials").select("*").order("created_at", { ascending: false })

    // Non-admin only sees featured/visible testimonials
    if (!isAdmin) {
      query.eq("is_featured", true)
    }

    const { data: testimonials, error } = await query.limit(50)

    if (error) throw error

    return NextResponse.json(testimonials || [])
  } catch (error) {
    console.error("Testimonials error:", error)
    return NextResponse.json([])
  }
}

// POST - Create new testimonial (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseAdminClient()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin
    const { data: userData } = await supabase
      .from("users")
      .select("id, is_admin, role, membership")
      .eq("discord_id", session.user.id)
      .single()

    const isAdmin =
      userData?.is_admin || ["admin", "owner"].includes(userData?.role || "") || userData?.membership === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const { data: testimonial, error } = await supabase
      .from("testimonials")
      .insert({
        username: data.username,
        avatar: data.avatar || null,
        content: data.comment || data.content,
        rating: data.rating || 5,
        server_name: data.serverName || data.server_name || null,
        upvotes_received: data.upvotes || data.upvotes_received || 0,
        is_featured: data.isVisible !== false,
        is_verified: data.isVerified || false,
        badge: data.badge || null,
        image_url: data.imageUrl || data.image_url || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error("Create testimonial error:", error)
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}

// PUT - Update testimonial (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseAdminClient()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin
    const { data: userData } = await supabase
      .from("users")
      .select("id, is_admin, role, membership")
      .eq("discord_id", session.user.id)
      .single()

    const isAdmin =
      userData?.is_admin || ["admin", "owner"].includes(userData?.role || "") || userData?.membership === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    if (data.username !== undefined) updateData.username = data.username
    if (data.avatar !== undefined) updateData.avatar = data.avatar
    if (data.content !== undefined) updateData.content = data.content
    if (data.comment !== undefined) updateData.content = data.comment
    if (data.rating !== undefined) updateData.rating = data.rating
    if (data.serverName !== undefined) updateData.server_name = data.serverName
    if (data.server_name !== undefined) updateData.server_name = data.server_name
    if (data.upvotes !== undefined) updateData.upvotes_received = data.upvotes
    if (data.upvotes_received !== undefined) updateData.upvotes_received = data.upvotes_received
    if (data.isVisible !== undefined) updateData.is_featured = data.isVisible
    if (data.is_featured !== undefined) updateData.is_featured = data.is_featured
    if (data.isVerified !== undefined) updateData.is_verified = data.isVerified
    if (data.is_verified !== undefined) updateData.is_verified = data.is_verified
    if (data.badge !== undefined) updateData.badge = data.badge
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl
    if (data.image_url !== undefined) updateData.image_url = data.image_url
    updateData.updated_at = new Date().toISOString()

    const { data: testimonial, error } = await supabase
      .from("testimonials")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error("Update testimonial error:", error)
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
  }
}

// DELETE - Delete testimonial (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseAdminClient()
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify admin
    const { data: userData } = await supabase
      .from("users")
      .select("id, is_admin, role, membership")
      .eq("discord_id", session.user.id)
      .single()

    const isAdmin =
      userData?.is_admin || ["admin", "owner"].includes(userData?.role || "") || userData?.membership === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("testimonials").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete testimonial error:", error)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}
