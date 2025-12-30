import { NextRequest, NextResponse } from 'next/server'
import { getForumThreads } from '@/lib/database-direct'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const threads = await getForumThreads(categoryId || undefined)

    return NextResponse.json({
      success: true,
      threads: threads,
      total: threads.length,
    })
  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}
