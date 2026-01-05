import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const supabase = createAdminClient()

    const { data: threads, error } = await supabase
      .from("forum_threads")
      .select(`
        *,
        category:forum_categories(id, name, color),
        author:users!forum_threads_author_id_fkey(discord_id, username, avatar, membership)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ threads: threads || [] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    const supabase = createAdminClient()

    const { threadId, action, reason } = await request.json()

    if (action === "approve") {
      const { error } = await supabase
        .from("forum_threads")
        .update({ status: "approved" })
        .eq("id", threadId)

      if (error) throw error
    } else if (action === "reject") {
      const { error } = await supabase
        .from("forum_threads")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", threadId)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process" }, { status: 500 })
  }
}
