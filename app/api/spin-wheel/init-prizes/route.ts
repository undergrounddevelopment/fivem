import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// SECURITY: Admin only - can initialize default prizes
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("spin_wheel_prizes")
      .select("id")
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: "Prizes already exist" })
    }

    const defaultPrizes = [
      { name: "Nothing", type: "nothing", coins: 0, probability: 30.00, color: "#6B7280", rarity: "common", sort_order: 1, is_active: true },
      { name: "10 Coins", type: "coins", coins: 10, probability: 25.00, color: "#3B82F6", rarity: "common", sort_order: 2, is_active: true },
      { name: "25 Coins", type: "coins", coins: 25, probability: 20.00, color: "#10B981", rarity: "uncommon", sort_order: 3, is_active: true },
      { name: "50 Coins", type: "coins", coins: 50, probability: 15.00, color: "#F59E0B", rarity: "rare", sort_order: 4, is_active: true },
      { name: "100 Coins", type: "coins", coins: 100, probability: 7.00, color: "#EF4444", rarity: "epic", sort_order: 5, is_active: true },
      { name: "250 Coins", type: "coins", coins: 250, probability: 2.00, color: "#8B5CF6", rarity: "epic", sort_order: 6, is_active: true },
      { name: "Jackpot 500", type: "coins", coins: 500, probability: 0.50, color: "#EC4899", rarity: "legendary", sort_order: 7, is_active: true }
    ]

    const { data, error } = await supabase
      .from("spin_wheel_prizes")
      .insert(defaultPrizes)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, prizes: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("spin_wheel_prizes")
      .select("*")
      .order("sort_order")

    if (error) throw error

    return NextResponse.json({ prizes: data || [], count: data?.length || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
