import { NextResponse } from 'next/server'
import { checkAllTables } from '@/lib/check-tables'

export async function GET() {
  try {
    const results = await checkAllTables()
    
    const existing = Object.values(results).filter(Boolean).length
    const total = Object.keys(results).length
    const percentage = Math.round((existing / total) * 100)
    
    return NextResponse.json({
      success: true,
      tables: results,
      summary: {
        existing,
        total,
        percentage,
        allExist: existing === total
      }
    })
  } catch (error) {
    console.error('Check tables error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check tables'
    }, { status: 500 })
  }
}
