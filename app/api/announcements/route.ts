import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient()
    
    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(10)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        data: []
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: announcements || [],
      count: announcements?.length || 0
    })

  } catch (error) {
    console.error("Announcements API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch announcements",
        data: []
      },
      { status: 500 }
    )
  }
}