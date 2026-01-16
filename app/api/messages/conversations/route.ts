import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const currentUserId = (session.user as any).discord_id || session.user.id

    // Get all messages involving the current user
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Group by conversation partner
    const conversationMap = new Map<string, any>()

    for (const msg of messages || []) {
      const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          lastMessage: msg.content,
          lastMessageAt: msg.created_at,
          unreadCount: msg.receiver_id === currentUserId && !msg.is_read ? 1 : 0,
        })
      } else if (msg.receiver_id === currentUserId && !msg.is_read) {
        const existing = conversationMap.get(partnerId)
        existing.unreadCount += 1
      }
    }

    // Fetch user details for each partner - optimized bulk fetch
    const partnerIds = Array.from(conversationMap.keys())

    if (partnerIds.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    const { data: users } = await supabase
      .from("users")
      .select("id, discord_id, username, avatar, membership")
      .in("discord_id", partnerIds)

    const userMap = new Map((users || []).map((u) => [u.discord_id, u]))
    const conversations: any[] = []

    for (const partnerId of partnerIds) {
      const user = userMap.get(partnerId)
      if (user) {
        const convData = conversationMap.get(partnerId)
        conversations.push({
          id: partnerId,
          user: {
            id: user.id,
            discordId: user.discord_id,
            username: user.username,
            avatar: user.avatar,
            membership: user.membership,
          },
          lastMessage: convData.lastMessage,
          lastMessageAt: convData.lastMessageAt,
          unreadCount: convData.unreadCount,
        })
      }
    }

    // Sort by last message time
    conversations.sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
