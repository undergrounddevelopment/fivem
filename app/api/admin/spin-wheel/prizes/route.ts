import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 }
  }

  const supabase = await createAdminClient()
  const { data: userData } = await supabase.from("users").select("id, role").eq("discord_id", session.user.id).single()

  if (!userData?.role || !["admin", "owner", "vip"].includes(userData.role)) {
    return { error: "Forbidden", status: 403 }
  }

  return { session, supabase, userData }
}

export async function GET() {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data: prizes, error } = await auth.supabase.from("spin_wheel_prizes").select("*").order("sort_order")

    if (error) throw error

    return NextResponse.json({ prizes: prizes || [] })
  } catch (error) {
    console.error("Error fetching prizes:", error)
    return NextResponse.json({ error: "Failed to fetch prizes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { name, coins, color, probability, is_active, sort_order, image_url, rarity, description } = body

    const { data, error } = await auth.supabase
      .from("spin_wheel_prizes")
      .insert({
        name,
        coins: Number(coins) || 0,
        color: color || "#3b82f6",
        probability: Number(probability) || 10,
        is_active: is_active !== false,
        sort_order: Number(sort_order) || 0,
        image_url: image_url || null,
        rarity: rarity || "common",
        description: description || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ prize: data })
  } catch (error) {
    console.error("Error creating prize:", error)
    return NextResponse.json({ error: "Failed to create prize" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Prize ID required" }, { status: 400 })
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.coins !== undefined) updateData.coins = Number(updates.coins)
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.probability !== undefined) updateData.probability = Number(updates.probability)
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active
    if (updates.sort_order !== undefined) updateData.sort_order = Number(updates.sort_order)
    if (updates.image_url !== undefined) updateData.image_url = updates.image_url || null
    if (updates.rarity !== undefined) updateData.rarity = updates.rarity || "common"
    if (updates.description !== undefined) updateData.description = updates.description || null

    const { data, error } = await auth.supabase
      .from("spin_wheel_prizes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ prize: data })
  } catch (error) {
    console.error("Error updating prize:", error)
    return NextResponse.json({ error: "Failed to update prize" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Support both body and query param
    const { searchParams } = new URL(request.url)
    let id = searchParams.get("id")

    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {
        // No body provided
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Prize ID required" }, { status: 400 })
    }

    const { error } = await auth.supabase.from("spin_wheel_prizes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting prize:", error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prize:", error)
    return NextResponse.json({ error: "Failed to delete prize" }, { status: 500 })
  }
}
