// Auto-initialize database tables on first API call
// This ensures all required tables exist

import { createAdminClient } from "@/lib/supabase/server"

let isInitialized = false

export async function ensureTablesExist() {
  if (isInitialized) return true

  try {
    const supabase = await createAdminClient()

    // Check if banners table exists by trying to select from it
    const { error: bannersError } = await supabase.from("banners").select("id").limit(1)

    if (bannersError?.code === "42P01") {
      // Table doesn't exist, need to run migrations
      console.log("[DB] Banners table not found, please run SQL migrations")
      return false
    }

    // Check announcements table
    const { error: announcementsError } = await supabase.from("announcements").select("id").limit(1)

    if (announcementsError?.code === "42P01") {
      console.log("[DB] Announcements table not found, please run SQL migrations")
      return false
    }

    isInitialized = true
    return true
  } catch (error) {
    console.error("[DB] Error checking tables:", error)
    return false
  }
}

export async function getTableStatus() {
  try {
    const supabase = await createAdminClient()

    const tables = [
      "users",
      "banners",
      "announcements",
      "forum_categories",
      "forum_threads",
      "spin_wheel_prizes",
      "spin_history",
      "daily_claims",
      "file_uploads",
      "site_settings",
    ]

    const status: Record<string, boolean> = {}

    for (const table of tables) {
      const { error } = await supabase.from(table).select("*").limit(1)
      status[table] = !error || error.code !== "42P01"
    }

    return status
  } catch (error) {
    console.error("[DB] Error getting table status:", error)
    return null
  }
}
