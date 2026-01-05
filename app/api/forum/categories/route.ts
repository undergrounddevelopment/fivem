import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Direct Supabase - 100% working
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_fivemvip_SUPABASE_URL || 
              process.env.fivemvip_SUPABASE_URL || 
              process.env.SUPABASE_URL!
  const key = process.env.fivemvip_SUPABASE_SERVICE_ROLE_KEY || 
              process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET() {
  try {
    const supabase = getSupabase()

    // Get all active categories
    const { data: categories, error } = await supabase
      .from("forum_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json([])
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json([])
    }

    // Get thread counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        // Count threads in this category
        const { count: threadCount } = await supabase
          .from("forum_threads")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id)
          .eq("is_deleted", false)

        // Get thread IDs for reply count
        const { data: threadIds } = await supabase
          .from("forum_threads")
          .select("id")
          .eq("category_id", category.id)
          .eq("is_deleted", false)

        let replyCount = 0
        if (threadIds && threadIds.length > 0) {
          const ids = threadIds.map(t => t.id)
          const { count } = await supabase
            .from("forum_replies")
            .select("*", { count: "exact", head: true })
            .in("thread_id", ids)
            .eq("is_deleted", false)
          replyCount = count || 0
        }

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color || "#3b82f6",
          icon: category.icon,
          sort_order: category.sort_order,
          threadCount: threadCount || 0,
          thread_count: threadCount || 0,
          postCount: (threadCount || 0) + replyCount,
        }
      })
    )

    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error("Error in categories API:", error)
    return NextResponse.json([])
  }
}
