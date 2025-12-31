import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    const isAdmin = user?.is_admin === true || user?.membership === "admin"
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, username, avatar, role, discord_id")
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(10)

    if (error) throw error

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
}
