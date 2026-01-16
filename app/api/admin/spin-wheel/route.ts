import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

// GET: Fetch prizes, settings, and history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "prizes"
    const supabase = getSupabaseAdminClient()

    if (type === "settings") {
      const { data: settings } = await supabase.from("spin_settings").select("*")
      const settingsMap = (settings || []).reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {})
      return NextResponse.json({ settings: settingsMap })
    }

    if (type === "history") {
      const { data: history } = await supabase
        .from("spin_wheel_history")
        .select("*, prize:spin_wheel_prizes(*), user:users(username, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(20)
      return NextResponse.json({ history })
    }

    const { data: prizes, error } = await supabase
      .from("spin_wheel_prizes")
      .select("*")
      .order("value", { ascending: true })

    if (error) throw error
    return NextResponse.json({ prizes })
  } catch (error) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 })
  }
}

// POST: Create prize or Update settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { action, ...data } = body
    const supabase = getSupabaseAdminClient()

    if (action === "update_settings") {
      const updates = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value),
        updated_at: new Date().toISOString()
      }))
      
      const { error } = await supabase
        .from("spin_settings")
        .upsert(updates, { onConflict: "key" })
        
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    const { error } = await supabase
      .from("spin_wheel_prizes")
      .insert([data])

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 })
  }
}

// PUT: Update an existing prize
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, ...updates } = await request.json()
    const supabase = getSupabaseAdminClient()

    const { error } = await supabase
      .from("spin_wheel_prizes")
      .update(updates)
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update prize" }, { status: 500 })
  }
}

// DELETE: Remove a prize
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const supabase = getSupabaseAdminClient()
    const { error } = await supabase
      .from("spin_wheel_prizes")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete prize" }, { status: 500 })
  }
}
