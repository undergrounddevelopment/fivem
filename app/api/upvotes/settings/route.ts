import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET - Fetch upvote settings
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    
    const { data, error } = await supabase
      .from("upvote_settings")
      .select("*")
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    // Default settings if not found
    if (!data) {
      return NextResponse.json({
        min_upvotes: 1,
        max_upvotes: 50000,
        default_upvotes: 100,
        updated_at: new Date().toISOString()
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Get upvote settings error:", error)
    return NextResponse.json({
      min_upvotes: 1,
      max_upvotes: 50000,
      default_upvotes: 100
    })
  }
}

// PUT - Update upvote settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Verify admin
    const { data: userData } = await supabase
      .from("users")
      .select("is_admin, role, membership")
      .eq("discord_id", session.user.id)
      .single()

    const isAdmin = userData?.is_admin || 
      ["admin", "owner"].includes(userData?.role || "") || 
      userData?.membership === "admin"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { min_upvotes, max_upvotes, default_upvotes } = body

    // Validation
    if (min_upvotes < 1 || max_upvotes > 100000 || min_upvotes >= max_upvotes) {
      return NextResponse.json({ error: "Invalid values" }, { status: 400 })
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from("upvote_settings")
      .select("id")
      .single()

    let result
    if (existing) {
      result = await supabase
        .from("upvote_settings")
        .update({
          min_upvotes,
          max_upvotes,
          default_upvotes,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from("upvote_settings")
        .insert({
          min_upvotes,
          max_upvotes,
          default_upvotes
        })
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Update upvote settings error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
