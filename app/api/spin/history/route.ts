
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "20")

    // Get User UUID from Discord ID
    const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("discord_id", session.user.id)
        .single()

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Fetch history
    const { data, error } = await supabase
        .from("spin_wheel_history")
        .select(`
            *,
            prize:spin_wheel_prizes (
                name,
                image_url,
                type,
                value
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
