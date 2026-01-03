import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

const KNOWN_TABLES = [
  'users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies',
  'activities', 'downloads', 'notifications', 'coin_transactions',
  'spin_wheel_prizes', 'spin_wheel_history', 'spin_wheel_tickets',
  'announcements', 'banners', 'testimonials', 'messages', 'reports',
  'likes', 'daily_rewards', 'admin_actions', 'security_events', 'firewall_rules'
]

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    const analysis: Record<string, any> = {
      timestamp: new Date().toISOString(),
      tables: {},
      summary: {
        total: KNOWN_TABLES.length,
        existing: 0,
        missing: 0,
        errors: 0
      },
      fixes: []
    }

    // Analyze each table
    for (const tableName of KNOWN_TABLES) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          analysis.tables[tableName] = {
            exists: false,
            error: error.message,
            code: error.code
          }
          analysis.summary.errors++
          analysis.summary.missing++
        } else {
          const columns = data && data.length > 0 ? Object.keys(data[0]) : []
          analysis.tables[tableName] = {
            exists: true,
            columns,
            columnCount: columns.length,
            sampleRow: data?.[0] || null
          }
          analysis.summary.existing++
        }
      } catch (e: any) {
        analysis.tables[tableName] = {
          exists: false,
          error: e.message
        }
        analysis.summary.errors++
        analysis.summary.missing++
      }
    }

    // Detect issues and generate fixes
    const forumCategories = analysis.tables['forum_categories']
    if (forumCategories?.exists) {
      const hasSortOrder = forumCategories.columns?.includes('sort_order')
      const hasOrderIndex = forumCategories.columns?.includes('order_index')
      
      if (hasOrderIndex && !hasSortOrder) {
        analysis.fixes.push({
          type: 'rename_column',
          table: 'forum_categories',
          from: 'order_index',
          to: 'sort_order',
          sql: 'ALTER TABLE forum_categories RENAME COLUMN order_index TO sort_order;'
        })
      } else if (!hasSortOrder && !hasOrderIndex) {
        analysis.fixes.push({
          type: 'add_column',
          table: 'forum_categories',
          column: 'sort_order',
          sql: 'ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;'
        })
      }
    }

    const activities = analysis.tables['activities']
    if (activities?.exists) {
      const requiredCols = ['action', 'target_id', 'description']
      const missingCols = requiredCols.filter(col => !activities.columns?.includes(col))
      
      missingCols.forEach(col => {
        analysis.fixes.push({
          type: 'add_column',
          table: 'activities',
          column: col,
          sql: `ALTER TABLE activities ADD COLUMN IF NOT EXISTS ${col} TEXT;`
        })
      })
    }

    return NextResponse.json(analysis)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

