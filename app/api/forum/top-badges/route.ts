import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Direct Supabase connection
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_fivemvip_SUPABASE_URL || 
              process.env.fivemvip_SUPABASE_URL || 
              process.env.SUPABASE_URL!
  const key = process.env.fivemvip_SUPABASE_SERVICE_ROLE_KEY || 
              process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Level titles
const LEVEL_TITLES: Record<number, string> = {
  1: "Newbie",
  2: "Beginner", 
  3: "Regular",
  4: "Active",
  5: "Contributor",
  6: "Expert",
  7: "Veteran",
  8: "Master",
  9: "Legend",
  10: "Champion",
}

// Badge colors based on level
const BADGE_COLORS: Record<number, string> = {
  1: "#9CA3AF",
  2: "#6B7280",
  3: "#10B981",
  4: "#059669",
  5: "#3B82F6",
  6: "#2563EB",
  7: "#8B5CF6",
  8: "#7C3AED",
  9: "#F59E0B",
  10: "#EF4444",
}

export async function GET() {
  try {
    const supabase = getSupabase()

    // Get top users by XP
    const { data: users, error } = await supabase
      .from('users')
      .select('id, discord_id, username, avatar, xp, level, membership')
      .eq('is_banned', false)
      .order('xp', { ascending: false })
      .limit(10)

    if (error) {
      console.error('[Top Badges API]', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const formatted = (users || []).map(user => ({
      id: user.discord_id,
      username: user.username,
      avatar: user.avatar,
      level: user.level || 1,
      xp: user.xp || 0,
      badge_name: LEVEL_TITLES[user.level || 1] || "Newbie",
      badge_color: BADGE_COLORS[user.level || 1] || "#9CA3AF",
    }))

    return NextResponse.json({ success: true, users: formatted })
  } catch (e: any) {
    console.error('[Top Badges API]', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
