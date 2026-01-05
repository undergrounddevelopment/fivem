import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function checkAdmin(supabase: any, discordId: string): Promise<boolean> {
  const { data } = await supabase.from("users").select("is_admin").eq("discord_id", discordId).single()
  return data?.is_admin === true
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    if (!await checkAdmin(supabase, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const membership = searchParams.get("membership") || "all"
    const status = searchParams.get("status") || "all"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit
    
    let query = supabase
      .from("users")
      .select(`
        id,
        discord_id,
        username,
        email,
        avatar,
        membership,
        coins,
        is_admin,
        banned,
        ban_reason,
        created_at,
        last_seen,
        (
          SELECT COUNT(*) FROM downloads WHERE user_id = users.id
        ) as downloads,
        (
          SELECT COUNT(*) FROM forum_threads WHERE author_id = users.id
        ) as posts,
        (
          SELECT COALESCE(SUM(amount), 0) FROM coin_transactions WHERE user_id = users.id
        ) as total_spent
      `)

    // Apply filters
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (membership !== "all") {
      query = query.eq("membership", membership)
    }

    if (status === "online") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      query = query.gte("last_seen", oneHourAgo)
    } else if (status === "offline") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      query = query.lt("last_seen", oneHourAgo)
    } else if (status === "banned") {
      query = query.eq("banned", true)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count }: any = await (query as any)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Enhance user data
    const enhancedUsers = (users as any[])?.map((user: any) => ({
      ...(user as any),
      isOnline: user?.last_seen ? 
        new Date(user.last_seen).getTime() > Date.now() - (60 * 60 * 1000) : false,
      reputation: Math.floor(Math.random() * 1000), // Mock reputation
      warningsCount: Math.floor(Math.random() * 3) // Mock warnings
    })) || []

    return NextResponse.json({
      success: true,
      data: enhancedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error("Users API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    if (!await checkAdmin(supabase, session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { action, userIds } = body

    let updateData: any = {}
    let successMessage = ""

    switch (action) {
      case "ban":
        updateData = { 
          banned: true, 
          ban_reason: "Bulk action from admin panel" 
        }
        successMessage = "Users banned successfully"
        break
      case "unban":
        updateData = { 
          banned: false, 
          ban_reason: null 
        }
        successMessage = "Users unbanned successfully"
        break
      case "promote":
        updateData = { membership: "vip" }
        successMessage = "Users promoted to VIP"
        break
      case "demote":
        updateData = { membership: "free" }
        successMessage = "Users demoted to Free"
        break
      case "delete":
        const { error: deleteError } = await supabase
          .from("users")
          .delete()
          .in("id", userIds)
        
        if (deleteError) {
          return NextResponse.json({ error: "Failed to delete users" }, { status: 500 })
        }
        
        return NextResponse.json({
          success: true,
          message: "Users deleted successfully"
        })
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .in("id", userIds)

    if (error) {
      console.error("Bulk update error:", error)
      return NextResponse.json({ error: "Failed to update users" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: successMessage
    })

  } catch (error) {
    console.error("Bulk users API error:", error)
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    )
  }
}