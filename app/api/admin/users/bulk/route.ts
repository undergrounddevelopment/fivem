import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, userIds, reason, data } = body

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const supabase = createAdminClient()

    let updateData: any = {}
    let successMessage = ""
    let shouldDelete = false

    switch (action) {
      case "ban":
        updateData = { 
          banned: true, 
          ban_reason: reason || "Bulk ban by admin" 
        }
        successMessage = `${userIds.length} users banned successfully`
        break
        
      case "unban":
        updateData = { 
          banned: false, 
          ban_reason: null 
        }
        successMessage = `${userIds.length} users unbanned successfully`
        break
        
      case "promote":
        updateData = { membership: "vip" }
        successMessage = `${userIds.length} users promoted to VIP`
        break
        
      case "demote":
        updateData = { membership: "free" }
        successMessage = `${userIds.length} users demoted to Free`
        break
        
      case "make-admin":
        updateData = { is_admin: true }
        successMessage = `${userIds.length} users promoted to admin`
        break
        
      case "remove-admin":
        updateData = { is_admin: false }
        successMessage = `${userIds.length} users demoted from admin`
        break
        
      case "add-coins":
        if (!data?.amount || typeof data.amount !== "number") {
          return NextResponse.json({ error: "Invalid coin amount" }, { status: 400 })
        }
        
        // For adding coins, we need to update each user individually
        const { data: users } = await supabase
          .from("users")
          .select("id, coins")
          .in("id", userIds)
        
        if (users) {
          const updates = users.map(user => ({
            id: user.id,
            coins: user.coins + data.amount
          }))
          
          for (const update of updates) {
            await supabase
              .from("users")
              .update({ coins: update.coins })
              .eq("id", update.id)
          }
        }
        
        successMessage = `Added ${data.amount} coins to ${userIds.length} users`
        break
        
      case "reset-coins":
        updateData = { coins: 0 }
        successMessage = `Reset coins for ${userIds.length} users`
        break
        
      case "delete":
        shouldDelete = true
        successMessage = `${userIds.length} users deleted successfully`
        break
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (shouldDelete) {
      // Soft delete by marking as deleted
      const { error } = await supabase
        .from("users")
        .update({ 
          deleted_at: new Date().toISOString(),
          banned: true,
          ban_reason: "Account deleted by admin (bulk action)"
        })
        .in("id", userIds)

      if (error) {
        console.error("Bulk delete error:", error)
        return NextResponse.json({ error: "Failed to delete users" }, { status: 500 })
      }
    } else if (Object.keys(updateData).length > 0 && action !== "add-coins") {
      const { error } = await supabase
        .from("users")
        .update(updateData)
        .in("id", userIds)

      if (error) {
        console.error("Bulk update error:", error)
        return NextResponse.json({ error: "Failed to update users" }, { status: 500 })
      }
    }

    // Log the bulk admin action
    const adminActions = userIds.map(userId => ({
      admin_id: session.user.id,
      action: action,
      target_type: "user",
      target_id: userId,
      reason: reason || `Bulk ${action} by admin`,
      metadata: data || {}
    }))

    await supabase
      .from("admin_actions")
      .insert(adminActions)

    // Send notifications to affected users (optional)
    if (action === "ban" || action === "unban" || action === "promote") {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: "system",
        title: `Account ${action}`,
        message: `Your account has been ${action}ed by an administrator.`,
        created_at: new Date().toISOString()
      }))

      await supabase
        .from("notifications")
        .insert(notifications)
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      affected: userIds.length
    })

  } catch (error) {
    console.error("Bulk users API error:", error)
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    )
  }
}