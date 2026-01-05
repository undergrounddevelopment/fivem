import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { CONFIG } from "@/lib/config"

// PRODUCTION-READY SERVER CLIENT
export function createClient() {
  const url = CONFIG.supabase.url
  const anonKey = CONFIG.supabase.anonKey

  if (!url || !anonKey) {
    console.error("[Supabase Server] ❌ CRITICAL: Missing configuration")
    console.error("URL:", url ? "✅" : "❌", "Key:", anonKey ? "✅" : "❌")
    throw new Error("Supabase server configuration is required")
  }

  // For API routes, use simple client without cookies
  return createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
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
  const anonKey = CONFIG.supabase.anonKey

  if (!url) {
    console.error("[Supabase Admin] ❌ Missing Supabase URL")
    throw new Error("Supabase admin client requires SUPABASE_URL")
  }

  const key = serviceKey || anonKey
  if (!key) {
    console.error("[Supabase Admin] ❌ No Supabase credentials available")
    throw new Error("Supabase admin client requires SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  if (!serviceKey) {
    console.warn("[Supabase Admin] ⚠️ Service role key missing, falling back to anon key (read-only access)")
  }

  return createSupabaseClient(url, key, {
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
    const client = createClient()
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
