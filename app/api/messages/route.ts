import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient, createClient } from "@/lib/supabase/server"

// GET - Fetch messages between two users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get("userId")

    if (!otherUserId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const supabase = await createClient()
    const currentUserId = (session.user as any).discord_id || session.user.id

    // Fetch messages between the two users
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`,
      )
      .order("created_at", { ascending: true })
      .limit(100)

    if (error) throw error

    const formattedMessages = (messages || []).map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      createdAt: msg.created_at,
      read: msg.is_read || false,
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, content } = body

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const senderId = (session.user as any).discord_id || session.user.id

    // Check if receiver exists
    const { data: receiver } = await supabase.from("users").select("discord_id").eq("discord_id", receiverId).single()

    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for receiver
    const { data: senderUser } = await supabase
      .from('users')
      .select('username, avatar')
      .eq('discord_id', senderId)
      .single()

    await supabase.from("notifications").insert({
      user_id: receiverId,
      type: "message",
      title: "New Message",
      message: `${senderUser?.username || session.user.name || 'Someone'} sent you a message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      data: {
        sender_id: senderId,
        sender_name: senderUser?.username || session.user.name,
        sender_avatar: senderUser?.avatar || session.user.image,
        message_preview: content.substring(0, 100)
      },
      read: false,
    })

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        createdAt: message.created_at,
        read: message.is_read,
      },
    })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
