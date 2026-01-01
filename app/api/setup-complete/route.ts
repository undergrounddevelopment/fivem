// API ENDPOINT - COMPLETE DATABASE SETUP
import { NextRequest, NextResponse } from 'next/server'
import { setupCompleteDatabase, verifyDatabaseConnection } from '@/lib/database-complete-setup'
import { CONFIG } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Database setup API called')
    
    // Verify configuration first
    if (!CONFIG.supabase.url || !CONFIG.supabase.serviceKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase configuration',
        details: {
          hasUrl: !!CONFIG.supabase.url,
          hasServiceKey: !!CONFIG.supabase.serviceKey
        }
      }, { status: 500 })
    }

    // Run complete setup
    const setupResult = await setupCompleteDatabase()
    
    if (setupResult.success) {
      // Verify everything is working
      const verifyResult = await verifyDatabaseConnection()
      
      return NextResponse.json({
        success: true,
        message: '🎉 Database setup completed successfully!',
        setup: setupResult.results,
        verification: verifyResult,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Database setup failed',
        details: setupResult,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 Database setup API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'verify') {
      const result = await verifyDatabaseConnection()
      return NextResponse.json({
        success: result.success,
        verification: result,
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'setup') {
      const result = await setupCompleteDatabase()
      return NextResponse.json({
        success: result.success,
        setup: result,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "verify" or "setup"'
    }, { status: 400 })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}