/**
 * Direct Supabase Client - Bypasses any middleware/config issues
 * Use this for critical operations that must work 100%
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js"

let directClient: SupabaseClient | null = null

export function getDirectSupabaseClient(): SupabaseClient {
  if (directClient) return directClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error("[Direct Supabase] Missing credentials:")
    console.error("  URL:", url ? "✅" : "❌ MISSING")
    console.error("  Service Key:", serviceKey ? "✅" : "❌ MISSING")
    throw new Error("Missing Supabase credentials - check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  }

  directClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log("[Direct Supabase] Client initialized with URL:", url)
  return directClient
}

/**
 * Get user by discord_id - returns full user object
 */
export async function getUserByDiscordId(discordId: string) {
  const supabase = getDirectSupabaseClient()
  
  const { data, error } = await supabase
    .from("users")
    .select("id, discord_id, username, avatar, membership, xp, level, coins")
    .eq("discord_id", discordId)
    .single()

  if (error) {
    console.error("[Direct Supabase] getUserByDiscordId error:", error)
    return null
  }

  return data
}

/**
 * Get users by their IDs (can be UUID or discord_id)
 */
export async function getUsersByIds(ids: string[]): Promise<Record<string, any>> {
  if (!ids || ids.length === 0) return {}
  
  const supabase = getDirectSupabaseClient()
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  const usersMap: Record<string, any> = {}

  // Try UUID match first
  const { data: byUUID } = await supabase
    .from("users")
    .select("id, discord_id, username, avatar, membership, xp, level")
    .in("id", uniqueIds)

  for (const user of byUUID || []) {
    usersMap[user.id] = user
  }

  // Try discord_id match for missing
  const foundIds = new Set(Object.keys(usersMap))
  const missingIds = uniqueIds.filter(id => !foundIds.has(id))

  if (missingIds.length > 0) {
    const { data: byDiscord } = await supabase
      .from("users")
      .select("id, discord_id, username, avatar, membership, xp, level")
      .in("discord_id", missingIds)

    for (const user of byDiscord || []) {
      usersMap[user.discord_id] = user
    }
  }

  return usersMap
}
