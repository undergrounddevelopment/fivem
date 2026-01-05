import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const limit = parseInt(searchParams.get("limit") || "10")

    if (query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    const supabase = createAdminClient()

    const { data: users, error } = await supabase
      .from("users")
      .select("id, discord_id, username, avatar, membership")
      .or(`username.ilike.%${query}%`)
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ users: [] })
  }
}
