
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
    
    // 1. Trust Session if populated (fastest)
    if ((session.user as any).isAdmin || (session.user as any).role === 'admin') return true

    // 2. Fallback to DB check
    const { data: user } = await supabase
        .from("users")
        .select("is_admin, role, membership")
        .eq("id", session.user.id)
        .single()
        
    if (user && (user.is_admin === true || user.role === 'admin' || user.membership === 'admin')) {
        return true
    }
    
    return false
}

// GET: List all prizes (Publicly accessible for frontend to display)
export async function GET() {
    // Note: We allow public read so the Spin Wheel page can show prizes.
    // Use RLS if we wanted to hide inactive ones, but here we filter in query if needed.
    const { data: prizes, error } = await supabase
        .from("spin_prizes")
        .select("*")
        .order("created_at", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(prizes)
}

// POST: Create a new prize (Admin Only)
export async function POST(req: Request) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, type, value, image_url, drop_rate, color, is_active } = body
    
    const { data, error } = await supabase
        .from("spin_prizes")
        .insert({ title, type, value, image_url, drop_rate, color, is_active })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// PUT: Update a prize (Admin Only)
export async function PUT(req: Request) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...updates } = body
    
    const { data, error } = await supabase
        .from("spin_prizes")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

// DELETE: Remove a prize (Admin Only)
export async function DELETE(req: Request) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const { error } = await supabase
        .from("spin_prizes")
        .delete()
        .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
