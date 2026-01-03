import { createBrowserClient } from "@supabase/ssr"
import { CONFIG } from "@/lib/config"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

// PRODUCTION-READY SUPABASE CLIENT
export function createClient() {
  // Return cached client if exists
  if (supabaseClient) return supabaseClient

  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    console.warn("[Supabase Client] ⚠️ Called on server side, returning null")
    return null as any
  }

  const url = CONFIG.supabase.url
  const anonKey = CONFIG.supabase.anonKey

  if (!url || !anonKey) {
    console.error("[Supabase Client] ❌ CRITICAL: Missing configuration")
    console.error("URL:", url ? "✅" : "❌", "Key:", anonKey ? "✅" : "❌")
    return null as any
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

  return supabaseClient
}

// Enhanced connection status
export async function testConnection() {
  try {
    const client = createClient()
    if (!client) return { success: false, error: "Client not initialized" }
    const { data, error } = await client.from('users').select('count').limit(1)
    return { success: !error, error: error?.message }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// Aliases for backward compatibility
export const getSupabaseBrowserClient = createClient

// Lazy initialization - don't create client at module load time
export function getSupabase() {
  return createClient()
}
