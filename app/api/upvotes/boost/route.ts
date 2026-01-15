
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const data = await request.json()
    const { serverName, upvotes, serverId } = data

    if (!serverName && !serverId) {
      return NextResponse.json({ error: "Server information required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // 1. Record activity if user is logged in
    if (session?.user?.id) {
        await supabase.from("activities").insert({
            user_id: session.user.id,
            type: "upvote",
            action: "boost",
            target_id: serverId || serverName,
            description: `Boosted server ${serverName} with ${upvotes} upvotes`,
            metadata: {
                server_name: serverName,
                upvotes: upvotes,
                server_id: serverId
            }
        }).catch(err => console.error("Failed to record upvote activity:", err))
    }

    // 2. Update or create testimonials entry for this server
    // This allows the "Top Servers" or "Testimonials" section to reflect the boost
    if (serverName) {
        const { data: existing, error: fetchError } = await supabase
            .from("testimonials")
            .select("id, upvotes_received")
            .ilike("server_name", serverName)
            .limit(1)

        if (!fetchError && existing && existing.length > 0) {
            // Update existing testimonial
            const currentUpvotes = existing[0].upvotes_received || 0
            const newTotal = currentUpvotes + parseInt(upvotes || 0)

            const { error: updateError } = await supabase
                .from("testimonials")
                .update({ 
                    upvotes_received: newTotal, 
                    updated_at: new Date().toISOString() 
                })
                .eq("id", existing[0].id)
            
            if (updateError) {
                console.error("[Boost API] Failed to update testimonial:", updateError)
            }
        } else {
            // Create new testimonial entry for this server
            const { error: insertError } = await supabase
                .from("testimonials")
                .insert({
                    server_name: serverName,
                    server_id: serverId,
                    upvotes_received: parseInt(upvotes || 0),
                    rating: 5,
                    content: `Boosted via FiveM Tools Upvote System`,
                    user_name: session?.user?.name || "Anonymous",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            
            if (insertError) {
                console.error("[Boost API] Failed to create testimonial:", insertError)
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: "Boost recorded successfully",
        boosted: upvotes
    })

  } catch (error: any) {
    console.error("[Boost API] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
