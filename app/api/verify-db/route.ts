import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_CONFIG } from "@/lib/supabase/config"

export async function GET() {
  try {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Supabase service configuration",
          config: {
            url: SUPABASE_CONFIG.url,
            hasAnonKey: !!SUPABASE_CONFIG.anonKey,
            hasServiceKey: !!SUPABASE_CONFIG.serviceRoleKey,
          },
        },
        { status: 500 },
      )
    }

    const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const tables = [
      "banners",
      "announcements",
      "file_uploads",
      "forum_categories",
      "spin_wheel_prizes",
      "spin_history",
      "daily_claims",
      "admin_audit_log",
    ]

    const tableStatus: Record<string, any> = {}

    for (const table of tables) {
      const { data, error, count } = await supabase.from(table).select("*", { count: "exact", head: true })

      tableStatus[table] = {
        exists: !error,
        count: count || 0,
        error: error?.message || null,
      }
    }

    const allTablesExist = Object.values(tableStatus).every((status: any) => status.exists)

    return NextResponse.json({
      success: allTablesExist,
      message: allTablesExist
        ? "All database tables are ready"
        : "Some tables are missing. Run auto-setup-db to create them.",
      tables: tableStatus,
      config: {
        url: SUPABASE_CONFIG.url,
        hasAnonKey: !!SUPABASE_CONFIG.anonKey,
        hasServiceKey: !!SUPABASE_CONFIG.serviceRoleKey,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
