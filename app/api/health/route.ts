import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "7.0.0",
      environment: process.env.NODE_ENV || "development",
      checks: {
        api: true,
        database: false,
        supabase: false,
        auth: false
      },
      performance: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        responseTime: 0
      },
      features: {
        announcements: false,
        realtime: false,
        admin: false,
        forum: false
      }
    }

    // Test Supabase connection
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = await createClient()

      const { data, error } = await supabase
        .from("users")
        .select("count")
        .limit(1)

      if (!error) {
        health.checks.supabase = true
        health.checks.database = true
        health.features.announcements = true
        health.features.forum = true
      }
    } catch (error) {
      console.log("Supabase connection test failed:", error)
    }

    // Test auth configuration
    try {
      if (process.env.NEXTAUTH_SECRET && process.env.DISCORD_CLIENT_ID) {
        health.checks.auth = true
      }
    } catch (error) {
      console.log("Auth check failed:", error)
    }

    // Test admin features
    try {
      if (process.env.ADMIN_DISCORD_ID) {
        health.features.admin = true
      }
    } catch (error) {
      console.log("Admin check failed:", error)
    }

    // Calculate response time
    health.performance.responseTime = Date.now() - startTime

    // Determine overall status
    const criticalChecks = [health.checks.api]
    const allCriticalPassed = criticalChecks.every(check => check === true)

    if (!allCriticalPassed) {
      health.status = "unhealthy"
    } else if (!health.checks.database || !health.checks.supabase) {
      health.status = "degraded"
    }

    const statusCode = health.status === "healthy" ? 200 :
      health.status === "degraded" ? 200 : 503

    return NextResponse.json(health, { status: statusCode })

  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
      performance: {
        responseTime: Date.now() - startTime
      }
    }, { status: 503 })
  }
}