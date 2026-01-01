import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Check admin status properly
    const { data: user } = await supabase
      .from("users")
      .select("is_admin, membership")
      .eq("discord_id", session.user.id)
      .single()

    if (!user?.is_admin && user?.membership !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, categoryId, isPinned, isLocked } = body

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (title !== undefined && title.trim()) updateData.title = title.trim().substring(0, 200)
    if (content !== undefined && content.trim()) updateData.content = content.trim()
    if (categoryId !== undefined) updateData.category_id = categoryId
    if (isPinned !== undefined) updateData.is_pinned = isPinned
    if (isLocked !== undefined) updateData.is_locked = isLocked

    const { data: thread, error } = await supabase
      .from("forum_threads")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logger.error("Admin update thread error", error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            admin: {
              userId: session.user.id,
              action: 'updateForumThread',
              threadId: id
            }
          }
        });
      });
      
      throw error
    }

    // Log activity (non-blocking)
    supabase.from("activities").insert({
      user_id: session.user.id,
      type: "admin_action",
      action: `Updated thread "${thread.title || id}"`,
      target_id: id,
    })

    return NextResponse.json({ success: true, thread })
  } catch (error: any) {
    logger.error("Admin edit thread error", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          admin: {
            action: 'updateForumThread'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Failed to update thread" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabase = getSupabaseAdminClient()

    // Soft delete by marking as deleted
    const { error } = await supabase.from("forum_threads").update({ is_deleted: true }).eq("id", id)

    if (error) {
      console.error("Admin delete thread error:", error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            admin: {
              userId: session.user.id,
              action: 'deleteForumThread',
              threadId: id
            }
          }
        });
      });
      
      throw error
    }

    // Log activity
    await supabase.from("activities").insert({
      user_id: session.user.id,
      type: "admin_action",
      action: `Deleted thread ${id}`,
      target_id: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete thread error:", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          admin: {
            action: 'deleteForumThread'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Failed to delete thread" }, { status: 500 })
  }
}
