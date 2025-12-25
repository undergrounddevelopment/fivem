import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: prizes, error } = await supabase
      .from("spin_wheel_prizes")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) throw error

    return NextResponse.json({ prizes })
  } catch (error) {
    console.error("Error fetching prizes:", error)
    return NextResponse.json({ error: "Failed to fetch prizes" }, { status: 500 })
  }
}
