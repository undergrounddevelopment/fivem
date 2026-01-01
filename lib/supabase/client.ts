import { createBrowserClient } from "@supabase/ssr"
import { CONFIG } from "@/lib/config"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

// PRODUCTION-READY SUPABASE CLIENT
export function createClient() {
  if (supabaseClient) return supabaseClient

  const url = CONFIG.supabase.url
  const anonKey = CONFIG.supabase.anonKey

  if (!url || !anonKey) {
    console.error("[Supabase Client] ❌ CRITICAL: Missing configuration")
    console.error("URL:", url ? "✅" : "❌", "Key:", anonKey ? "✅" : "❌")
    throw new Error("Supabase configuration is required")
  }

  console.log("[Supabase Client] ✅ Initializing with URL:", url)
  
  supabaseClient = createBrowserClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'fivem-tools-v7',
      },
    },
  })

  // Test connection on initialization
  supabaseClient.from('users').select('count').limit(1)
    .then(({ error }) => {
      if (error) {
        console.error("[Supabase Client] ❌ Connection test failed:", error.message)
      } else {
        console.log("[Supabase Client] ✅ Connection test successful")
      }
    })
    .catch(err => {
      console.error("[Supabase Client] ❌ Connection error:", err)
    })

  return supabaseClient
}

// Enhanced connection status
export async function testConnection() {
  try {
    const client = createClient()
    const { data, error } = await client.from('users').select('count').limit(1)
    return { success: !error, error: error?.message }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// Aliases for backward compatibility
export const getSupabaseBrowserClient = createClient
export const supabase = createClient()
