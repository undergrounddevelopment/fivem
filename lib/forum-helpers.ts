import { createClient } from "@supabase/supabase-js"

// Direct Supabase connection - bypasses any config issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

function getDirectSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[forum-helpers] Missing Supabase credentials")
    throw new Error("Missing Supabase credentials")
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export interface ForumAuthor {
  id: string
  username: string
  avatar: string | null
  membership: string
  xp?: number
  level?: number
}

/**
 * Fetch authors by their IDs (can be UUID or discord_id)
 * Returns a map of author_id -> author data
 */
export async function fetchAuthorsMap(authorIds: string[]): Promise<Record<string, ForumAuthor>> {
  if (!authorIds || authorIds.length === 0) return {}
  
  const authorsMap: Record<string, ForumAuthor> = {}
  const uniqueIds = [...new Set(authorIds.filter(Boolean))]

  if (uniqueIds.length === 0) return {}

  console.log(`[fetchAuthorsMap] Looking up ${uniqueIds.length} author IDs:`, uniqueIds)

  try {
    const supabase = getDirectSupabase()

    // Step 1: Try UUID match first (for newer schema where author_id is UUID)
    const { data: authorsByUUID, error: uuidError } = await supabase
      .from("users")
      .select("id, discord_id, username, avatar, membership, xp, level")
      .in("id", uniqueIds)

    if (uuidError) {
      console.error("[fetchAuthorsMap] UUID query error:", uuidError)
    }

    console.log(`[fetchAuthorsMap] UUID match found ${authorsByUUID?.length || 0} users`)

    for (const author of authorsByUUID || []) {
      if (author.id) {
        authorsMap[author.id] = {
          id: author.discord_id || author.id,
          username: author.username || "User",
          avatar: author.avatar,
          membership: author.membership || "member",
          xp: author.xp || 0,
          level: author.level || 1,
        }
      }
    }

    // Step 2: For any missing IDs, try discord_id match (backward compatibility)
    const foundIds = new Set(Object.keys(authorsMap))
    const missingIds = uniqueIds.filter(id => !foundIds.has(id))

    console.log(`[fetchAuthorsMap] Missing IDs after UUID match:`, missingIds)

    if (missingIds.length > 0) {
      const { data: authorsByDiscord, error: discordError } = await supabase
        .from("users")
        .select("id, discord_id, username, avatar, membership, xp, level")
        .in("discord_id", missingIds)

      if (discordError) {
        console.error("[fetchAuthorsMap] Discord ID query error:", discordError)
      }

      console.log(`[fetchAuthorsMap] Discord ID match found ${authorsByDiscord?.length || 0} users`)

      for (const author of authorsByDiscord || []) {
        if (author.discord_id) {
          authorsMap[author.discord_id] = {
            id: author.discord_id,
            username: author.username || "User",
            avatar: author.avatar,
            membership: author.membership || "member",
            xp: author.xp || 0,
            level: author.level || 1,
          }
        }
      }
    }

    console.log(`[fetchAuthorsMap] Final map has ${Object.keys(authorsMap).length} authors`)
    return authorsMap
  } catch (error) {
    console.error("[fetchAuthorsMap] Error:", error)
    return {}
  }
}

/**
 * Get a single author by ID (UUID or discord_id)
 */
export async function fetchAuthor(authorId: string): Promise<ForumAuthor | null> {
  if (!authorId) return null
  
  const map = await fetchAuthorsMap([authorId])
  return map[authorId] || null
}

/**
 * Format author for API response - never returns null, always returns valid author object
 */
export function formatAuthor(author: ForumAuthor | null | undefined, fallbackId?: string): ForumAuthor {
  if (author && author.username) {
    return {
      id: author.id || fallbackId || "unknown",
      username: author.username,
      avatar: author.avatar,
      membership: author.membership || "member",
      xp: author.xp || 0,
      level: author.level || 1,
    }
  }
  
  // Return default author if not found
  return {
    id: fallbackId || "unknown",
    username: "User",
    avatar: null,
    membership: "member",
    xp: 0,
    level: 1,
  }
}
