import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.isAdmin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = await createAdminClient()
    const { data: notifications, error } = await supabase
      .from("public_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ notifications: notifications || [] })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ notifications: [] })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.isAdmin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("public_notifications").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
