import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'clean_script_usage',
        title: 'Clean Script Used',
        message: `${session.user.name || 'User'} is using Clean Script tool`,
        data: {
          user_id: session.user.id,
          user_name: session.user.name,
          action: action,
          timestamp: new Date().toISOString()
        }
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
