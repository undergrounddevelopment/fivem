import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_CONFIG } from "./config"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  const url = SUPABASE_CONFIG.url
  const anonKey = SUPABASE_CONFIG.anonKey

  supabaseClient = createBrowserClient(url, anonKey)

  return supabaseClient
}

export const getSupabaseBrowserClient = createClient
export const supabase = createClient
