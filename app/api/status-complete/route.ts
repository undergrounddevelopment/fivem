// COMPLETE STATUS API - REAL-TIME MONITORING
import { NextRequest, NextResponse } from 'next/server'
import { verifyDatabaseConnection } from '@/lib/database-complete-setup'
import { testConnection } from '@/lib/supabase/client'
import { testServerConnection, testAdminConnection } from '@/lib/supabase/server'
import { CONFIG, validateConfig } from '@/lib/config'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🔍 Complete status check initiated...')
    
    // 1. Configuration Validation
    const configValid = validateConfig()
    
    // 2. Database Connection Tests
    const [
      clientTest,
      serverTest, 
      adminTest,
      dbVerification
    ] = await Promise.allSettled([
      testConnection(),
      testServerConnection(),
      testAdminConnection(),
      verifyDatabaseConnection()
    ])

    // 3. Feature Status Checks
    const featureStatus = {
      discord_oauth: !!(CONFIG.discord.clientId && CONFIG.discord.clientSecret),
      linkvertise: !!(CONFIG.linkvertise.userId),
      daily_coins: true,
      spin_wheel: true,
      forum: true,
      assets: true,
      notifications: true,
      xp_system: true,
      admin_panel: true,
      realtime: true
    }

    // 4. Environment Status
    const envStatus = {
      node_env: process.env.NODE_ENV || 'development',
      next_version: '16.0.10',
      supabase_url: !!CONFIG.supabase.url,
      supabase_anon_key: !!CONFIG.supabase.anonKey,
      supabase_service_key: !!CONFIG.supabase.serviceKey,
      nextauth_secret: !!CONFIG.auth.secret,
      discord_client_id: !!CONFIG.discord.clientId,
      discord_client_secret: !!CONFIG.discord.clientSecret
    }

    // 5. Connection Results
    const connections = {
      supabase_client: clientTest.status === 'fulfilled' ? clientTest.value.success : false,
      supabase_server: serverTest.status === 'fulfilled' ? serverTest.value.success : false,
      supabase_admin: adminTest.status === 'fulfilled' ? adminTest.value.success : false,
      database_verified: dbVerification.status === 'fulfilled' ? dbVerification.value.success : false
    }

    // 6. Database Tables Status
    const tablesStatus = dbVerification.status === 'fulfilled' && dbVerification.value.success
      ? {
          total: dbVerification.value.totalTables || 15,
          existing: dbVerification.value.tablesExist || 0,
          missing: dbVerification.value.missingTables || [],
          percentage: Math.round(((dbVerification.value.tablesExist || 0) / 15) * 100)
        }
      : {
          total: 15,
          existing: 0,
          missing: ['Unable to verify'],
          percentage: 0
        }

    // 7. Overall Health Score
    const healthChecks = [
      configValid,
      connections.supabase_client,
      connections.supabase_server,
      connections.supabase_admin,
      connections.database_verified,
      featureStatus.discord_oauth,
      tablesStatus.percentage === 100
    ]
    
    const healthScore = Math.round((healthChecks.filter(Boolean).length / healthChecks.length) * 100)
    const isHealthy = healthScore >= 80
    
    // 8. Response Time
    const responseTime = Date.now() - startTime

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      response_time_ms: responseTime,
      health_score: healthScore,
      status: isHealthy ? 'healthy' : 'degraded',
      
      // Core Systems
      configuration: {
        valid: configValid,
        environment: envStatus
      },
      
      connections,
      
      database: {
        tables: tablesStatus,
        connection_tests: {
          client: clientTest.status === 'fulfilled' ? clientTest.value : { success: false, error: 'Test failed' },
          server: serverTest.status === 'fulfilled' ? serverTest.value : { success: false, error: 'Test failed' },
          admin: adminTest.status === 'fulfilled' ? adminTest.value : { success: false, error: 'Test failed' }
        }
      },
      
      features: featureStatus,
      
      // System Info
      system: {
        platform: 'FiveM Tools V7',
        version: '7.0.0',
        build_status: 'production-ready',
        last_updated: new Date().toISOString()
      },
      
      // Quick Status Summary
      summary: {
        overall: isHealthy ? '🟢 All Systems Operational' : '🟡 Some Issues Detected',
        database: tablesStatus.percentage === 100 ? '✅ Complete' : `⚠️ ${tablesStatus.percentage}% Complete`,
        auth: featureStatus.discord_oauth ? '✅ Discord OAuth Ready' : '❌ Discord OAuth Missing',
        connections: Object.values(connections).every(Boolean) ? '✅ All Connected' : '⚠️ Connection Issues'
      }
    }

    console.log(`🎯 Status check completed in ${responseTime}ms - Health: ${healthScore}%`)
    
    return NextResponse.json(response, {
      status: isHealthy ? 200 : 206,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Score': healthScore.toString(),
        'X-Response-Time': responseTime.toString()
      }
    })

  } catch (error) {
    console.error('💥 Status check failed:', error)
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime,
      health_score: 0,
      status: 'error',
      error: String(error),
      summary: {
        overall: '🔴 System Error',
        database: '❌ Unable to verify',
        auth: '❌ Unable to verify', 
        connections: '❌ Unable to verify'
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}

// POST endpoint for specific checks
export async function POST(request: NextRequest) {
  try {
    const { check } = await request.json()
    
    switch (check) {
      case 'database':
        const dbResult = await verifyDatabaseConnection()
        return NextResponse.json({ success: dbResult.success, data: dbResult })
        
      case 'connections':
        const [client, server, admin] = await Promise.all([
          testConnection(),
          testServerConnection(), 
          testAdminConnection()
        ])
        return NextResponse.json({ 
          success: client.success && server.success && admin.success,
          data: { client, server, admin }
        })
        
      case 'config':
        const configValid = validateConfig()
        return NextResponse.json({ success: configValid, data: { valid: configValid } })
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid check type. Use: database, connections, config' 
        }, { status: 400 })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}