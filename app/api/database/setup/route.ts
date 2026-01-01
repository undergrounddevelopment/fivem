import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Check if user is admin
    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
    }

    // Verify all essential tables exist
    const tables = ["users", "announcements", "banners", "messages", "assets", "testimonials", "forum_threads"]

    const results = []
    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

        results.push({
          table,
          status: error ? "error" : "ok",
          count: count || 0,
          error: error?.message,
        })
      } catch (err) {
        results.push({
          table,
          status: "error",
          error: String(err),
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database verification completed",
      tables: results,
    })
  } catch (error) {
    console.error("Database setup error:", error)
    return NextResponse.json({ error: "Database setup failed", details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createAdminClient()

    // Get basic statistics
    const stats = {
      users: 0,
      assets: 0,
      banners: 0,
      announcements: 0,
      messages: 0,
      testimonials: 0,
    }

    const tables = ["users", "assets", "banners", "announcements", "messages", "testimonials"]

    for (const table of tables) {
      try {
        const { count } = await supabase.from(table).select("*", { count: "exact", head: true })
        stats[table as keyof typeof stats] = count || 0
      } catch (err) {
        console.error(`Failed to count ${table}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      status: "connected",
      stats,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
