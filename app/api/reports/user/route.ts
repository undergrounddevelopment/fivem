import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient()

  try {
    const { data: reports, error } = await supabase
      .from("reports")
      .select("*")
      .eq("reporter_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ reports })
  } catch (error: any) {
    console.error("Fetch reports error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
