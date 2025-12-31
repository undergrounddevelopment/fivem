import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test Supabase connection
    const supabase = createAdminClient()
    
    // Test basic connection
    const { data: tables, error: tablesError } = await supabase
      .from('assets')
      .select('count')
      .limit(1)
    
    if (tablesError) {
      return NextResponse.json({ 
        error: "Supabase connection failed", 
        details: tablesError.message 
      }, { status: 500 })
    }
    
    // Test db.assets
    const assets = await db.assets.getAll({ limit: 5 })
    
    // Test other queries
    const [coins, spinWheel, forum] = await Promise.all([
      db.coins.getUserBalance('test'),
      db.spinWheel.getPrizes(),
      db.forum.getCategories()
    ]).catch(e => {
      console.log('Some queries failed:', e)
      return [0, [], []]
    })
    
    return NextResponse.json({
      success: true,
      supabaseConnected: true,
      assetsCount: assets.length,
      testResults: {
        assets: assets.length,
        coins: typeof coins,
        spinWheel: Array.isArray(spinWheel) ? spinWheel.length : 'not array',
        forum: Array.isArray(forum) ? forum.length : 'not array'
      }
    })
    
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
