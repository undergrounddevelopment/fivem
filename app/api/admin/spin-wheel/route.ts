import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET: Fetch all prizes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = getSupabaseAdminClient()
    const { data: prizes, error } = await supabase
      .from("spin_wheel_prizes")
      .select("*")
      .order("value", { ascending: true })

    if (error) throw error

    return NextResponse.json({ prizes })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch prizes" }, { status: 500 })
  }
}

// POST: Create a new prize
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const supabase = getSupabaseAdminClient()

    const { error } = await supabase
      .from("spin_wheel_prizes")
      .insert([body])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create prize" }, { status: 500 })
  }
}

// PUT: Update an existing prize
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
