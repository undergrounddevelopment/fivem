import { NextResponse } from 'next/server'
import { checkDatabaseHealth, ensureTablesExist } from '@/lib/db/health'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [health, tables] = await Promise.all([
      checkDatabaseHealth(),
      ensureTablesExist()
    ])

    const status = health.postgres && health.supabase && tables.success ? 'healthy' : 'unhealthy'

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      database: {
        postgres: health.postgres ? 'connected' : 'disconnected',
        supabase: health.supabase ? 'connected' : 'disconnected',
        tables: {
          total: health.tables.length,
          required: tables.missing.length === 0,
          missing: tables.missing
        }
      },
      error: health.error
    }, { 
      status: status === 'healthy' ? 200 : 503 
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
}
