import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notifyAdmin, logActivity } from "@/lib/discord-webhook"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type = 'test' } = body

    console.log(`🧪 Testing Discord webhook: ${type}`)

    // Test webhook by sending notification
    await notifyAdmin(
      "Webhook Test",
      `Testing ${type} webhook from ${session.user.name || 'Unknown'}`,
      "test",
      { "Test Type": type, "Tester": session.user.name || session.user.id }
    )

    await logActivity(
      "Webhook Test",
      `${type} webhook tested successfully`,
      session.user.id
    )

    return NextResponse.json({
      success: true,
      message: `Webhook test sent successfully!`
    })

  } catch (error: any) {
    console.error("Webhook test error:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const webhooks = {
      uploads: !!process.env.DISCORD_WEBHOOK_UPLOADS,
      admin: !!process.env.DISCORD_WEBHOOK_ADMIN,
      logs: !!process.env.DISCORD_WEBHOOK_LOGS
    }

    return NextResponse.json({
      configured: webhooks,
      total: Object.values(webhooks).filter(Boolean).length,
      message: "Webhook configuration status"
    })

  } catch (error: any) {
    console.error("Webhook status error:", error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}