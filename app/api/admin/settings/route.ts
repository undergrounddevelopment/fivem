import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/settings'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Verify admin role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('discord_id', session.user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const settings = await getSiteSettings()
        return NextResponse.json(settings)
    } catch (error) {
        console.error('Settings fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('discord_id', session.user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { site_info, features, linkvertise, discord, rate_limits } = body

        const updates: any[] = []

        if (site_info) {
            updates.push(supabase.from('site_settings').upsert({ key: 'site_info', value: site_info, updated_by: session.user.id }))
        }
        if (features) {
            updates.push(supabase.from('site_settings').upsert({ key: 'features', value: features, updated_by: session.user.id }))
        }
        if (linkvertise) {
            updates.push(supabase.from('site_settings').upsert({ key: 'linkvertise', value: linkvertise, updated_by: session.user.id }))
        }
        if (discord) {
            updates.push(supabase.from('site_settings').upsert({ key: 'discord', value: discord, updated_by: session.user.id }))
        }
        if (rate_limits) {
            updates.push(supabase.from('site_settings').upsert({ key: 'rate_limits', value: rate_limits, updated_by: session.user.id }))
        }

        await Promise.all(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Settings update error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
