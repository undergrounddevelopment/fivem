import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const targetUserId = searchParams.get("userId")
  
  if (!targetUserId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const supabase = getSupabaseAdminClient()

  try {
    // parallel requests for counts and status
    const promises: any[] = [
      supabase.from("followers").select("id", { count: "exact", head: true }).eq("following_id", targetUserId), // Followers count
      supabase.from("followers").select("id", { count: "exact", head: true }).eq("follower_id", targetUserId),  // Following count
    ]

    // If logged in, check if current user is following target
    if (session?.user?.id) {
      promises.push(
        supabase
          .from("followers")
          .select("id")
          .match({ follower_id: session.user.id, following_id: targetUserId })
          .single()
      )
    }

    const results = await Promise.all(promises)
    const followersCount = results[0].count || 0
    const followingCount = results[1].count || 0
    const isFollowing = session?.user?.id ? !!results[2].data : false

    return NextResponse.json({
      followersCount,
      followingCount,
      isFollowing
    })
  } catch (error) {
    console.error("Social check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
