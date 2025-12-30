import { createAdminClient } from "./supabase/server"

export async function testDatabaseConnection() {
  try {
    const supabase = createAdminClient()
    
    // Test connection
    const { data, error } = await supabase.from("users").select("count").limit(1)
    
    if (error) {
      console.error("❌ Database connection failed:", error.message)
      return false
    }
    
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection error:", error)
    return false
  }
}

export async function initializeDatabase() {
  const supabase = createAdminClient()
  
  // Check if tables exist
  const tables = ["users", "assets", "forum_threads", "spin_tickets", "prizes"]
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select("count").limit(1)
    if (error) {
      console.error(`❌ Table ${table} not found or error:`, error.message)
    } else {
      console.log(`✅ Table ${table} exists`)
    }
  }
}
