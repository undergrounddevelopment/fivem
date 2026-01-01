// Export Supabase clients
import { createClient, createAdminClient } from "./supabase/server"

export { createClient, createAdminClient }

// Export query modules
export { default as queries } from "./db/queries"
export * from "./db/types"

// Helper function for getting Supabase client
export async function getDb() {
  return await createClient()
}

export async function getAdminDb() {
  return createAdminClient()
}

export const db = {
  // Query modules from lib/db/queries.ts
  coins: async () => {
    const { coinsQueries } = await import("./db/queries")
    return coinsQueries
  },
  forum: async () => {
    const { forumQueries } = await import("./db/queries")
    return forumQueries
  },
  spinWheel: async () => {
    const { spinWheelQueries } = await import("./db/queries")
    return spinWheelQueries
  },
  admin: async () => {
    const { adminQueries } = await import("./db/queries")
    return adminQueries
  },
  assets: async () => {
    const { assetsQueries } = await import("./db/queries")
    return assetsQueries
  },

  // Direct query method for PostgreSQL-style queries
  query: async (sql: string, params?: any[]) => {
    console.warn("[db.query] Direct SQL queries not supported. Use Supabase client methods instead.")
    return { rows: [], rowCount: 0 }
  },
}

// Legacy database helper functions
export async function getAssets(category?: string) {
  const { assetsQueries } = await import("./db/queries")
  return assetsQueries.getAll({ category, limit: 100 })
}

export async function getUsers() {
  const supabase = await createClient()
  const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false }).limit(100)
  return data || []
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const [users, assets, threads] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("assets").select("*", { count: "exact", head: true }),
    supabase.from("forum_threads").select("*", { count: "exact", head: true }),
  ])

  return {
    totalUsers: users.count || 0,
    totalAssets: assets.count || 0,
    totalThreads: threads.count || 0,
  }
}

export async function updateAsset(id: string, data: any) {
  const supabase = createAdminClient()
  const { data: asset, error } = await supabase.from("assets").update(data).eq("id", id).select().single()
  if (error) throw error
  return asset
}

export async function deleteAsset(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("assets").delete().eq("id", id)
  if (error) throw error
  return { success: true }
}
