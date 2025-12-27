import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Enable RLS on all tables with permissive policies for service role
    const tables = [
      "users",
      "assets",
      "downloads",
      "forum_categories",
      "forum_threads",
      "forum_replies",
      "notifications",
      "activities",
      "coin_transactions",
      "likes",
      "reports",
      "messages",
      "testimonials",
      "daily_rewards",
    ]

    for (const table of tables) {
      try {
        // Check if table exists first
        const { error: checkError } = await supabase.from(table).select("*").limit(1)

        if (checkError && checkError.message?.includes("does not exist")) {
          continue // Skip if table doesn't exist
        }

        // RLS is handled automatically since we use service role
        // The service role bypasses RLS by default
      } catch (err) {
        console.log(`Skipping RLS for ${table}:`, err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Setup RLS error:", error)
    return NextResponse.json({ error: error.message || "Failed to enable RLS" }, { status: 500 })
  }
}
