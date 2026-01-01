import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { CONFIG } from "@/lib/config"

// PRODUCTION-READY SERVER CLIENT
export async function createClient() {
  const url = CONFIG.supabase.url
  const anonKey = CONFIG.supabase.anonKey

  if (!url || !anonKey) {
    console.error("[Supabase Server] ❌ CRITICAL: Missing configuration")
    console.error("URL:", url ? "✅" : "❌", "Key:", anonKey ? "✅" : "❌")
    throw new Error("Supabase server configuration is required")
  }

  const cookieStore = await cookies()
  
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          })
        } catch (error) {
          console.warn("[Supabase Server] Cookie setting failed (Server Component):", error)
        }
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'fivem-tools-v7-server',
      },
    },
  })
}

// ADMIN CLIENT WITH SERVICE ROLE
export function createAdminClient() {
  const url = CONFIG.supabase.url
  const serviceKey = CONFIG.supabase.serviceKey

  if (!url || !serviceKey) {
    console.error("[Supabase Admin] ❌ Service role key missing!")
    throw new Error("Supabase admin client requires service role key")
  }

  console.log("[Supabase Admin] ✅ Creating admin client with service role")
  
  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'fivem-tools-v7-admin',
      },
    },
  })
}

// CONNECTION TESTING
export async function testServerConnection() {
  try {
    const client = await createClient()
    const { data, error } = await client.from('users').select('count').limit(1)
    return { success: !error, error: error?.message }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function testAdminConnection() {
  try {
    const client = createAdminClient()
    const { data, error } = await client.from('users').select('count').limit(1)
    return { success: !error, error: error?.message }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// Aliases for backward compatibility
export const getSupabaseServerClient = createClient
export const getSupabaseAdminClient = createAdminClient
