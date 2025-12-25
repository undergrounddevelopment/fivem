import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'error'
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const logFile = path.join(process.cwd(), 'logs', `${level}-${date}.log`)
    
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({ logs: [], message: 'No logs found' })
    }

    const content = fs.readFileSync(logFile, 'utf-8')
    const logs = content.split('\n').filter(Boolean).map(line => {
      try {
        return JSON.parse(line)
      } catch (parseError) {
        logger.warn('Failed to parse log line', { line, parseError })
        return null
      }
    }).filter(Boolean)

    return NextResponse.json({ logs, total: logs.length })
  } catch (error: any) {
    logger.error('Failed to read error logs', error, {
      userId: (await getServerSession(authOptions))?.user?.id,
      endpoint: '/api/errors',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 })
  }
}
