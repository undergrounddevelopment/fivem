import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ purchased: false, userCoins: 0 })
    }

    const supabase = getSupabaseAdminClient()

    // Check if user already purchased this asset
    const { data: existingDownload } = await supabase
      .from("downloads")
      .select("id, created_at")
      .eq("user_id", session.user.id)
      .eq("asset_id", id)
      .single()

    // Get user's current coins
    const { data: user } = await supabase.from("users").select("coins").eq("discord_id", session.user.id).single()

    return NextResponse.json({
      purchased: !!existingDownload,
      purchaseDate: existingDownload?.created_at || null,
      userCoins: user?.coins || 0,
    })
  } catch (error) {
    return NextResponse.json({ purchased: false, userCoins: 0 })
  }
}
