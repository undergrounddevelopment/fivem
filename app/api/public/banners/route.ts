import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = createAdminClient()
        const { data: banners, error } = await supabase
            .from("banners")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false })

        if (error) {
            // If table missing, return empty to trigger fallback default hero
            if (error.code === '42P01') {
                return NextResponse.json({ banners: [] })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ banners: banners || [] })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
