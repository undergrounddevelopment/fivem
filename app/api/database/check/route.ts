import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test koneksi dan ambil data real
    const results = await Promise.allSettled([
      supabase.from("users").select("count", { count: "exact" }),
      supabase.from("assets").select("count", { count: "exact" }),
      supabase.from("forum_categories").select("count", { count: "exact" }),
      supabase.from("forum_threads").select("count", { count: "exact" }),
      supabase.from("announcements").select("count", { count: "exact" }),
      supabase.from("downloads").select("count", { count: "exact" }),
    ])

    const stats = {
      users: results[0].status === "fulfilled" ? results[0].value.count || 0 : 0,
      assets: results[1].status === "fulfilled" ? results[1].value.count || 0 : 0,
      categories: results[2].status === "fulfilled" ? results[2].value.count || 0 : 0,
      threads: results[3].status === "fulfilled" ? results[3].value.count || 0 : 0,
      announcements: results[4].status === "fulfilled" ? results[4].value.count || 0 : 0,
      downloads: results[5].status === "fulfilled" ? results[5].value.count || 0 : 0,
    }

    // Ambil data sample untuk verifikasi
    const sampleData = await Promise.allSettled([
      supabase.from("users").select("username, created_at").limit(5),
      supabase.from("assets").select("title, category").limit(5),
      supabase.from("announcements").select("title, message").limit(3),
    ])

    const samples = {
      users: sampleData[0].status === "fulfilled" ? sampleData[0].value.data || [] : [],
      assets: sampleData[1].status === "fulfilled" ? sampleData[1].value.data || [] : [],
      announcements: sampleData[2].status === "fulfilled" ? sampleData[2].value.data || [] : [],
    }

    return NextResponse.json({
      success: true,
      connected: true,
      timestamp: new Date().toISOString(),
      stats,
      samples,
      errors: results.map((r, i) => 
        r.status === "rejected" ? { table: ["users", "assets", "categories", "threads", "announcements", "downloads"][i], error: r.reason } : null
      ).filter(Boolean)
    })

  } catch (error) {
    console.error("Database check error:", error)
    return NextResponse.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}