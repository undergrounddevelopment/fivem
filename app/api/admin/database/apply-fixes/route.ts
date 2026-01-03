import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient()
    const results = {
      applied: [] as string[],
      failed: [] as string[],
      sql: [] as string[]
    }

    // Check forum_categories
    const { data: forumCatData } = await supabase
      .from('forum_categories')
      .select('*')
      .limit(1)

    if (forumCatData) {
      const columns = forumCatData.length > 0 ? Object.keys(forumCatData[0]) : []
      const hasSortOrder = columns.includes('sort_order')
      const hasOrderIndex = columns.includes('order_index')

      if (hasOrderIndex && !hasSortOrder) {
        results.sql.push('ALTER TABLE forum_categories RENAME COLUMN order_index TO sort_order;')
        results.applied.push('forum_categories: rename order_index to sort_order')
      } else if (!hasSortOrder && !hasOrderIndex) {
        results.sql.push('ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;')
        results.applied.push('forum_categories: add sort_order column')
      }
    }

    // Check activities
    const { data: activitiesData } = await supabase
      .from('activities')
      .select('*')
      .limit(1)

    if (activitiesData) {
      const columns = activitiesData.length > 0 ? Object.keys(activitiesData[0]) : []
      const requiredCols = ['action', 'target_id', 'description']
      const missingCols = requiredCols.filter(col => !columns.includes(col))

      missingCols.forEach(col => {
        results.sql.push(`ALTER TABLE activities ADD COLUMN IF NOT EXISTS ${col} TEXT;`)
        results.applied.push(`activities: add ${col} column`)
      })
    }

    // Generate complete SQL script
    const sqlScript = `-- AUTO-GENERATED FIX SCRIPT
-- Generated: ${new Date().toISOString()}

${results.sql.join('\n\n')}

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public can view forum_categories" ON forum_categories;
CREATE POLICY "Public can view forum_categories" ON forum_categories FOR SELECT USING (COALESCE(is_active, true) = true);

DROP POLICY IF EXISTS "Public can view activities" ON activities;
CREATE POLICY "Public can view activities" ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view forum_threads" ON forum_threads;
CREATE POLICY "Public can view forum_threads" ON forum_threads FOR SELECT USING (COALESCE(is_deleted, false) = false AND (status = 'approved' OR status IS NULL));

DROP POLICY IF EXISTS "Public can view forum_replies" ON forum_replies;
CREATE POLICY "Public can view forum_replies" ON forum_replies FOR SELECT USING (COALESCE(is_deleted, false) = false);
`

    return NextResponse.json({
      success: true,
      applied: results.applied,
      failed: results.failed,
      sqlScript,
      message: results.applied.length > 0 
        ? `Generated ${results.applied.length} fixes. Execute SQL in Supabase SQL Editor.`
        : 'No fixes needed. Database is up to date.'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

