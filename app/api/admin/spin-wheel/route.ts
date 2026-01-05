import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// Helper to check admin status
async function checkAdmin(supabase: any, discordId: string): Promise<boolean> {
  const { data } = await supabase.from("users").select("is_admin").eq("discord_id", discordId).single()
  return data?.is_admin === true
}

// GET - Fetch all prizes for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    if (!await checkAdmin(supabase, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: prizes, error } = await supabase
      .from("spin_wheel_prizes")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw error

    // Get spin statistics
    const { data: stats } = await supabase
      .from("spin_history")
      .select("id, coins_won, created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const totalSpins = stats?.length || 0
    const totalCoinsWon = stats?.reduce((sum, s) => sum + (s.coins_won || 0), 0) || 0

    return NextResponse.json({ 
      prizes: prizes || [],
      stats: {
        totalSpins,
        totalCoinsWon,
        avgCoinsPerSpin: totalSpins > 0 ? Math.round(totalCoinsWon / totalSpins) : 0
      }
    })
  } catch (error) {
    console.error("Error fetching prizes:", error)
    return NextResponse.json({ error: "Failed to fetch prizes" }, { status: 500 })
  }
}

// POST - Create new prize
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    if (!await checkAdmin(supabase, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, value, probability, color, icon, is_active, sort_order } = body

    if (!name || value === undefined || probability === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: prize, error } = await supabase
      .from("spin_wheel_prizes")
      .insert({
        name,
        type: type || "coins",
        value: Number(value),
        probability: Number(probability),
        color: color || "#6B7280",
        icon: icon || "coins",
        is_active: is_active !== false,
        sort_order: sort_order || 1
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, prize })
  } catch (error) {
    console.error("Error creating prize:", error)
    return NextResponse.json({ error: "Failed to create prize" }, { status: 500 })
  }
}

// PUT - Update prize
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    if (!await checkAdmin(supabase, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Prize ID required" }, { status: 400 })
    }

    const { data: prize, error } = await supabase
      .from("spin_wheel_prizes")
      .update({
        ...updates,
        value: updates.value !== undefined ? Number(updates.value) : undefined,
        probability: updates.probability !== undefined ? Number(updates.probability) : undefined
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, prize })
  } catch (error) {
    console.error("Error updating prize:", error)
    return NextResponse.json({ error: "Failed to update prize" }, { status: 500 })
  }
}

// DELETE - Delete prize
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    if (!await checkAdmin(supabase, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Prize ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("spin_wheel_prizes")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prize:", error)
    return NextResponse.json({ error: "Failed to delete prize" }, { status: 500 })
  }
}
