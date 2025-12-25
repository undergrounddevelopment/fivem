import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_CONFIG } from "./config"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

  supabaseClient = createBrowserClient(url, anonKey)

  return supabaseClient
}

// Aliases for backward compatibility
export const getSupabaseBrowserClient = createClient
export const supabase = createClient
