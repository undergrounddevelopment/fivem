import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_CONFIG } from "./config"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

import { CONFIG } from "@/lib/config"

export function createClient() {
  if (supabaseClient) return supabaseClient

  const url = CONFIG.supabase.url
  const anonKey = CONFIG.supabase.anonKey

  supabaseClient = createBrowserClient(url, anonKey)

  return supabaseClient
}

// Aliases for backward compatibility
export const getSupabaseBrowserClient = createClient
export const supabase = createClient
