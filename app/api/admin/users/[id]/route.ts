import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { security } from "@/lib/security"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const action = String(body.action || "")

    if (!id || !action) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    if (action === "ban") {
      const ban = Boolean(body.ban)
      const reason = security.sanitizeInput(body.reason || "No reason provided")

      const { data: user, error } = await supabase
        .from("users")
        .update({
          is_banned: ban,
        })
        .eq("discord_id", id)
        .select()
        .single()

      if (error) throw error

      // Log ban/unban action
      security.logSecurityEvent(
        ban ? "User banned" : "User unbanned",
        {
          adminId: session.user.id,
          targetUserId: id,
          reason,
          action: ban ? "ban" : "unban",
        },
        "medium",
      )

      // Create audit trail
      await supabase.from("activities").insert({
        user_id: session.user.id,
        type: "admin_action",
        action: `${ban ? "Banned" : "Unbanned"} user ${id}: ${reason}`,
        target_id: id,
      })

      return NextResponse.json({
        success: true,
        status: user.is_banned ? "banned" : "active",
        reason,
      })
    }

    if (action === "setMembership") {
      const membership = String(body.membership || "free")
      const validMemberships = ["free", "premium", "vip", "admin"]

      if (!validMemberships.includes(membership)) {
        return NextResponse.json({ error: "Invalid membership type" }, { status: 400 })
      }

      const { data: user, error } = await supabase
        .from("users")
        .update({ membership })
        .eq("discord_id", id)
        .select()
        .single()

      if (error) throw error

      // Log membership change
      security.logSecurityEvent(
        "User membership changed",
        {
          adminId: session.user.id,
          targetUserId: id,
          newMembership: membership,
          previousMembership: body.previousMembership,
        },
        "low",
      )

      // Create audit trail
      await supabase.from("activities").insert({
        user_id: session.user.id,
        type: "admin_action",
        action: `Changed membership for ${id} to ${membership}`,
        target_id: id,
      })

      return NextResponse.json({
        success: true,
        membership: user.membership,
      })
    }

    if (action === "addCoins") {
      const amount = Number.parseInt(body.amount || "0")

      if (isNaN(amount) || amount === 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
      }

      // Get current user coins
      const { data: currentUser } = await supabase.from("users").select("coins").eq("discord_id", id).single()

      const newCoins = (currentUser?.coins || 0) + amount

      const { data: user, error } = await supabase
        .from("users")
        .update({ coins: newCoins })
        .eq("discord_id", id)
        .select()
        .single()

      if (error) throw error

      // Log coin transaction
      await supabase.from("coin_transactions").insert({
        user_id: id,
        amount,
        type: "admin_grant",
        description: `Admin ${session.user.id} ${amount > 0 ? "added" : "removed"} ${Math.abs(amount)} coins`,
      })

      return NextResponse.json({
        success: true,
        coins: user.coins,
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Admin user action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 })
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      security.logSecurityEvent(
        "Admin attempted self-deletion",
        {
          adminId: session.user.id,
        },
        "high",
      )
      return NextResponse.json({ error: "Cannot delete own account" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    // Get user info before deletion for logging
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("username, email, membership, created_at")
      .eq("discord_id", id)
      .single()

    if (fetchError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Soft delete instead of hard delete
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_banned: true,
        username: `[DELETED]${Date.now()}`,
        email: null,
        avatar: null,
      })
      .eq("discord_id", id)

    if (updateError) throw updateError

    // Create comprehensive audit log
    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "admin_action",
      action: `Deleted user: ${targetUser.username} (${id})`,
      target_id: id,
    })

    // Security event log
    security.logSecurityEvent(
      "User account deleted by admin",
      {
        adminId: session.user.id,
        targetUserId: id,
        targetUsername: targetUser.username,
        targetMembership: targetUser.membership,
        accountAge: Date.now() - new Date(targetUser.created_at).getTime(),
      },
      "medium",
    )

    return NextResponse.json({ success: true, message: "User account deactivated" })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
