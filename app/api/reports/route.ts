import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { hasPgConnection, pgPool } from "@/lib/db/postgres"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, targetId, reason, description } = await request.json()

    if (!type || !targetId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validTypes = ["asset", "thread", "reply", "user", "message"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    if (hasPgConnection && pgPool) {
      const reporterId = session.user.id
      const existing = await pgPool.query(
        'SELECT id FROM reports WHERE reporter_id = $1 AND target_id = $2 AND type = $3 AND status = $4 LIMIT 1',
        [reporterId, targetId, type, 'pending'],
      )

      if (existing.rows?.[0]?.id) {
        return NextResponse.json({ error: "You already reported this" }, { status: 400 })
      }

      const res = await pgPool.query(
        `
          INSERT INTO reports (type, target_id, reason, description, reporter_id, status)
          VALUES ($1,$2,$3,$4,$5,'pending')
          RETURNING *
        `,
        [type, targetId, reason, description?.trim() || null, reporterId],
      )

      return NextResponse.json({ success: true, report: res.rows?.[0] })
    }

    // Check if user already reported this
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("reporter_id", session.user.id)
      .eq("target_id", targetId)
      .eq("type", type)
      .eq("status", "pending")
      .single()

    if (existingReport) {
      return NextResponse.json({ error: "You already reported this" }, { status: 400 })
    }

    // Insert report
    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        type,
        target_id: targetId,
        reason,
        description: description?.trim() || null,
        reporter_id: session.user.id,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Insert report error:", error)
      return NextResponse.json({ error: "Failed to submit report" }, { status: 500 })
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Report error:", error)
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Check if admin
    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("discord_id", session.user.id)
      .single()

    if (!userData?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"

    const { data: reports, error } = await supabase
      .from("reports")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
