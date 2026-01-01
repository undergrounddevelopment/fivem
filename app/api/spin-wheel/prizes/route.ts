import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: prizes, error } = await supabase
      .from("spin_wheel_prizes")
      .select("id, name, type, value as coins, probability, color, icon, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    // If no prizes, return default
    if (!prizes || prizes.length === 0) {
      return NextResponse.json({ 
        prizes: [
          { id: '1', name: 'Nothing', coins: 0, color: '#6B7280', probability: 30, icon: 'x', sort_order: 1 },
          { id: '2', name: '10 Coins', coins: 10, color: '#3B82F6', probability: 25, icon: 'coins', sort_order: 2 },
          { id: '3', name: '25 Coins', coins: 25, color: '#10B981', probability: 20, icon: 'coins', sort_order: 3 },
          { id: '4', name: '50 Coins', coins: 50, color: '#F59E0B', probability: 15, icon: 'coins', sort_order: 4 },
          { id: '5', name: '100 Coins', coins: 100, color: '#EF4444', probability: 7, icon: 'coins', sort_order: 5 },
          { id: '6', name: 'Extra Spin', coins: 1, color: '#8B5CF6', probability: 2.5, icon: 'ticket', sort_order: 6 },
          { id: '7', name: 'Jackpot 500', coins: 500, color: '#EC4899', probability: 0.5, icon: 'star', sort_order: 7 }
        ]
      })
    }

    return NextResponse.json({ prizes }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      }
    })
  } catch (error) {
    console.error("Error fetching prizes:", error)
    return NextResponse.json({ 
      prizes: [
        { id: '1', name: 'Nothing', coins: 0, color: '#6B7280', probability: 30, icon: 'x', sort_order: 1 },
        { id: '2', name: '10 Coins', coins: 10, color: '#3B82F6', probability: 25, icon: 'coins', sort_order: 2 },
        { id: '3', name: '25 Coins', coins: 25, color: '#10B981', probability: 20, icon: 'coins', sort_order: 3 },
        { id: '4', name: '50 Coins', coins: 50, color: '#F59E0B', probability: 15, icon: 'coins', sort_order: 4 },
        { id: '5', name: '100 Coins', coins: 100, color: '#EF4444', probability: 7, icon: 'coins', sort_order: 5 },
        { id: '6', name: 'Extra Spin', coins: 1, color: '#8B5CF6', probability: 2.5, icon: 'ticket', sort_order: 6 },
        { id: '7', name: 'Jackpot 500', coins: 500, color: '#EC4899', probability: 0.5, icon: 'star', sort_order: 7 }
      ]
    })
  }
}
