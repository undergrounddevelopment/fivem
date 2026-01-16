
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
        .eq("discord_id", session.user.id)
        .single()
        
    if (user && (user.is_admin === true || user.role === 'admin' || user.membership === 'admin')) {
        return true
    }
    return false
}

// GET: Retrieve settings
export async function GET() {
    // Public read allowed for some settings (ticket cost), but better to wrap in simpler endpoint?
    // Admin endpoint usually protected. We'll protect write, maybe open read or have duplicate public endpoint.
    // For now, let's allow read for admin panel usage.
    
    if (!await checkIsAdmin()) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("spin_settings")
        .select("*")
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    // Convert array to object key-value
    const settings = data?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
    return NextResponse.json(settings)
}

// POST/PUT: Update settings
export async function POST(req: Request) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    // body: { ticket_cost: 1, is_enabled: true }
    
    for (const [key, value] of Object.entries(body)) {
        await supabase
            .from("spin_settings")
            .upsert({ key, value: value as any })
    }

    return NextResponse.json({ success: true })
}
