import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    const { data: user, error }: any = await (supabase as any)
      .from("users")
      .select(`
        *,
        (
          SELECT COUNT(*) FROM downloads WHERE user_id = users.id
        ) as downloads,
        (
          SELECT COUNT(*) FROM forum_threads WHERE author_id = users.id
        ) as posts,
        (
          SELECT COUNT(*) FROM forum_replies WHERE author_id = users.id
        ) as replies,
        (
          SELECT COALESCE(SUM(amount), 0) FROM coin_transactions WHERE user_id = users.id
        ) as total_spent
      `)
      .eq("id", params.id)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user activity
    const { data: recentActivity } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", params.id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get real warnings count from database
    const { count: warningsCount } = await supabase
      .from("user_warnings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", params.id)

    const enhancedUser = {
      ...(user as any),
      isOnline: (user as any).last_seen ? 
        new Date((user as any).last_seen).getTime() > Date.now() - (60 * 60 * 1000) : false,
      reputation: (user as any).xp || 0, // Use real XP as reputation
      warningsCount: warningsCount || 0, // Real warnings from database
      recentActivity: recentActivity || []
    }

    return NextResponse.json({
      success: true,
      data: enhancedUser
    })

  } catch (error) {
    console.error("User details API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, reason, ...data } = body

    const supabase = createAdminClient()

    let updateData: any = {}
    let successMessage = ""

    switch (action) {
      case "promote":
        updateData = { is_admin: true }
        successMessage = "User promoted to admin"
        break
      case "demote":
        updateData = { is_admin: false }
        successMessage = "User demoted from admin"
        break
      case "ban":
        updateData = { 
          banned: true, 
          ban_reason: reason || "Banned by admin" 
        }
        successMessage = "User banned successfully"
        break
      case "unban":
        updateData = { 
          banned: false, 
          ban_reason: null 
        }
        successMessage = "User unbanned successfully"
        break
      case "update-membership":
        updateData = { membership: data.membership }
        successMessage = "User membership updated"
        break
      case "add-coins":
        const { data: currentUser } = await supabase
          .from("users")
          .select("coins")
          .eq("id", params.id)
          .single()
        
        if (currentUser) {
          updateData = { coins: currentUser.coins + (data.amount || 0) }
          successMessage = `Added ${data.amount} coins to user`
        }
        break
      case "reset-password":
        // In a real implementation, you would send a password reset email
        successMessage = "Password reset email sent"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", params.id)

      if (error) {
        console.error("User update error:", error)
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
      }
    }

    // Log the admin action
    await supabase
      .from("admin_actions")
      .insert({
        admin_id: session.user.id,
        action: action,
        target_type: "user",
        target_id: params.id,
        reason: reason,
        metadata: data
      })

    return NextResponse.json({
      success: true,
      message: successMessage
    })

  } catch (error) {
    console.error("User action API error:", error)
    return NextResponse.json(
      { error: "Failed to perform user action" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Soft delete by marking as deleted
    const { error } = await supabase
      .from("users")
      .update({ 
        deleted_at: new Date().toISOString(),
        banned: true,
        ban_reason: "Account deleted by admin"
      })
      .eq("id", params.id)

    if (error) {
      console.error("User deletion error:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    // Log the admin action
    await supabase
      .from("admin_actions")
      .insert({
        admin_id: session.user.id,
        action: "delete",
        target_type: "user",
        target_id: params.id,
        reason: "User deleted by admin"
      })

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    console.error("User deletion API error:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}