import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) { // In real app check for admin role here
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, admin_notes } = await request.json()
    const supabase = getSupabaseAdminClient()

    const { error } = await supabase
      .from("reports")
      .update({ status, admin_notes })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update report error:", error)
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
     const session = await getServerSession(authOptions)
     if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
     const supabase = getSupabaseAdminClient()
     const { error } = await supabase.from("reports").delete().eq("id", id)
     
     if (error) throw error
     return NextResponse.json({ success: true })
  } catch (error) {
     return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
