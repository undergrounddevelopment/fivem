
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkIsAdmin() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return false
    if ((session.user as any).isAdmin || (session.user as any).role === 'admin') return true
    
    // DB Check
    const { data: user } = await supabase
        .from("users")
        .select("is_admin, role, membership")
        .eq("discord_id", session.user.id) // Session ID is Discord ID
        .single()
        
    if (user && (user.is_admin === true || user.role === 'admin' || user.membership === 'admin')) {
        return true
    }
    return false
}

export async function GET(req: Request) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    // Fetch history with user details
    const { data, error } = await supabase
        .from("spin_history")
        .select(`
            *,
            users:user_id (
                username,
                discord_id,
                avatar
            ),
            spin_prizes:prize_id (
                title,
                image_url,
                type,
                value
            )
        `)
        .order("created_at", { ascending: false })
        .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
