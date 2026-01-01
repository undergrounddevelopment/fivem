import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { sendDiscordNotification } from "@/lib/discord-webhook"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: assetId } = await params
    const supabase = createAdminClient()

    const body = await request.json()
    const updates = body

    const { data, error } = await supabase
      .from("assets")
      .update(updates)
      .eq("id", assetId)
      .select(`
        *,
        author:users!assets_user_id_fkey(username, avatar)
      `)
      .single()

    if (error) throw error

    // Send Discord notification if status changed to active
    if (updates.status === "active" && data) {
      await sendDiscordNotification({
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail,
        author: data.author,
        id: data.id
      })
    }

    return NextResponse.json({ asset: data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
