import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function checkAdminAccess(userId: string) {
  const supabase = getSupabase()
  
  // Try discord_id first
  let { data } = await supabase
    .from('users')
    .select('is_admin, membership')
    .eq('discord_id', userId)
    .single()

  // Try UUID if not found
  if (!data) {
    const { data: byUuid } = await supabase
      .from('users')
      .select('is_admin, membership')
      .eq('id', userId)
      .single()
    data = byUuid
  }

  // Check admin status
  const isAdmin = data?.is_admin === true || 
                  data?.membership === 'admin' ||
                  userId === process.env.ADMIN_DISCORD_ID

  return isAdmin
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin status using improved logic
    const isAdmin = await checkAdminAccess(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get pending threads - handle case where status column might not exist
    const supabase = getSupabaseAdminClient()
    let threads: any[] = []
    let fetchError: any = null
    
    // Try with status filter first
    const { data: threadsWithStatus, error: statusError } = await supabase
      .from("forum_threads")
      .select("*")
      .eq("status", "pending")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })

    if (statusError) {
      console.error("[Admin Forum] Status query error:", statusError)
      // If status column doesn't exist, get all non-deleted threads
      const { data: allThreads, error: allError } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(50)
      
      if (allError) {
        console.error("[Admin Forum] Fallback query error:", allError)
        fetchError = allError
      } else {
        threads = allThreads || []
      }
    } else {
      threads = threadsWithStatus || []
    }

    if (fetchError) {
      throw fetchError
    }

    // Get author and category info separately
    const formattedThreads = await Promise.all((threads || []).map(async (thread) => {
      // Get author
      let author: any = null
      if (thread.author_id) {
        // Try by UUID first
        const { data: authorByUUID } = await supabase
          .from("users")
          .select("discord_id, username, avatar, membership")
          .eq("id", thread.author_id)
          .single()
        
        if (authorByUUID) {
          author = authorByUUID
        } else {
          // Try by discord_id
          const { data: authorByDiscord } = await supabase
            .from("users")
            .select("discord_id, username, avatar, membership")
            .eq("discord_id", thread.author_id)
            .single()
          author = authorByDiscord
        }
      }

      // Get category
      let category: any = null
      if (thread.category_id) {
        const { data: categoryData } = await supabase
          .from("forum_categories")
          .select("id, name, color")
          .eq("id", thread.category_id)
          .single()
        category = categoryData
      }

      return {
        ...thread,
        author,
        category
      }
    }))

    return NextResponse.json({ threads: formattedThreads })
  } catch (error) {
    console.error("[Admin Forum] Error:", error)
    return NextResponse.json({ error: "Failed to fetch pending threads", threads: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin status using improved logic
    const isAdmin = await checkAdminAccess(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const supabase = getSupabaseAdminClient()

    const { threadId, action, reason } = await request.json()

    if (!threadId || !action) {
      return NextResponse.json({ error: "Missing threadId or action" }, { status: 400 })
    }

    if (action === "approve") {
      const { error } = await supabase
        .from("forum_threads")
        .update({ 
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", threadId)

      if (error) {
        console.error("[Admin Forum] Approve error:", error)
        throw error
      }
    } else if (action === "reject") {
      const { error } = await supabase
        .from("forum_threads")
        .update({ 
          status: "rejected", 
          rejection_reason: reason || "Rejected by admin",
          updated_at: new Date().toISOString()
        })
        .eq("id", threadId)

      if (error) {
        console.error("[Admin Forum] Reject error:", error)
        throw error
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Admin Forum] POST error:", error)
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 })
  }
}
