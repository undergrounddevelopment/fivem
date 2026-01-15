import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsers } from '@/lib/database-direct'
import { validateAdminRole } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!validateAdminRole(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') as 'all' | 'active' | 'banned' | null

    // Get users with filter
    const users = await getUsers(filter || 'all')

    // Calculate stats
    const stats = {
      total: users.length,
      active: users.filter(u => !u.is_banned).length,
      banned: users.filter(u => u.is_banned).length
    }

    // If filter is applied, get total stats separately
    if (filter && filter !== 'all') {
      const allUsers = await getUsers('all')
      stats.total = allUsers.length
      stats.active = allUsers.filter(u => !u.is_banned).length
      stats.banned = allUsers.filter(u => u.is_banned).length
    }

    return NextResponse.json({
      users,
      stats
    })

  } catch (error) {
    console.error('[Admin Users API] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
